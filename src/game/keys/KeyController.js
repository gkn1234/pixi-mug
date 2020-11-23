import Sound from 'pixi-sound'
import { Sprite } from 'pixi.js'

import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'
import Pool from '@/libs/Pool.js'

import KeyCatcher from './KeyCatcher.js'
import Tap from './Tap.js'

// 解析谱面，游戏主控逻辑
export default class KeyController {
  constructor (noteData = {}, scene) {
    // 记录谱面信息
    this.data = noteData
    // 游戏场景对象
    this.scene = scene
    
    this._init()
  }
  
  static NOTE_CONSTRUCTOR = {
    Sprite: Sprite,
    Tap: Tap
  }
  
  _init () {
    // 初始化基本信息
    this._initBaseInfo()
    // 读取并解析谱面
    this._resolveNotes()
    // 创建按键对象池
    this._initNotePool()
    // 初始化按键判定
    this._initKeyJudge()
  }
  
  // 初始化基本属性
  _initBaseInfo () {
    const gameConfig = Game.config.game
    
    // 获取音乐的BPM
    this.bpm = utils.obj.isValidNum(this.data.bpm) && this.data.bpm > 0 ? this.data.bpm : 100
    // 长按保持时间，我们希望能够做多包容8分音符，所以这里传参为7分音符
    this.limitTime = this.getNoteDuration(7)
    // 按键miss时间
    this.missTime = gameConfig.judgeTime[gameConfig.judgeTime.length - 1]
    
    // 按键的标准下落时间
    const keyMoveTime = gameConfig.keyMoveTime / gameConfig.keySpeed
    this.keyMoveTime = keyMoveTime
    // 按键下落到判断点的距离
    this.keyDistanceYToJudge = gameConfig.keyDistanceY - gameConfig.judgeLineToBottom
    // 纵向下落的标准平均速度，单位ms
    this.standardVA = this.keyDistanceYToJudge / keyMoveTime
    // 纵向下落的标准初速度
    this.standardV0 = gameConfig.keyMoveSpeedInitial
    // 纵向下落的标准加速度
    this.standardA = (this.keyDistanceYToJudge - this.standardV0 * keyMoveTime) / (0.5 * keyMoveTime * keyMoveTime)
    
    // 音乐播放前的空白时间
    this.timeBeforeStart = utils.obj.isValidNum(gameConfig.timeBeforeStart) && gameConfig.timeBeforeStart >= 3000 ? gameConfig.timeBeforeStart : 3000
    
  }
  
  // 读取并解析谱面
  _resolveNotes () {
    if (!utils.obj.isArray(this.data.notes) || !utils.obj.isArray(this.data.speedChanges)) {
      this.notes = []
      this.speedChanges = []
      return
    }
    
    // 预处理
    // 处理掉不合法的变速对象
    let len = this.data.speedChanges.length
    for (let i = 0; i < len; i++) {
      let speedObj = this.data.speedChanges[i]
      if (speedObj.speed < 0 || speedObj.start < 0 || speedObj.end < 0 || speedObj.end <= speedObj.start) {
        this.data.speedChanges.splice(i, 1)
        i--
      }
    }
    // 按时间升序排序谱面和变速
    this.data.notes.sort((a, b) => {
      return a.time - b.time
    })
    this.data.speedChanges.sort((a, b) => {
      return a.start - b.start
    })
    this.speedChanges = this.data.speedChanges
    
    // 正式处理，解析谱面
    len = this.data.notes.length
    for (let i = 0; i < len; i++) {
      let note = this.data.notes[i]
      // 剔除时间不合法的以及类型不合法的
      if (note.time < 0 || !utils.obj.isValidNum(note.time) || !KeyController.NOTE_CONSTRUCTOR[note.type]) {
        this.data.notes.splice(i, 1)
        i--
      }
      else {
        note = this._resolveSpeedChange(note)
      }
    }
    this.notes = this.data.notes
  }
  
  // 解析按键的变速问题，计算开始下落的时间点，和开始下落的位置
  _resolveSpeedChange (note) {
    // 初始化变速序列
    let speedSections = [{ start: this.timeBeforeStart * (-1), end: note.time, speed: 1 }]
    let len = this.speedChanges.length
    for (let i = 0; i < len; i++) {
      const speedObj = this.speedChanges[i]
      if (speedObj.end <= note.time - this.keyMoveTime && this.speedChanges[i + 1] && this.speedChanges[i + 1].start >= note.time) {
        // 不受变速影响，会均匀到达底部的按键
        note.start = note.time - this.keyMoveTime
        return note
      }
      if (speedObj.start >= note.time) {
        // 遇到靠后的变速，此时按键已经落到判定线，后续变速也再无影响
        break
      }
      // 切割时间变速序列
      this._cutSpeedSections(speedSections, speedObj)
    }
    
    len =  speedSections.length
    let s = 0
    // 根据relativeSpeedChange中的变速对象，计算按键从顶部出现的准确时间
    for (let i = len - 1; i >= 0; i--) {
      const section = speedSections[i]
      const v = section.speed * this.standardVA
      const t = section.end - section.start
      if (s + v * t >= this.keyDistanceYToJudge) {
        // 距离超限，说明下落点就在这一段
        const tLeft = (this.keyDistanceYToJudge - s) / v
        note.start = section.end - tLeft
        return note
      }
      s = s + v * t
    }
    // 追溯到源头都无法走完路程，说明开头的起始位置不为0
    note.y0 = this.keyDistanceYToJudge - s
    note.start = 0
    
    // 如果note是连续键型，还要递归解析
    if (utils.obj.isArray(note.children) && note.children.length > 0) {
      len = note.children.length
      for (let i = 0; i < len; i++) {
        note.children[i] = this._resolveSpeedChange(note.children[i])
      }
    }
    
    return note
  }
  
