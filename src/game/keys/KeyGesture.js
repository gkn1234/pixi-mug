import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'

export default class KeyGesture {
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
    up: 'up'
  }
  
  // 根据事件对象获取位置参数
  _getPos (e) {
    return {
      x: e.data.global.x,
      y: e.data.global.y
    }
  }
  
  // down事件
  down (e) {
    this.state = KeyGesture.STATE.down
    // 记录手势创建出来时的时间
    this.startTime = this.catcher.getTime()
    // 记录down的位置信息
    this.startPos = this._getPos(e)
    // 当前激活的位置即为down的位置
    this.pos = this.startPos
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
    if (this.state === KeyGesture.STATE.up) {
      // 也不可能从up状态退回move状态
      return
    }
    
    if (this._checkMoveActive()) {
      // 更新move事件
      this.state = KeyGesture.STATE.move
      this.pos = this._getPos(e)
      this.time = this.catcher.getTime()
      this.detail = e
      
      this.catcher.onGestrueUpdate(this)
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
      this.state = KeyGesture.STATE.up
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
  
  // 进行一轮判定后，更新手势状态。isJudge代表是否判定成功
  judgeUpdate (isJudge = false) {
    // 获取当前时间
    const curTime = this.catcher.getTime()
    if (!isJudge) {
      // 未判定到按键
      if (this.state === KeyGesture.STATE.down || this.state === KeyGesture.STATE.up) {
        // down和up状态下没有判定到按键
        const judgeTime = this.state === KeyGesture.STATE.down ? this.startTime : this.endTime
        if (curTime - judgeTime > this.missTime) {
          // 一旦当前时间再超过判定miss的时间，代表判定彻底失败就移除
          this.catcher.removeGesture(this)
        }
      }
      else {
        // move状态下则要检查当前时间是否超限。并根据结果自动处理
        this._checkMoveActive()
      }      
    }
    else {
      // 判定到了按键
      if (this.state === KeyGesture.STATE.down || this.state === KeyGesture.STATE.move) {
        // down事件成功判定，赋予activeTime属性，同时使手势可能转为move状态
        // move事件成功判定，更新activeTime属性
        this.activeTime = this.catcher.getTime()
      }
      else {
        // up事件是事件的末尾，判定成功后，手势结束
        this.catcher.removeGesture(this)
      }      
    }
  }
}