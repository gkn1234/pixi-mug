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

// 解析谱面，游戏主控逻辑
export default class NoteController {
  constructor (data = {}, parent) {
    // 记录谱面信息
    this._data = data
    // 游戏场景对象
    this.scene = parent
    this.container = parent.noteContainer
    
    this._init()
  }
  
  static NOTE_CONSTRUCTOR = {
    AnimatedSprite: AnimatedSprite,
    Sprite: Sprite,
    Tap: Tap,
    Slide: Slide,
    Hold: Hold
  }
  
  _init () {
    // 创建按键对象池
    this._initNotePool()
    // 初始化按键判定
    this._initNoteJudge()
    // 初始化按键配置、资源等信息
    this._initNoteAnimations()
    // 初始化基本信息
    this._initBaseInfo()
    // 初始化谱面
    this._initNotes()
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
      console.log('手势状态更新', e.state, e.id)
    })
  }
  
  // 初始化按键配置、资源等信息
  _initNoteAnimations () {
    const gameConfig = Game.config.game
    // 按键击打特效获取
    this.noteAnimations = gameConfig.judgeAnimationSrc.map((animation) => {
      return this.scene.sheet.animations[animation]
    })
  }
  
  
  // 初始化基本属性
  _initBaseInfo () {
    const gameConfig = Game.config.game
    
    // 获取音乐的BPM
    this.bpm = utils.obj.isValidNum(this._data.bpm) && this._data.bpm > 0 ? this._data.bpm : 100
    // 长按保持时间，我们希望能够做多包容8分音符，所以这里传参为7分音符
    this.limitTime = this.getNoteDuration(7)
    // 按键miss时间
    this.missTime = gameConfig.judgeTime[gameConfig.judgeTime.length - 1]
  }
  
  // 初始化谱面
  _initNotes () {
    this.map = new MapData(this._data)
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
    // 当前已经判定的按键
    this.judgedChildren = new Set()
    // 谱面指针设置为开头
    this.map.begin()
    
    // 游戏是否播放音频
    this._isMusicPlay = false
    // 当前的得分
    this.score = 0
    // 当前的连击数
    this.combo = 0
    // 上一次判定的状态
    this.level = 0
    // 上一次判定的offset
    this.offset = 0
    
    // 同步到UI
    this.syncJudgeUI()
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
    Sound.pause('bgm')
  }
  
  // 游戏恢复
  resume () {
    Game.ticker.start()
    this.catcher.start()
    Sound.resume('bgm')
  }
  
  // 游戏重开
  restart () {
    Sound.stop('bgm')
    // 清空屏幕上的精灵
    this.judgedChildren.forEach((child) => {
      this.removeNote(child)
    })
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
    Sound.play('bgm')
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
      this.addNote(noteObj)
    })
    
    // 获取变速参数
    const speedChange = this.map.getCurrentSpeed()
    this.judgedChildren.forEach((child) => {
      // 先更新已判定区的按键
      child.onUpdate(delta, speedChange)
    })
    this.children.forEach((child) => {
      // 再更新待判定的按键
      child.onUpdate(delta, speedChange)
    })
    
    // 进行一轮按键判定
    this.catcher.judge(this.children)
  }
  
  // 添加一个按键
  addNote (note) {
    this.container.addChild(note.sprite)
    this.children.add(note)
  }
  
  // 判定了一个按键
  judgeNote (note) {
    // 待判定区删除此按键
    this.children.delete(note)
    // 按键从场景中移除
    this.container.removeChild(note.sprite)
    // 按键加入已判定区
    this.judgedChildren.add(note)
    
    // 播放打击特效
    this.tapAnimate(note.level, note.x)
  }
  
  // 移除一个按键
  removeNote (note) {
    if (note.hasOwnProperty('level') && note.level >= 0) {
      // 已判定的按键从已判定区中移除
      this.judgedChildren.delete(note)
    }
    else {
      // 未判定的按键从待判定区以及场景中移除
      this.children.delete(note)
      this.container.removeChild(note.sprite)
    }
    // 释放parent指针
    note.controller = null
  }
  
  // 判定成功结算
  showJudge (note) {
    if (!note.isComplete) {
      this.level = note.hasOwnProperty('level') && note.level >= 0 ? note.level : -1
      if (this.level < 0) {
        this.combo = 0
        console.log('miss')
      }
      else {
        this.combo++
        this.offset = note.offset      
        // console.log('判定结算', note.pos, this.level, this.offset)
      }
      this.syncJudgeUI()
      note.isComplete = true
    }
  }
  
  // 同步到判定UI
  syncJudgeUI () {
    Game.ui.$refs.judgeShow.judge(this.level, this.combo, this.offset)
  }
  
  // 播放按键击中特效
  tapAnimate (level, x) {
    if (level < 0) {
      return
    }
    
    const { trueHeight } = NoteUtils.getValidSize()
    const gameConfig = Game.config.game
    const animationIndex = level >= 1 ? level - 1 : 0
    const animation = this.noteAnimations[animationIndex]
    const animationSprite = this.notePool.AnimatedSprite.get(animationIndex, animation)
    animationSprite.loop = false
    animationSprite.animationSpeed = 0.3
    // 位置
    animationSprite.anchor.set(0, 0.5)
    console.log(x, NoteUtils.eff2RawX(x))
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
}