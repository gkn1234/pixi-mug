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
  }
  
  // 检查options和controller是否合理
  _checkInit () {
    if (!utils.obj.isObject(this._options)) {
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
    // console.log(this.sprite.y)
    
    // 落到判定线
    if (this.sprite.y >= 0 && !this.daoda) {
      console.log('到达', this.type, time, this.sprite.y, this.sprite.x)
      this.daoda = true
    }
    
    // 是否超出判定时间
    if (time - this.time > this.controller.missTime) {
      // 移除按键
      this.removeFromStage()
    }
  }
  
  // 该按键被判定成功
  setJudge (level, offset) {
    // 暂时保存判定信息
    this.level = level
    this.timeOffset = offset
    
    // 通知控制器对按键成功判定进行处理
    this.controller.judgeNote(this)
  }
  
  // 添加一个按键
  addToStage () {
    const container = this.controller.container
    container.addChild(this.sprite)
    this.controller.children.add(this)
  }
  
  // 移除一个按键
  removeFromStage () {
    // 先判断并处理按键MISS的情况
    this.controller.judgeMiss(this)
    
    const container = this.controller.container
    this.controller.children.delete(this)
    container.removeChild(this.sprite)
    this.controller = null
  }
}