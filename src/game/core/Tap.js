import { Sprite } from 'pixi.js'

import Game from '@/libs/Game.js'
import utils from '@/libs/utils/index.js'

export default class Tap {
  constructor () {}
  
  // 静态变量
  // 按键offset值的最大偏移量
  static MAX_NOTE_OFFSET = 4
  // 最大与小轨道数
  static MIN_KEY_NUM = 2
  static MAX_KEY_NUM = 8
  static DEFAULT_KEY_NUM = 4
  
  /*
    键位设置
    texture {Object} - 键位皮肤
    options {Object} - 键位参数
      @key {Number} [4] - 指定该键是几key下的按键，取值范围2 - 8
      @pos {Number} [1] - 指定该按键在第几条轨道上，0号轨道在最左边，取值范围0 - (key - 1)
      @offset {Number} [0] - 指定该键在原有标准位置下的偏移量，正数向右，负数向左。-4会偏移到左边一轨，4会偏移到右边一轨
      @style [0] - 指定键位使用keySetting.res数组中的第几个皮肤
  */
  init (controller, options = {}) {
    this.controller = controller
    this.options = options
    this._checkInit()
    
    this.type = this.constructor.name
    this.time = utils.obj.isValidNum(options.time) ? options.time : 0
    
    const gameConfig = Game.config
    // 初始化精灵对象
    this._initSprite()
    // 初始化按键位置信息
    this._initPos()
    // 初始化速度信息
    this._initSpeed()
  }
  
  // 检查options和controller是否合理
  _checkInit () {
    if (!utils.obj.isObject(this.options)) {
      throw new Error('Invalid key options!')
    }
    if (this.controller.constructor.name !== 'KeyController') {
      throw new Error('Invalid key controller!')
    }
  }
  
  // 初始化该按键的精灵
  _initSprite () {
    const options = this.options
    const noteType = this.constructor.name
    this.keySetting = this.controller.keySetting[noteType]
    // 确定皮肤
    this.style = utils.obj.isValidNum(options.style) && options.style >= 0 && options.style < this.keySetting.res.length ? Math.floor(options.style) : 0
    this.texture = this.keySetting.textures[this.style]
    this.textureName = this.keySetting.res[this.style]
    // 从对象池中获取Sprite
    this.sprite = this.controller.notePool.Sprite.get(this.textureName, this.texture)
  }
  
  // 初始化位置参数
  _initPos () {
    const options = this.options
    const gameConfig = Game.config.game
    // 修正轨道位置三大参数key/pos/offset
    const keyPos = this._fixKeyPos(options.key, options.pos, options.offset)
    Object.assign(this, keyPos)
    // 计算通用的位置参数
    const commonPos = this._getCommonPos(this.key, this.pos, this.offset)
    Object.assign(this, commonPos)
    
    // 初始锚点中心
    this.sprite.anchor.set(0.5, 0)
    
    // 按键最终缩放比例
    this.finalScaleX = this.finalWidth / this.sprite.width
    this.finalScaleY = this.finalHeight / this.sprite.height
    // 按键初始缩放比例
    this.initScaleX = this.initWidth / this.sprite.width
    this.initScaleY = this.initHeight / this.sprite.height
    
    // 设置按键缩放和初始位置
    this.sprite.scale.set(this.initScaleX, this.initScaleY)
    this.sprite.x = this.initCenterX
    this.sprite.y = 0
  }
  
  // 对确定按键在轨道中位置的key/pos/offset三大参数进行修正
  _fixKeyPos (key, pos, offset) {
    key = utils.obj.isValidNum(key) && key >= Tap.MIN_KEY_NUM && key <= Tap.MAX_KEY_NUM ? Math.floor(key) : Tap.DEFAULT_KEY_NUM
    pos = utils.obj.isValidNum(pos) && pos >= 0 && pos < key ? Math.floor(pos) : 0
    offset = utils.obj.isValidNum(offset) && 
      offset >= pos * Tap.MAX_NOTE_OFFSET * (-1) && 
      offset <= Tap.MAX_KEY_NUM - pos - 1 * Tap.MAX_NOTE_OFFSET ?
      Math.floor(offset) : 0
    
    return { key, pos, offset }
  }
  
