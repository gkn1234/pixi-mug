import Game from '@/libs/Game.js'
import utils from '@/libs/utils/index.js'

import KeyGesture from './KeyGesture.js'

// 按键判定器
export default class KeyCatcher {
  constructor (controller, scene) {
    // 控制器，用于获取时间
    this.controller = controller
    // 场景，用于在移动端生成判定精灵
    this.scene = scene
    // 手势Map，用事件的id作为key，事件对象为value
    this.gestureMap = new Map()
    // 回调函数
    this.eventsCallback = {}
    
    this._init()
  }
  
  
  _init () {
    // 划分PC端和移动端，PC端键盘判定，移动端手势判定
    this._initMobileJudge()
  }
  
  // 移动端按键判定
  _initMobileJudge () {
    const gameConfig = Game.config.game
    // 生成判定区域
    let judgeArea = new Sprite(Game.loader.resources['/img/tap.png'].texture)
    judgeArea.width = Game.config.width
    judgeArea.height = gameConfig.judgeWidth
    judgeArea.y = gameConfig.keyDistanceY - gameConfig.judgeLineToBottom - gameConfig.judgeWidth / 2
    judgeArea.interactive = true
    this.scene.addChild(judgeArea)
    this.judgeArea = judgeArea
    console.log(judgeArea)
    
    this.judgeArea.on('pointerdown', this._downHandler)
    this.judgeArea.on('pointermove', this._moveHandler)
    this.judgeArea.on('pointerup', this._upHandler)
  }
  
  // pointerdown回调
  _downHandler (e) {
    if (this.pauseSignal || this.getTime() === null) {
      // 暂停状态下，暂时不处理事件
      return
    }
    
    const curTime = this.controller.curTime
    // down为一个手势的开始，创建一个手势对象
    let gesture = new KeyGesture(e.data.identifier, this)
    // 手势对象加入down事件
    gesture.down(e)
    // 加入列表
    this.gestureMap.set(e.data.identifier, gesture)
  }
  
  // pointermove回调
  _moveHandler (e) {
    if (this.pauseSignal || this.getTime() === null) {
      // 暂停状态下，暂时不处理事件
      return
    }
    
    const gesture = this.gestureMap.get(e.data.identifier)
    if (!gesture) {
      return
    }
    
    gesture.move(e)
  }
  
  // pointerup回调
  _upHandler (e) {
    if (this.pauseSignal || this.getTime() === null) {
      // 暂停状态下，暂时不处理事件
      return
    }
    
    const gesture = this.gestureMap.get(e.data.identifier)
    if (!gesture) {
      return
    }
    
    gesture.up(e)
  }
  
  // 停止手势判定
  stop () {
    this.pauseSignal = true
  }
  
  // 启动手势判定
  start () {
    this.pauseSignal = false
  }
  
  // 获取当前游戏时间
  getTime () {
    return this.controller.curTime ? this.controller.curTime : null
  }
  
  // 获取手势最大持续时间，我们希望能够做多包容8分音符，所以这里传参为7分音符
  getLimitTime () {
    return this.controller.getNoteDuration(7)
  }
  
  // 绑定回调函数
  setCallback (key, callback) {
    this.eventsCallback[key] = callback
  }
  
  // 手势状态发生变化时的回调函数
  onGestrueUpdate (e) {
    if (typeof this.eventsCallback.onGestureUpdate === 'function') {
      this.eventsCallback.onGestureUpdate(e)
    }
  }
  
  // 移除一个手势
  removeGesture (gesture) {
    this.gestureMap.delete(gesture.id)
  }
  
  // 对按键进行判定
  judge (note) {
    // 每一个手势对象都对按键进行判定
    this.gestureMap.forEach((gesture) => {
      gesture.judge(note)
    })
  }
}