import Game from '@/libs/Game.js'
import utils from '@/libs/utils/index.js'

import NoteUtils from './NoteUtils.js'

export default class Tap {
  constructor () {}
  
  /*
    键位设置
    texture {Object} - 键位皮肤
    options {Object} - 键位参数
      @key {Number} [4] - 指定该键是几key下的按键，取值范围2 - 8
      @pos {Number} [1] - 指定该按键在第几条轨道上，0号轨道在最左边，取值范围0 - (key - 1)
      @offset {Number} [0] - 指定该键在原有标准位置下的偏移量，正数向右，负数向左。-4会偏移到左边一轨，4会偏移到右边一轨
      @style [0] - 指定键位使用keySetting.res数组中的第几个皮肤
  */
  init (options, controller) {
    this.controller = controller
    this._options = options
    this._checkInit()
    
    Object.assign(this, this._options)
    
    // 从对象池中获取Sprite
    this.sprite = this.controller.notePool.Sprite.get(this.textureName, this.texture)
    // 初始化按键位置信息
    this._initPos()
    // 初始化变速
    this.speedChangeIndex = 0
  }
  
  // 检查options和controller是否合理
  _checkInit () {
    if (this._options.constructor.name !== 'MapItem') {
      throw new Error('Invalid key options!')
    }
    if (this.controller.constructor.name !== 'NoteController') {
      throw new Error('Invalid key controller!')
    }
  }
  
  // 初始化位置参数
  _initPos () {
    this.sprite.width = this.width
    this.sprite.height = this.height
    
    // 初始锚点中心
    this.sprite.anchor.set(0.5, 0)
    
    this.sprite.x = this.x
    this.sprite.y = this.y
  }
  
  // 循环函数
  onUpdate (delta, speedChange) {    
    const time = this.controller.curTime
    delta = time - delta < this.start ? time - this.start : delta
    
    const { vStandard } = NoteUtils.getMoveData()
    const { containerHeight } = NoteUtils.getValidSize()
    const v = speedChange * vStandard
    const s = v * delta
    this.sprite.y = this.sprite.y + s
    
    // 落到判定线
    if (this.sprite.y >= 0 && !this.daoda) {
      console.log('到达', time, this.sprite.y, this.sprite.x)
      this.daoda = true
    }
    
    // 是否超出判定时间
    if (time - this.time > this.controller.missTime) {
      // 超出判定时间时，结算并展示判定结果
      console.log(time)
      this.controller.showJudge(this)
      this.controller.removeNote(this)
    }
  }
  
  // 判断手势位置是否在判定区
  isGesturePosIn (pos) {
    const gameConfig = Game.config.game
    
    const top = gameConfig.keyDistanceY - gameConfig.judgeLineToBottom - gameConfig.judgeWidth / 2
    const bottom = top + gameConfig.judgeWidth
    // console.log(pos.x, pos.y, top, bottom, this.judgeLeftX, this.judgeRightX)
    if (pos.y < top || pos.y > bottom) {
      // Y轴判断位置
      return false
    }
    if (pos.x < this.judgeLeftX || pos.x > this.judgeRightX) {
      return false
    }
    return true
  }
  
  // 获取判定等级
  getJudgeLevel (offset) {
    const gameConfig = Game.config.game
    if (offset < 0) {
      offset = offset * (-1)
    }
    const judgeTimeList = gameConfig.judgeTime
    const len = judgeTimeList.length
    for (let i = 0; i < len; i++) {
      const min = i === 0 ? 0 : judgeTimeList[i - 1]
      const max = judgeTimeList[i]
      if (offset >= min && offset < max) {
        return i
      }
    }
    return -1
  }
  
  // 该按键被判定成功
  setJudge (level, offset) {
    this.level = level
    this.offset = offset
    console.log('判定', this.pos, this.level, this.offset)
    
    // 通知控制器对按键成功判定进行处理
    this.controller.judgeNote(this)
  }
  
  checkGesture (gesture) {
    if (!gesture.tapDisabled && gesture.isDown()) {
      if (this.isGesturePosIn(gesture.pos)) {
        // 位置判定成功
        const timeOffset = Math.floor(gesture.time - this.time)
        const level = this.getJudgeLevel(timeOffset)
        if (level >= 0) {
          // 一旦手势成功判定单键，则将单键锁tapDisabled置为true，一个手势只能判定一次单键
          gesture.tapDisabled = true
          // 判定成功
          this.setJudge(level, timeOffset)
        }
        return level
      }
    }
    // 返回负数代表未判定
    return -1
    // console.log(gesture)
  }
}