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
    // 检查纹理配置，顺便检查options配置
    this._initTexture()
    
    // this.texture为按键纹理的索引字符串
    const texture = Game.loader.resources[this.texture].texture
    // 从对象池中获取Sprite
    this.sprite = this.controller.notePool.Sprite.get(this.texture, texture)
  }
  
  // 初始化纹理
  _initTexture () {
    const options = this.options
    
    const error = 'Invalid key settings in config file!'
    const gameConfig = Game.config.game
    const noteType = this.constructor.name
    
    // 有关于纹理方面的配置有问题
    if (!gameConfig.keySetting || !gameConfig.keySetting[noteType]) {
      throw new Error(error)
    }
    if (!utils.obj.isArray(gameConfig.keySetting[noteType].res) || gameConfig.keySetting[noteType].res.length <= 0) {
      throw new Error(error)
    }
    // 保存按键个性配置
    this.keySetting = gameConfig.keySetting[noteType]
    
    // 确定皮肤
    this.style = utils.obj.isValidNum(options.style) && options.style >= 0 && options.style < this.keySetting.res.length ? Math.floor(options.style) : 0
    this.texture = this.keySetting.res[this.style]
  }
  
  // 初始化位置参数
  _initPos () {
    // 获取通用位置参数
    const commonPos = this._initCommonPos()
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
  
  // 获取通用位置参数
  _initCommonPos () {
    const options = this.options
    const gameConfig = Game.config.game
    
    const key = utils.obj.isValidNum(options.key) && options.key >= Tap.MIN_KEY_NUM && options.key <= Tap.MAX_KEY_NUM ? Math.floor(options.key) : Tap.DEFAULT_KEY_NUM
    const pos = utils.obj.isValidNum(options.pos) && options.pos >= 0 && options.pos < key ? Math.floor(options.pos) : 0
    const offset = utils.obj.isValidNum(options.offset) && 
      options.offset >= pos * Tap.MAX_NOTE_OFFSET * (-1) && 
      options.offset <= Tap.MAX_KEY_NUM - pos - 1 * Tap.MAX_NOTE_OFFSET ?
      Math.floor(options.offset) : 0
    
    // 将该对象看做一条横线，计算相关坐标
    // 按键到达底部的宽高
    const finalHeight = this.keySetting.height
    const finalWidth = gameConfig.bottomMaxWidth / key
    // 按键在顶部的宽高
    const initWidth = gameConfig.topScaleRatio * finalWidth
    const initHeight = gameConfig.topScaleRatio * finalHeight
    
    // 计算按键在X方向上的路程(从顶部到达底部)
    // 先计算底部终点X坐标
    const finalLeftOffset = (Game.config.width - gameConfig.bottomMaxWidth) / 2
    const finalLeftX = finalLeftOffset + finalWidth * pos + offset * finalWidth / Tap.MAX_NOTE_OFFSET
    const finalCenterX = finalLeftX + finalWidth / 2
    // 计算屏幕顶部起始偏移量，由此计算出顶部起点
    const topLeftOffset = finalLeftOffset + ((1 - gameConfig.topScaleRatio) * gameConfig.bottomMaxWidth) / 2
    const initLeftX = topLeftOffset + initWidth * pos + offset * initWidth / Tap.MAX_NOTE_OFFSET
    const initCenterX = initLeftX + initWidth / 2
    // Y方向上的路程
    const sY = gameConfig.keyDistanceY - gameConfig.judgeLineToBottom
    // x关于y的直线方程的斜率
    const k = (finalCenterX - initCenterX) / gameConfig.keyDistanceY
    // x关于y的直线方程的截距
    const b = finalCenterX - k * gameConfig.keyDistanceY
    
    return {
      key, pos, offset,
      finalWidth, finalHeight,
      initWidth, initHeight,
      initLeftX, finalLeftX,
      initCenterX, finalCenterX,
      sY, k, b
    }
  }
  
  // 初始化速度信息
  _initSpeed () {
    const gameConfig = Game.config.game
    
    // 瞬时Y轴速度，初始化为初速度
    this.vY = this.controller.standardV0
    // X和Y的缩放比例与Y轴的位置线性相关
    this.scaleKX = (this.finalScaleX - this.initScaleX) / gameConfig.keyDistanceY
    this.scaleKY = (this.finalScaleY - this.initScaleY) / gameConfig.keyDistanceY
    this.scaleBX = this.finalScaleX - this.scaleKX * gameConfig.keyDistanceY
    this.scaleBY = this.finalScaleY - this.scaleKY * gameConfig.keyDistanceY
  }
  
  // 开始下落
  startDrop () {
    this.controller.scene.addChild(this.sprite)
    this.controller.children.add(this)
    
    // 记录按键变速情况
    this.speed = this.controller.speedChangeIndex < 0 ? 1 : this.controller.speedChanges[this.controller.speedChangeIndex].speed
  }
  
  // 结束下落
  endDrop () {
    this.controller.scene.removeChild(this.sprite)
    this.controller.children.delete(this)
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
      console.log('到达', this.controller.curTime, this.sprite.y, this.sprite.x)
      this.daoda = true
    }
    
    // 落到底部
    if (this.sprite.y >= gameConfig.keyDistanceY) {
      // console.log('到底', this, this.sprite.y, this.sprite.x)
      this.endDrop()
    }
  }
}