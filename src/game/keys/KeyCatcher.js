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
    if (this.pauseSignal || !this.controller.curTime) {
      // 暂停状态下，暂时不处理事件
      return
    }
    
    const curTime = this.controller.curTime
    // down为一个手势的开始，创建一个手势对象
    let gesture =new KeyGesture(e.data.identifier)
    // 手势对象加入down事件
    gesture.down(curTime, e)
    // 加入列表
    this.gestureMap.set(e.data.identifier, gesture)
  }
  
  // pointermove回调
  _moveHandler (e) {
    if (this.pauseSignal || !this.controller.curTime) {
      // 暂停状态下，暂时不处理事件
      return
    }
    console.log(e.data.identifier, e.data.global.x, e.data.global.y)
  }
  
  // pointerup回调
  _upHandler (e) {
    if (this.pauseSignal || !this.controller.curTime) {
      // 暂停状态下，暂时不处理事件
      return
    }
  }
  
  // 停止手势判定
  stop () {
    this.pauseSignal = true
  }
  
  // 启动手势判定
  start () {
    this.pauseSignal = false
  }
  
  // 创建一个手势对象
  _createGesture (id) {
    return {
      id: id,
      down: null,
      up: null,
      move: null,
      time: Date.now()
    }
  }
  
  // 为手势对象添加
}