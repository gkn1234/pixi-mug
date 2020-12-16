import Sound from 'pixi-sound'
import { AnimatedSprite, Sprite } from 'pixi.js'

import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'
import Pool from '@/libs/Pool.js'

import NoteUtils from './NoteUtils.js'
import MapData from './MapData.js'
import GestureCatcher from './GestureCatcher.js'
import Tap from './Tap.js'
import Slide from './Slide.js'
import Hold from './Hold.js'

import JudgeLevel from '../ui/JudgeLevel.js'
import ComboShow from '../ui/ComboShow.js'

// 解析谱面，游戏主控逻辑
export default class NoteController {
  constructor (data = {}, scene) {
    // 记录谱面信息
    this._data = data
    // 游戏场景对象
    this.scene = scene
    
    this._init()
  }
  
  static NOTE_CONSTRUCTOR = {
    AnimatedSprite: AnimatedSprite,
    Sprite: Sprite,
    Tap: Tap,
    Slide: Slide,
    Hold: Hold,
    HoldItem: Hold.HoldItem
  }
  
  _init () {
    // 创建按键对象池
    this._initNotePool()
    // 初始化资源等信息
    this._initResources()
    // 初始化UI
    this._initUI()
    // 初始化按键判定
    this._initNoteJudge()
    // 初始化基本信息
    this._initBaseInfo()
    // 初始化谱面
    this._initNotes()
    // 初始化声音
    this._initSounds()
  }
  
  // 初始化按键对象池
  _initNotePool () {
    NoteController.NOTE_CONSTRUCTOR.Sprite = PIXI.projection.Sprite2d
    this.notePool = {}
    for (let key in NoteController.NOTE_CONSTRUCTOR) {
      this.notePool[key] = new Pool(NoteController.NOTE_CONSTRUCTOR[key])
    }
  }
  
  // 初始化按键判定
  _initNoteJudge () {
    this.catcher = new GestureCatcher(this)
    this.catcher.setCallback('onGestureUpdate', (e) => {
      if (e.state !== 'hold') {
        console.log('手势状态更新', e.state, e.id)
      }
    })
  }
  
  // 初始化资源等信息
  _initResources () {
    const gameConfig = Game.config.game
    // 按键击打特效获取
    this.noteAnimations = gameConfig.judgeAnimationSrc.map((animation) => {
      return Game.sheet.animations[animation]
    })
  }
  
  // 初始化UI
  _initUI () {
    this.ui= {}
    // 初始化按键下落版面、容器框架
    this._initNoteContainer()
    
    const { containerWidth } = NoteUtils.getValidSize()
    
    // 创建按键判定特效，
    const judgeUI = new JudgeLevel()
    this.ui.judge = judgeUI
    
    // 创建连击UI
    const comboUI = new ComboShow()
    this.ui.combo = comboUI
    
    // 创建计分UI
    
    // 创建标题UI
  }
  
  // 初始化按键下落版面、容器框架
  _initNoteContainer () {
    const gameConfig = Game.config.game
    const size = NoteUtils.getValidSize()
    
    // 背景封面图
    
    // 按键容器，内部所有内容都会进行仿射变换，注意原点在容器底部中心(要注意容器在判定线以上)
    this.container = new PIXI.projection.Container2d()
    this.container.position.set(Game.config.width / 2, size.trueHeight)
    
    // 容器皮肤
    const containerSkin = new PIXI.projection.Sprite2d(Game.sheet.textures[gameConfig.containerSrc])
    containerSkin.anchor.set(0.5, 1)
    containerSkin.width = size.containerWidth * (size.trueHeight / size.containerHeight)
    containerSkin.height = size.effHeight
    
    // 对容器做仿射变化，起到3D转2D的效果
    this.container.proj.setAxisY(size.affinePoint, -1)
    
    // 加入底部判定线
    const judgeLine = new Sprite(Game.sheet.textures[gameConfig.judgeSrc])
    judgeLine.width = size.containerWidth
    judgeLine.height = size.judgeHeight
    judgeLine.anchor.set(0.5, 0)
    judgeLine.position.set(Game.config.width / 2, size.trueHeight)
    
    // 装入舞台
    this.scene.addChild(this.container)
    this.scene.addChild(judgeLine)
    this.container.addChild(containerSkin)
  }
  
  // 初始化基本属性
  _initBaseInfo () {
    const gameConfig = Game.config.game
    
    // 获取音乐的BPM
    this.bpm = utils.obj.isValidNum(this._data.bpm) && this._data.bpm > 0 ? this._data.bpm : 100
    // 长按保持时间，我们希望能够做多包容8分音符，所以这里传参为7分音符
    this.limitTime = this.getNoteDuration(7)
    // 按键miss时间
    this.missTime = this.getJudgeTime(-1)
  }
  
  // 初始化谱面
  _initNotes () {
    this.map = new MapData(this._data)
  }
  
  // 初始化声音
  _initSounds () {
    const gameConfig = Game.config.game
    this.bgm = Game.loader.resources[gameConfig.bgm].sound
    this.bgm.singleInstance = true
  }
  
