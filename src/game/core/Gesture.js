import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'

import NoteUtils from './NoteUtils.js'
import Tap from './Tap.js'

export default class Gesture {
  constructor (id, catcher) {
    this.id = id
    // 要保存父对象
    this.catcher = catcher
    
    // 计算手势保持的限定时间，限定时间为歌曲BPM下的8分音符长度(为了完全覆盖8分音符，实际上是7分音符的长度)
    this.limitTime = this.catcher.getLimitTime()
    // 计算miss时间
    this.missTime = this.catcher.getMissTime()
  }
  
  // 事件状态
  static STATE = {
    down: 'down',
    move: 'move',
    up: 'up',
    hold: 'hold'
  }
  
  // 根据事件对象获取位置参数
  _getPos (e) {
    return {
      x: NoteUtils.raw2EffX(e.data.global.x),
      y: NoteUtils.raw2EffY(e.data.global.y)
    }
  }
  
  // down事件
  down (e) {
    this.state = Gesture.STATE.down
    // 记录手势创建出来时的时间
    this.startTime = this.catcher.getTime()
    // 记录down的位置信息
    this.startPos = this._getPos(e)
    // 当前激活的位置即为down的位置
    this.pos = this.startPos
    this.movePos = this.pos
    // 当前激活时的时间
    this.time = this.startTime
    // 复杂的事件对象
    this.detail = e
    
    // down事件必须成功判定一次后，会赋予activeTime属性，之后才能转为move状态
    this.activeTime === null
    
    // 触发手势状态更新回调
    this.catcher.onGestrueUpdate(this)
  }
  
  // move事件
  move (e) {
    if (!this.hasOwnProperty('activeTime') || this.activeTime === null) {
      // down状态如果不能成功判定，就没有activeTime属性，也无法转为move或者up
      return
    }
    if (this.state === Gesture.STATE.up) {
      // 也不可能从up状态退回move状态
      return
    }
    
    if (this._checkMoveActive()) {
      const gameConfig = Game.config.game
      const { effWidth } = NoteUtils.getValidSize
      
      this.pos = this._getPos(e)
      let deltaX = this.pos.x - this.movePos.x
      deltaX = deltaX < 0 ? deltaX * (-1) : deltaX
      if (deltaX >= (effWidth / NoteUtils.MAX_KEY_NUM) * 0.5) {
        console.log(this.pos.x, this.movePos.x, deltaX)
        // 在X轴方向必须至少移动半个8K轨道的距离，才算做一次move事件
        // 距离不够的，依然算作hold事件
        this.state = Gesture.STATE.move
        this.moveTime = this.catcher.getTime()
        this.movePos = this.pos
        this.time = this.moveTime
        this.detail = e
        
        this.catcher.onGestrueUpdate(this)        
      }
    }
  }
  
  // up事件
  up (e) {
    if (!this.hasOwnProperty('activeTime') || this.activeTime === null) {
      // down状态如果不能成功判定，就没有activeTime属性，也无法转为move或者up
      return
    }
    
    if (this._checkMoveActive()) {
      // 更新move事件
      this.state = Gesture.STATE.up
      // 记录手势结束时间
      this.endTime = this.catcher.getTime()
      // 记录结束时的位置信息
      this.endPos = this._getPos(e)
      
      this.pos = this.endPos
      this.time = this.endTime
      this.detail = e
      
      this.catcher.onGestrueUpdate(this)
    }
  }
  
  // move状态下则要检查当前时间是否超限，限定时间为歌曲BPM下的8分音符
  _checkMoveActive () {
    // 当前时间减去activeTime得到超限判断时间
    // 超限判断时间如果超过了限定时间，则move无法保持，长按手势将失效，函数返回false
    // console.log('检查', this.catcher.getTime(), this.activeTime, this.limitTime)
    if (this.catcher.getTime() - this.activeTime > this.limitTime) {
      this.catcher.removeGesture(this)
      return false
    }
    return true
  }
  
  // 每一帧都会触发，进行一轮判定后，更新手势状态。isJudge代表是否判定成功
  judgeUpdate (isJudge = false) {
    // 获取当前时间
    const curTime = this.catcher.getTime()
    
    if (this.state === Gesture.STATE.up) {
      // up事件是事件的末尾，手势未判定将直接结束
      this.catcher.removeGesture(this)
      return
    }
    
    if (!isJudge) {
      // 未判定到按键
      if (this.state === Gesture.STATE.down) {
        if (curTime - this.time > this.missTime) {
          // 一旦当前时间再超过判定miss的时间，代表判定彻底失败就移除
          this.catcher.removeGesture(this)
          return
        }
      }
      else {
        // move和hold状态下则要检查当前时间是否超限。并根据结果自动处理
        const sign = this._checkMoveActive()
        if (!sign) {
          // 超限时移除手势，直接返回
          return
        }
      }      
    }
    else {
      // 判定成功时，更新activeTime属性，延长手势的存活时间
      this.activeTime = curTime
    }
    
    const lastState = this.state
    if (lastState !== Gesture.STATE.hold) {
      // 完成判定后，从其他状态转为hold
      this.state = Gesture.STATE.hold
      // 触发手势状态更新回调
      this.catcher.onGestrueUpdate(this)      
    }
  }
  
  // 获取判定时间
  getJudgeTime () {
    // hold状态下的判定时间就是当前时间，其他状态下，以状态变化时的瞬时时间为准
    return this.state === GestureCatcher.STATE.hold ? this.catcher.getTime() : this.time
  }
  
  // 手势是否为hold
  isHold () {
    return this.state === Gesture.STATE.hold
  }
  
  // 手势是否为down
  isDown () {
    return this.state === Gesture.STATE.down
  }
  
  // 手势是否为move
  isMove () {
    return this.state === Gesture.STATE.move
  }
}