import utils from './utils/index.js'

export default class Gesture {
  constructor (sprite, events = {}) {
    this.sprite = sprite
    this.events = events
    this.sprite.interactive = true
    this._initEvent()
  }
  
  /*
    手势名称列表
    tap 设定 不限 {Any}
    hold 设定 不限 {Any}
    swipe设定 {Options}
      duration {Number} [1000] 滑动时长限制，down和up事件的间隔超过该值则不触发
      distance {Number} [50] 滑动距离限制，小于该值不触发
  */
  static EVENT_LIST = {
    TAP: 'tap',
    SWIPE: 'swipe',
    HOLD: 'hold'
  }
  
  _initEvent () {
    // 存放事件回调方法的对象
    this._eventCallback = {}
    this._swipeOptions = utils.obj.isObject(this.events[Gesture.EVENT_LIST.SWIPE]) ? this.events[Gesture.EVENT_LIST.SWIPE] : null
    
    if (this.events.hasOwnProperty(Gesture.EVENT_LIST.TAP)) {
      // tap事件不用配置，只要events对象指定了这个属性就行
      this.sprite.on('pointertap', this._tapHandler)
    }
    if (this._swipeOptions || this.events.hasOwnProperty(Gesture.EVENT_LIST.HOLD)) {
      // swipe和hold都是用同一系列方法实现的
      this.sprite.on('pointerdown', this._pointerdownHandler)
      this.sprite.on('pointermove', this._pointermoveHandler)
      this.sprite.on('pointerup', this._pointerupHandler)
      // 建立一个hold对象，用于储存不同的hold事件
      this._holdMap = {}
    }
  }
  
  // 绑定点击回调事件
  onTap (callback) {
    this._eventCallback[Gesture.EVENT_LIST.TAP] = callback
    return this
  }
  
  // 绑定滑动回调事件
  onSwipe (callback) {
    this._eventCallback[Gesture.EVENT_LIST.SWIPE] = callback
    return this
  }
  
  // 绑定按住回调事件
  onHold (callback) {
    this._eventCallback[Gesture.EVENT_LIST.HOLD] = callback
    return this
  }
  
  // 点击回调事件
  _tapHandler (e) {
    const callback = this._eventCallback[Gesture.EVENT_LIST.TAP]
    if (callback && typeof callback === 'function') {
      const eventObj = {
        ...e,
        gesName: Gesture.EVENT_LIST.TAP,
        x: e.data.global.x,
        y: e.data.global.y
      }
      callback(eventObj)
    }
  }
  
  // 按下回调事件
  _pointerdownHandler (e) {
    
  }
  
  // 移动回调事件
  _pointermoveHandler (e) {
    
  }
  
  // 弹起回调事件
  _pointerupHandler (e) {
    
  }
  
  // 创建一个hold事件
  _createHold () {
    
  }
}