  // 设置游戏启动参数
  _startSettings () {
    // 初始化计时器
    const gameConfig = Game.config.game
    const { timeBeforeStart, startDelay } = NoteUtils.getDelayData()
    // 起始时间
    this.curTime = timeBeforeStart * (-1)
    // 按键延迟时间
    this.startDelay = startDelay
    // 当前待判定的按键
    this.children = new Set()
    // 谱面指针设置为开头
    this.map.begin()
    
    // 游戏是否播放音频
    this._isMusicPlay = false
    // 初始化统计UI
    this.ui.judge.reset()
    this.ui.combo.reset()
    
    // 当前的得分
    this.score = 0
  }
  
  // 游戏启动
  start () {
    this._startSettings()
    
    // 游戏循环
    Game.ticker.add(this.onUpdate, this)
    // 启动手势判定
    this.catcher.start()
  }
  
  // 游戏暂停
  pause () {
    Game.ticker.stop()
    this.catcher.stop()
    this.bgm.pause()
  }
  
  // 游戏恢复
  resume () {
    Game.ticker.start()
    this.catcher.start()
    this.bgm.resume()
  }
  
  // 游戏重开
  restart () {
    this.children.forEach((child) => {
      this.removeNote(child)
    })
    
    // 初始化游戏参数
    this._startSettings()
    // 启动游戏循环
    Game.ticker.start()
    this.catcher.start()
  }
  // 游戏结束
  
  // 播放音乐
  playMusic () {
    this._isMusicPlay = true
    this.bgm.play()
  }
  
  // 每一帧的屏幕刷新
  onUpdate () {
    const delta = Game.ticker.elapsedMS
    this.curTime = this.curTime + delta
    // console.log(this.curTime, nowTimeStamp, deltaStamp)
    if (!this._isMusicPlay && this.curTime >= this.startDelay * (-1)) {
      // 过了延时时间后，播放BGM
      this.playMusic()
    }
    
    // 更新谱面指针
    const notes = this.map.forward(this.curTime)
    notes.forEach((note) => {
      // 将当前时间的按键加入版面
      const noteObj = this.notePool[note.type].get()
      noteObj.init(note, this)
      noteObj.addToStage()
    })
    
    // 获取变速参数
    const speedChange = this.map.getCurrentSpeed()
    this.children.forEach((child) => {
      // 再更新待判定的按键
      child.onUpdate(delta, speedChange)
    })
    
    // 进行一轮按键判定
    this.catcher.judge()
  }
  
  // 判定了一个按键
  judgeNote (note) {
    // 删除按键
    note.removeFromStage()
    
    // 播放打击特效
    this.tapAnimate(note.level, note.x)
    // 播放判定文字特效
    this.ui.judge.trigger(note.level, this.scene)
    // 结算连击
    this.ui.combo.trigger(this.scene)
    console.log('判定', note.pos, note.level, note.timeOffset, this.curTime)
  }
  
  // miss判定
  judgeMiss (note) {
    // 判断按键是否miss
    const level = note.hasOwnProperty('level') && note.level >= 0 ? note.level : -1
    if (level < 0) {
      this.ui.judge.trigger(level, this.scene)
      this.ui.combo.miss()
      console.log('miss')
    }
  }
 
  // 播放按键击中特效
  tapAnimate (level, x) {
    if (level < 0) {
      return
    }
    
    const { trueHeight, containerWidth, effWidth, trueWidth } = NoteUtils.getValidSize()
    const gameConfig = Game.config.game
    const animation = this.noteAnimations[level]
    const animationSprite = this.notePool.AnimatedSprite.get(level, animation)
    animationSprite.loop = false
    animationSprite.animationSpeed = 0.3
    // 位置
    animationSprite.anchor.set(0.5, 0.5)
    animationSprite.x = NoteUtils.eff2RawX(x)
    animationSprite.y = trueHeight
    // 大小
    animationSprite.scale.set(6)
    // 动画播放完成后
    animationSprite.onComplete = () => {
      this.scene.removeChild(animationSprite)
      animationSprite.onComplete = () => {}
    }
    this.scene.addChild(animationSprite)
    animationSprite.play()
  }
  
  // 获取X分音符的时间长度
  getNoteDuration (divide = 8) {
    // BPM的意义是一分钟4分音符的数量，先计算出4分音符的长度
    const baseDuration = 60 * 1000 / this.bpm
    const ratio = 4 / divide
    return baseDuration * ratio
  }
  
  // 获取判定时间 -1也可以代表miss
  getJudgeTime (level = 0) {
    const gameConfig = Game.config.game
    if (!utils.obj.isArray(gameConfig.judgeTime) || level < -1 || level >= gameConfig.judgeTime.length) {
      throw new Error('Invalid judge time config!')
    }
    if (level === -1) {
      level = gameConfig.judgeTime.length - 1
    }
    return gameConfig.judgeTime[level]
  }
}