  // 传入修正后的key/pos/offset三大参数(轨道位置信息)，获取通用的位置参数
  _getCommonPos (key, pos, offset) {
    const gameConfig = Game.config.game

    // 按键到达底部的宽高
    const finalWidth = gameConfig.bottomMaxWidth / key
    const finalHeight = this.keySetting.height
    // 按键在顶部的宽高
    const initWidth = gameConfig.topScaleRatio * finalWidth
    const initHeight = gameConfig.topScaleRatio * this.finalHeight
    // 计算按键的宽度关于Y方向位置的斜率与截距
    const linearWidth = Tap.getLinearInfo(0, gameConfig.keyDistanceY, initWidth, finalWidth)
    const kWidth = linearWidth.k
    const bWidth = linearWidth.b
    
    // 计算按键在X方向上的路程(从顶部到达底部)
    // 先计算底部终点X坐标
    const finalLeftOffset = (Game.config.width - gameConfig.bottomMaxWidth) / 2
    const finalLeftX = finalLeftOffset + finalWidth * pos + offset * finalWidth / Tap.MAX_NOTE_OFFSET
    const finalCenterX = finalLeftX + finalWidth / 2
    // 计算屏幕顶部起始偏移量，由此计算出顶部起点X坐标
    const topLeftOffset = finalLeftOffset + ((1 - gameConfig.topScaleRatio) * gameConfig.bottomMaxWidth) / 2
    const initLeftX = topLeftOffset + initWidth * pos + offset * initWidth / Tap.MAX_NOTE_OFFSET
    const initCenterX = initLeftX + initWidth / 2
    // Y方向上的路程
    const sY = gameConfig.keyDistanceY - gameConfig.judgeLineToBottom
    // X关于Y的直线方程的斜率与截距
    const { k, b } = Tap.getLinearInfo(0, gameConfig.keyDistanceY, initCenterX, finalCenterX)
    
    // 最后算出判定区的横坐标
    const judgeCenterX = k * sY + b
    const judgeWidth = kWidth * sY + bWidth
    const judgeLeftX = judgeCenterX - judgeWidth / 2
    const judgeRightX = judgeCenterX + judgeWidth / 2
    
    return {
      initWidth, finalWidth,
      initHeight, finalHeight,
      initLeftX, finalLeftX,
      initCenterX, finalCenterX,
      judgeLeftX, judgeRightX, judgeCenterX,
      sY, k, b, kWidth, bWidth
    }
  }
  
  // 初始化速度信息
  _initSpeed () {
    const gameConfig = Game.config.game
    
    // 瞬时Y轴速度，初始化为初速度
    this.vY = this.controller.standardV0
    // X和Y的缩放比例与Y轴的位置线性相关
    const linearScaleX = Tap.getLinearInfo(0, gameConfig.keyDistanceY, this.initScaleX, this.finalScaleX)
    const linearScaleY = Tap.getLinearInfo(0, gameConfig.keyDistanceY, this.initScaleY, this.finalScaleY)
    this.scaleKX = linearScaleX.k
    this.scaleBX = linearScaleX.b
    this.scaleKY = linearScaleY.k
    this.scaleBY = linearScaleY.b
  }
  
  /*
    获取匀变速运动参数
  */
  _speedChangeMove (v0, a, t) {
    // Y轴方向上的运动距离
    const sY = v0 * t + 0.5 * a * t * t
    // 在运动阶段末尾，速度的增量
    const deltaVY = a * t
    return { sY, deltaVY }
  }
  
  // 循环函数
  onUpdate (delta) {
    const gameConfig = Game.config.game
    
    // 然后处理较复杂的Y轴变速运动
    if (this.controller.speedChangeIndex < 0) {
      // 不处于变速区
      const a = this.controller.standardA
      const { sY, deltaVY } = this._speedChangeMove(this.vY, a, delta)
      this.sprite.y = this.sprite.y + sY
      this.vY = this.vY + deltaVY
      // 记录变速
      this.speed = 1
    }
    else {
      // 处于变速区
      const speedObj = this.controller.speedChanges[this.controller.speedChangeIndex]
      // 标准加速度
      const a = this.controller.standardA
      // 新的加速度 = a * speed ^ 2
      const aNew = a * speedObj.speed * speedObj.speed
      
      if (this.speed === speedObj.speed) {
        // 已经处于变速区
        const { sY, deltaVY } = this._speedChangeMove(this.vY, aNew, delta)
        this.sprite.y = this.sprite.y + sY
        this.vY = this.vY + deltaVY
      }
      else {
        // 处于变速区的交接区间
        const curTime = this.controller.curTime
        const startTime = curTime - delta
        const divideTime = speedObj.start
        // 先计算变速前的路程
        const frontMove = this._speedChangeMove(this.vY, a, divideTime - startTime)
        this.sprite.y = this.sprite.y + frontMove.sY
        this.vY = this.vY + frontMove.deltaVY
        // 再计算变速后的路程
        // 变速后的初速度要突变相应的倍率
        this.vY = this.speed * this.vY
        const backMove = this._speedChangeMove(this.vY, aNew, curTime - divideTime)
        this.sprite.y = this.sprite.y + backMove.sY
        this.vY = this.vY + backMove.deltaVY
      }

      // 记录变速
      this.speed = speedObj.speed
    }
    
    // x坐标以及缩放比例都用线性方程求出
    this.sprite.x = this.k * this.sprite.y + this.b
    this.sprite.scale.x = this.scaleKX * this.sprite.y + this.scaleBX
    this.sprite.scale.y = this.scaleKY * this.sprite.y + this.scaleBY
    
    // 落到判定线
    if (this.sprite.y >= this.sY && !this.daoda) {
      console.log('到达', this.controller.curTime, this.sprite.y, this.sprite.x, this.judgeLeftX, this.judgeRightX)
      this.daoda = true
    }
    
    // 是否超出判定时间
    if (this.controller.curTime - this.time > this.controller.missTime) {
      // 超出判定时间时，结算并展示判定结果
      this.controller.showJudge(this)
      if (this.sprite.y >= gameConfig.keyDistanceY) {
        // 判定结果结算完成后，且按键Y轴运动距离已经达到视线之外，则彻底释放按键
        this.controller.removeNote(this)
      }
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
  
  // 计算线性关系的参数，y = kx + b
  static getLinearInfo(x1, x2, y1, y2) {
    const k = (y2 - y1) / (x2 - x1)
    const b = y2 - k * x2
    return { k, b }
  }
}