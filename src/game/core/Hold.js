import Tap from'./Tap.js'

import Game from '@/libs/Game.js'
import utils from '@/libs/utils/index.js'

// 面条中间的判定对象，不具备精灵实体
class HoldItem extends Tap {
  constructor () {
    super()
  }
  
  init (options, controller, hold) {
    this.controller = controller
    this.hold = hold
    this._options = options
    this._checkInit()
    
    Object.assign(this, this._options)
  }
  
  // 循环函数
  onUpdate (delta, speedChange) {    
    const time = this.controller.curTime    
    // 是否超出判定时间
    if (time - this.time > this.controller.missTime) {
      // 移除按键
      this.removeFromStage()
    }
  }
  
  // 添加一个按键
  addToStage () {
    this.controller.add(this)
  }
  
  // 移除一个按键
  removeFromStage () {
    // 先判断并处理按键MISS的情况
    this.controller.judgeMiss(this)
    
    // 从舞台中删除
    this.controller.children.delete(this)
    this.controller = null
    // 从面条中删除
    this.hold.removeItem(this)
  }
}

export default class Hold {
  constructor () {
  }
  
  // 检查options和controller是否合理
  _checkInit () {
    Tap.prototype._checkInit.call(this)
  }
  
  init (options, controller) {
    this.controller = controller
    this._options = options
    this._checkInit()
    
    Object.assign(this, this._options)
    
    // 初始化精灵及其位置
    this._initBase()
  }
  
  // 初始化面条头部的判定设置
  _getSplitOptions () {
    return {
      // Spilit的判定和Slide相同
      type: 'Slide',
      time: this.time,
      start: this.start,
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
      textureName: this.splitTextureName,
      texture: this.splitTexture
    }
  }
  
  // 初始化面条中间的判定设置
  _getItemsOptions (index, time, x) {
    return {
      // Spilit的判定和Slide相同
      type: 'Hold',
      width: this.width,
      time, x, index
    }
  }
  
  _initBase () {
    // 初始化面条头部按键对象，看做一个Slide
    this.splitObj = this.controller.notePool.Slide.get()
    this.splitObj.init(this._getSplitOptions(), this.controller)
    
    if (this.distance > 0) {
      // 计算临边、夹角、斜边
      const deltaX = this.end.x - this.x
      const angle = Math.atan(this.distance / deltaX) * (-1)
      const len = Math.sqrt(deltaX * deltaX + this.distance * this.distance)
      
      // 初始化中间的判定体
      // 8分音符为间隔
      const sectionTime = this.controller.getNoteDuration(8)
      const endTime = this.time + this.duration
      let curTime = this.time + sectionTime
      this.holdItems = []
      for (let i = 0; curTime < endTime; i++) {
        // 按照比例计算x
        const deltaX = ((curTime - this.time) / this.duration) * (this.end.x - this.x)
        const x = this.x + deltaX
        
        const holdItem = new HoldItem()
        holdItem.init(this._getItemsOptions(i, curTime, x), this.controller, this)
        this.holdItems.push(holdItem)
        curTime = curTime + sectionTime
      }
      
      // 初始化面条精灵
      this.sprite = this.controller.notePool.Sprite.get(this.textureName, this.texture)
      this.sprite.anchor.set(0.5, 1)
      this.sprite.width = this.width
      this.sprite.x = this.x
      this.sprite.y = this.y
      
      this.sprite.height = len     
    }
  }
  
  // 循环函数
  onUpdate (delta, speedChange) {    
    const time = this.controller.curTime
    delta = time - delta < this.start ? time - this.start : delta
    
    if (this.sprite) {
      const { vStandard } = NoteUtils.getMoveData()
      const { containerHeight } = NoteUtils.getValidSize()
      const v = speedChange * vStandard
      const s = v * delta
      this.sprite.y = this.splitSprite.y + s
    }
    
    // 是否超出判定时间
    if (time - this.time - this.duration > this.controller.missTime) {
      // 移除按键
      this.removeFromStage()
    }
  }
  
  addToStage () {
    // 添加头部
    this.splitObj.addToStage()
    
    // 添加中间的判定体
    const len = this.holdItems.length
    for (let i = 0; i < len; i++) {
      this.holdItems[i].addToStage()
    }
    
    // 添加面条体
    if (this.sprite) {
      const container = this.controller.container
      container.addChild(this.sprite)
    }
  }
  
  removeFromStage () {
    if (this.sprite) {
      const container = this.controller.container
      container.removeChild(this.sprite)
    }
  }
  
  // 删除一个判定对象
  removeItem (item) {
    this.holdItems.splice(item.index, 1)
  }
}