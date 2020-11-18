import Sound from 'pixi-sound'

import utils from '@/libs/utils/index.js'

import Game from '@/libs/Game.js'

// 解析谱面，游戏主控逻辑
export default class KeyController {
  constructor (noteData = {}) {
    // 记录谱面信息
    this.data = noteData
    // 单独记录谱面和变速信息
    this.notes = utils.obj.isArray(noteData.notes) ? noteData.notes : []
    this.speedChanges = utils.obj.isArray(noteData.speedChanges) ? noteData.speedChanges : []
    // 游戏得分
    this.score = 0
    // 游戏是否播放音频
    this._isMusicPlay = false
    
    this.init()
  }
  
  init () {
    const gameConfig = Game.config.game
    
    // 按键的下落时间
    const keyMoveTime = gameConfig.keyMoveTime / gameConfig.keySpeed
    // 纵向下落的标准平均速度，单位ms
    this.standardVA = gameConfig.keyDistanceY / keyMoveTime
    // 纵向下落的标准初速度
    this.standardV0 = gameConfig.keyMoveSpeedInitial
    // 纵向下落的标准加速度
    this.standardA = (gameConfig.keyDistanceY - this.standardV0 * keyMoveTime) / (0.5 * keyMoveTime * keyMoveTime)
  }
  
  // 游戏启动
  start () {
    // 初始化计时器
    const gameConfig = Game.config.game
    const timeBeforeStart = utils.obj.isValidNum(gameConfig.timeBeforeStart) && gameConfig.timeBeforeStart >= 3000 ? gameConfig.timeBeforeStart : 3000
    this.curTimeStamp = Date.now()
    this.curTime = timeBeforeStart * (-1)
    
    // 游戏循环
    Game.ticker.add(this.onUpdate, this)
  }
  
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
    if (!this._isMusicPlay && this.curTime >= 0) {
      // 过了延时时间后，播放BGM
      this.playMusic()
    }
    
    this.curTimeStamp = nowTimeStamp
  }
}