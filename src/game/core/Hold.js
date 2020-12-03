import Tap from'./Tap.js'

import Game from '@/libs/Game.js'
import utils from '@/libs/utils/index.js'

export default class Hold extends Tap {
  constructor () {
    super()
  }
  
  // 初始化面条按键的精灵
  _initSprite () {
    const options = this.options
    const noteType = this.constructor.name
    this.keySetting = this.controller.keySetting[noteType]
    // 确定颜色
    this.style = utils.obj.isValidNum(options.style) && options.style >= 0 && options.style < this.keySetting.res.length ? Math.floor(options.style) : 0
    this.color = this.keySetting.color[this.style]
    // 从对象池中获取Sprite
    this.sprite = this.controller.notePool.Graphics.get(this.color.toString())
  }
  
  // 初始化位置参数
  _initPos() {
    const options = this.options
    const gameConfig = Game.config.game
    
    // 修正轨道位置三大参数key/pos/offset
    const keyPos = this._fixKeyPos(options.key, options.pos, options.offset)
    Object.assign(this, keyPos)
    // 修正面条尾部轨道位置三大参数
    if (!utils.obj.isObject(options.end)) {
      throw new Error('Invalid key options!')
    }
    const endKeyPos = this._fixKeyPos(options.end.key, options.end.pos, options.end.offset)
    this.endKey = endKeyPos
    
    // 计算面条长度
    this.duration = utils.obj.isValidNum(options.duration) && options.duration >= 0 ? options.duration : 0
    this.totalLength = this.controller.standardVA * this.duration
    
    // 计算头部和尾部的通用参数
    const commonPos = this._getCommonPos(this.key, this.pos, this.offset)
    const endCommonPos = this._getCommonPos(this.endKey.key, this.endKey.pos, this.endKey.offset)
    
  }
  
  // 传入修正后的key/pos/offset三大参数(轨道位置信息)，获取通用的位置参数
  // Hold的原理是顶点绘制四边形，所以只考虑顶点的直线方程
  _getCommonPos (key, pos, offset) {
    const gameConfig = Game.config.game
    
    
    // 按键到达底部的宽
    const finalWidth = gameConfig.bottomMaxWidth / key
    // 按键在顶部的宽
    const initWidth = gameConfig.topScaleRatio * finalWidth
    // 计算按键的宽度关于Y方向位置的斜率与截距
    const linearWidth = Tap.getLinearInfo(0, gameConfig.keyDistanceY, initWidth, finalWidth)
    const kWidth = linearWidth.k
    const bWidth = linearWidth.b
    
    // 计算两条轨道的直线方程
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
      initLeftX, finalLeftX,
      initCenterX, finalCenterX,
      judgeLeftX, judgeRightX, judgeCenterX,
      sY, k, b, kWidth, bWidth
    }
  }
}