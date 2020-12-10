import { Sprite } from 'pixi.js'

import Game from '@/libs/Game.js'
import utils from '@/libs/utils/index.js'

import NoteUtils from './NoteUtils.js'
import Gesture from './Gesture.js'

// 按键判定器
export default class GestureCatcher {
  constructor (controller) {
    // 控制器，用于获取时间
    this.controller = controller
    // 手势Map，用事件的id作为key，事件对象为value
    this.gestureMap = new Map()
    // 回调函数
    this.eventsCallback = {}
    
    this._init()
  }
  
  
  _init () {
    // 划分PC端和移动端，PC端键盘判定，移动端手势判定
    this._mobileActivate()
  }
  
  // 移动端按键判定
  _mobileActivate () {
    const scene = this.controller.scene
    
    const { containerWidth, trueHeight, judgeHeight, judgeAreaSize } = NoteUtils.getValidSize()
    const gameConfig = Game.config.game
    // 生成判定区域 测试纹理 Game.loader.resources['/img/tap.png'].texture
    let judgeArea = new Sprite()
    judgeArea.width = containerWidth
    judgeArea.height = judgeAreaSize
    judgeArea.y = trueHeight - judgeAreaSize / 2
    judgeArea.interactive = true
    scene.addChild(judgeArea)
    
    judgeArea.on('pointerdown', this._downHandler, this)
    judgeArea.on('pointermove', this._moveHandler, this)
    judgeArea.on('pointerup', this._upHandler, this)
    judgeArea.on('pointerout', this._outHandler, this)
  }
  
  // pointerdown回调
  _downHandler (e) {
    const curTime = this.controller.curTime
    // down为一个手势的开始，创建一个手势对象
    let gesture = new Gesture(e.data.identifier, this)
    // 手势对象加入down事件
    gesture.down(e)
    // 加入列表
    this.gestureMap.set(e.data.identifier, gesture)
  }
  
  // pointermove回调
  _moveHandler (e) {
    const gesture = this.gestureMap.get(e.data.identifier)
    if (!gesture) {
      return
    }
    
    gesture.move(e)
  }
  
  // pointerup回调
  _upHandler (e) { 
    const gesture = this.gestureMap.get(e.data.identifier)
    if (!gesture) {
      return
    }
    
    gesture.up(e)
  }
  
  _outHandler (e) {
    const gesture = this.gestureMap.get(e.data.identifier)
    if (!gesture) {
      return
    }
    gesture.out(e)
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
  
  // 获取手势最大持续时间
  getLimitTime () {
    return this.controller.limitTime ? this.controller.limitTime : 200
  }
  
  // 获取miss时间
  getMissTime () {
    return this.controller.missTime ? this.controller.missTime : 100
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
    gesture.catcher = null
  }
  
  // 对按键进行判定
  judge () {
    const notes = this.controller.children
    // 每一个手势对象都对按键进行判定
    // console.log(this.getTime(), this.gestureMap, notes.values().next().value)
    this.gestureMap.forEach((gesture) => {
      for (let note of notes) {
        const res = gesture.judge(note)
        if (res >= 0) {
          // 判定到一个按键后，就立即退出，避免一个手势在一帧内判定多个按键
          break
        }
      }
      // 根据本轮判定结果，更新本手势的状态
      gesture.update()
    })
  }
}