  // 变速序列切割算法
  _cutSpeedSections (speedSections = [], speedObj) {
    const len = speedSections.length
    for (let i = 0; i < len; i++) {
      let section = speedSections[i]
      if (section.speed !== 1) {
        continue
      }
      if (speedObj.start >= section.end) {
        continue
      }
      
      if (speedObj.start <= section.start) {
        if (speedObj.end <= section.start) {
          break
        }
        if (speedObj.end >= section.end) {
          // 情况1 >= 左边界覆盖，右边界超出，实现完全覆盖
          section.speed = speedObj.speed
          return            
        }
        else {
          // 情况2 左边界重合，右边界不够
          const tail = section.end
          section.end = speedObj.end
          section.speed = speedObj.speed
          speedSections.push({
            start: speedObj.end,
            end: tail,
            speed: 1
          })
          return
        }
      }
      else {
        if (speedObj.end >= section.end) {
          // 情况3 >= 左边界不够，右边界超出
          const tail = section.end
          section.end = speedObj.start
          speedSections.push({
            start: speedObj.start,
            end: tail,
            speed: speedObj.speed
          })
          return            
        }
        else {
          // 情况4 >= 左边界不够，右边界也不够
          const tail = section.end
          section.end = speedObj.start
          speedSections.push({
            start: speedObj.start,
            end: speedObj.end,
            speed: speedObj.speed
          })
          speedSections.push({
            start: speedObj.end,
            end: tail,
            speed: 1
          })
          return
        }
      }
    }
  }
  
  // 初始化按键对象池
  _initNotePool () {
    this.notePool = {}
    for (let key in KeyController.NOTE_CONSTRUCTOR) {
      this.notePool[key] = new Pool(KeyController.NOTE_CONSTRUCTOR[key])
    }
  }
  
  // 初始化按键判定
  _initKeyJudge () {
    this.keyCatcher = new KeyCatcher(this, this.scene)
    this.keyCatcher.setCallback('onGestureUpdate', (e) => {
      // console.log('手势状态更新', e.state)
    })
  }
  
  // 设置游戏启动参数
  startSettings () {
    // 初始化计时器
    const gameConfig = Game.config.game
    this.curTimeStamp = Date.now()
    this.curTime = this.timeBeforeStart * (-1)
    // 按键延迟时间
    this.keyStartDelay = utils.obj.isValidNum(gameConfig.keyStartDelay) ? gameConfig.keyStartDelay : 0
    // 当前面板上呈现的按键
    this.children = new Set()
    // 当前遍历到的note索引
    this.noteIndex = 0
    // 当前的变速索引，-1为不变速，为几就是处于第几个变速对象
    this.speedChangeIndex = -1
    
    // 游戏是否播放音频
    this._isMusicPlay = false
    // 当前的得分
    this.score = 0    
  }
  
  // 游戏启动
  start () {
    this.startSettings()
    
    // 游戏循环
    Game.ticker.add(this.onUpdate, this)
    // 启动手势判定
    this.keyCatcher.start()
  }
  
  // 游戏暂停
  pause () {
    Game.ticker.stop()
    this.keyCatcher.stop()
    Sound.pause('bgm')
  }
  
  // 游戏恢复
  resume () {
    this.curTimeStamp = Date.now()
    Game.ticker.start()
    this.keyCatcher.start()
    Sound.resume('bgm')
  }
  
  // 游戏重开
  restart () {
    Game.ticker.stop()
    Sound.stop('bgm')
    this.children.forEach((child) => {
      // 清空屏幕上的精灵
      child.endDrop()
    })
    
    // 初始化游戏参数
    this.startSettings()
    // 启动游戏循环
    Game.ticker.start()
    this.keyCatcher.start()
  }
  // 游戏结束
  
  // 播放音乐
  playMusic () {
    this._isMusicPlay = true
    Sound.play('bgm')
  }
  
  // 每一帧的屏幕刷新
  onUpdate () {
    const nowTimeStamp = Date.now()
    const deltaStamp = nowTimeStamp - this.curTimeStamp
    this.curTime = this.curTime + deltaStamp
    // console.log(this.curTime, nowTimeStamp, deltaStamp)
    if (!this._isMusicPlay && this.curTime >= this.keyStartDelay * (-1)) {
      // 过了延时时间后，播放BGM
      this.playMusic()
    }
    
    while (this.noteIndex < this.notes.length && this.curTime >= this.notes[this.noteIndex].start) {
      // 将当前时间的按键加入版面
      const note = this.notePool[this.notes[this.noteIndex].type].get()
      note.init(this, this.notes[this.noteIndex])
      note.startDrop()
      // console.log(note)
      this.noteIndex++
    }
    
    // 判断当前是否处于变速区
    this.speedChangeIndex = this.speedChanges.findIndex((item) => {
      return item.start <= this.curTime && this.curTime <= item.end
    })
    
    this.children.forEach((child) => {
      // 更新按键
      child.onUpdate(deltaStamp)
    })
    
    // 进行一轮按键判定
    this.keyCatcher.judge(this.children)
    
    this.curTimeStamp = nowTimeStamp
  }
  
  // 判定成功记录
  setJudge (level, offset, note) {
    console.log('判定成功', note.pos, level, offset)
  }
  
  // 判定miss
  setMiss (note) {
    console.log('miss')
  }
  
  // 获取X分音符的时间长度
  getNoteDuration (divide = 8) {
    // BPM的意义是一分钟4分音符的数量，先计算出4分音符的长度
    const baseDuration = 60 * 1000 / this.bpm
    const ratio = 4 / divide
    return baseDuration * ratio
  }
}