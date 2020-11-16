import { Sprite, Container } from 'pixi.js'

import Game from '@/libs/Game.js'

import utils from '@/utils/index.js'

export default class TapKey extends Sprite {
  /*
    键位设置
    texture {Object} - 键位皮肤
    options {Object} - 键位参数
      @keyNum {Number} [4] - 指定该键是几key下的按键，取值范围2 - 8
      @posNum {Number} [1] - 指定该按键在第几条轨道上，1号轨道在最左边，取值范围1 - keyNum
      @posOffset {Number} [0] - 指定该键在原有标准位置下的偏移量，以按键到达底部时为准，正数向右，负数向左
  */
  constructor (texture, options = {}) {
    super(texture)
    this.init(options)
  }
  
  // 指定按键的参数
  init (options = {}) {
    const gameConfig = Game.config
    if (!this._gameData) {
      this._gameData = {}
    }
    let thisData = this._gameData
    thisData.keyNum = options.keyNum >= 2 && options.keyNum <= 8 ? Math.floor(options.keyNum) : 4
    thisData.posNum = options.posNum >= 1 && options.posNum <= thisData.keyNum ? Math.floor(options.posNum) : 1
    thisData.posOffset = utils.obj.isValidNum(options.posOffset) ? options.posOffset : 0,
    
    // 额外速度因子，与1/2/3/4速不同，值得是本按键特有的速度，会在基础设定速度上根据此因子再次变化
    thisData.additionSpeed = 1
    
    // 根据参数计算按键的参数
    // 初始锚点中心
    this.anchor.set(0.5, 0)
    
    // 按键的最终尺寸
    thisData.finalHeight = gameConfig.keyHeight.tapKey
    thisData.finalWidth = gameConfig.bottomMaxWidth / thisData.keyNum
    // 按键的初始尺寸
    thisData.initHeight = gameConfig.topScaleRatio * thisData.finalHeight
    thisData.initWidth = gameConfig.topScaleRatio * thisData.finalWidth
    // 按键最终缩放比例
    thisData.finalScaleX = thisData.finalWidth / this.width
    thisData.finalScaleY = thisData.finalHeight / this.height
    // 按键初始缩放比例
    thisData.initScaleX = thisData.initWidth / this.width
    thisData.initScaleY = thisData.initHeight / this.height
    // 设置按键缩放
    this.scale.set(thisData.initScaleX, thisData.initScaleY)
    
    // 按键的最终位置
    thisData.finalLeftX = thisData.finalWidth * (thisData.posNum - 1)
    // 修正按键偏移量，不可使得按键超出下落区域
    if (thisData.finalLeftX + thisData.posOffset < 0) {
      thisData.posOffset = 0 - thisData.finalLeftX
    }
    if (thisData.finalLeftX + thisData.posOffset + thisData.finalWidth > gameConfig.bottomMaxWidth) {
      thisData.posOffset = gameConfig.bottomMaxWidth - thisData.finalWidth - thisData.finalLeftX
    }
    thisData.finalLeftX = thisData.finalLeftX + thisData.posOffset
    thisData.finalCenterX = thisData.finalLeftX + thisData.finalWidth / 2
    
    // 计算并设置按键的初始位置
    const topLeftOffset = ((1 - gameConfig.topScaleRatio) * gameConfig.bottomMaxWidth) / 2
    thisData.initLeftX = topLeftOffset + thisData.initWidth * (thisData.posNum - 1) + thisData.posOffset * gameConfig.topScaleRatio
    thisData.initCenterX = thisData.initLeftX + thisData.initWidth / 2
    this.x = thisData.initCenterX
    this.y = 0
    
    // 计算按键的速度
    this._setKeySpeed()

    console.log(this)
  }
  
  // 计算按键速度
  _setKeySpeed () {
    const gameConfig = Game.config
    let thisData = this._gameData
    // 获取按键下落到判定线的标准时间，单位ms
    const standardMoveTime = gameConfig.keyMoveTime / gameConfig.keySpeed
    // 获取按键下落到判定线的距离
    const standardMoveDistance = gameConfig.keyDistanceY - gameConfig.judgeLineToBottom
    // 缩放是匀速的，计算缩放变化时间，单位/ms
    thisData.scaleVX = (thisData.finalScaleX - thisData.initScaleX) / standardMoveTime
    thisData.scaleVY = (thisData.finalScaleY - thisData.initScaleY) / standardMoveTime
    // X轴运动是匀速的，计算X轴速度
    thisData.vX = (thisData.finalCenterX - thisData.initCenterX) / standardMoveTime
    // Y轴运动是变速的，获取初速度和加速度
    thisData.vY = gameConfig.keyMoveSpeedInitial
    thisData.aY = (standardMoveDistance - (thisData.vY * standardMoveTime)) / (0.5 * standardMoveTime * standardMoveTime)
  }
  
  // 开始下落
  startDrop (container, ticker) {
    if (container.constructor.name !== 'Container' || ticker.constructor.name !== 'Ticker' || !this._gameData.enabled) {
      return
    }
    if (!this._gameController) {
      this._gameController = {}
    }
    this._gameController.container = container
    this._gameController.ticker = ticker
    // 加入容器
    container.addChild(this)
    // 先设置初始时间
    let thisData = this._gameData
    thisData.startTime = Date.now()
    thisData.lastTime = 0
    // 加入动画循环
    ticker.add(this.onUpdated, this)
  }
  
  // 结束下落
  endDrop () {
    let thisData = this._gameData
    // 移除动画循环
    this._gameController.ticker.remove(this.onUpdated, this)
    // 移出容器
    this._gameController.container.removeChild(this)
  }
  
  // 循环函数
  onUpdated () {
    const gameConfig = Game.config
    let thisData = this._gameData
    // 当前时间
    const nowTime = Date.now() - thisData.startTime
    console.log(nowTime)
    const timeDelta = nowTime - thisData.lastTime
    // console.log(timeDelta)
    // x
    this.x = this.x + thisData.vX * timeDelta
    // y
    const vY = thisData.vY * thisData.additionSpeed
    const aY = thisData.aY * thisData.additionSpeed
    this.y = this.y + vY * timeDelta + 0.5 * aY * timeDelta * timeDelta
    thisData.vY = thisData.vY + thisData.aY * timeDelta
    // 缩放
    this.scale.x = this.scale.x + thisData.scaleVX * timeDelta
    this.scale.y = this.scale.y + thisData.scaleVY * timeDelta
    
    if (this.y >= gameConfig.keyDistanceY) {
      // 下落到底部
      this.endDrop()
    }
    
    thisData.lastTime = nowTime
  }
}