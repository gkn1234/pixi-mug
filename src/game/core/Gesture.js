import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'

import NoteUtils from './NoteUtils.js'

export default class Gesture {
  constructor (id, catcher) {
    this.id = id
    // 要保存父对象
    this.catcher = catcher
    
    // 为了防止Slide的判定彻底变成接水果，需要计算手势保持的限定时间，限定时间为歌曲BPM下的8分音符长度(为了完全覆盖8分音符，实际上是7分音符的长度)
    // 超过这个长度，手势便无法连续判断Slide音符
    this.limitTime = this.catcher.getLimitTime()
    // 计算miss时间
    this.missTime = this.catcher.getMissTime()
    
    // 上一次判定到按键的时间
    this.lastJudgeTime = this.catcher.getTime()
    // Tap手势判定信号，为true时，才允许判定该手势
    this.tapEnabled = true
    // Tap以外的按键类型是否能被down以外的手势判定
    this.othersEnabled = false
    
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
    // 当前激活时的时间
    this.time = this.startTime
    // 记录临时位置，辅助判断move事件
    this.movePos = this.pos
    // 复杂的事件对象
    this.detail = e
    
    // 触发手势状态更新回调
    this.catcher.onGestrueUpdate(this)
  }
  
  // move事件
  move (e) {
    if (this.state === Gesture.STATE.up) {
      // 也不可能从up状态退回move状态
      return
    }
    
    const gameConfig = Game.config.game
    const { effWidth } = NoteUtils.getValidSize()
    
    this.pos = this._getPos(e)
    const deltaX = Math.abs(this.pos.x - this.movePos.x)
    const minMoveX = (effWidth / NoteUtils.MAX_KEY_NUM) * 0.5
    if (deltaX >= minMoveX) {
      // 在X轴方向必须至少移动半个8K轨道的距离，才算做一次move事件，距离不够的，依然算作hold事件
      this.state = Gesture.STATE.move
      this.moveTime = this.catcher.getTime()
      this.movePos = this.pos
      this.time = this.moveTime
      this.detail = e
      
      this.catcher.onGestrueUpdate(this)        
    }
  }
  
  // up事件
  up (e) {    
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
  
  // 转为hold状态
  hold () {
    if (this.state === Gesture.STATE.up) {
      // 也不可能从up状态退回hold状态
      return
    }
    
    const lastState = this.state
    if (lastState !== Gesture.STATE.hold) {
      // 完成判定后，从其他状态转为hold
      this.state = Gesture.STATE.hold
      this.time = this.catcher.getTime()
      
      // 触发手势状态更新回调
      this.catcher.onGestrueUpdate(this)      
    }
  }
  
  // 手势移出了判定区
  out (e) {
    // 删除手势
    this.catcher.removeGesture(this)
  }
  
  // 对按键进行判定
  judge (note) {
    let res = -1
    switch (note.type) {
      case NoteUtils.NOTE_TYPES[0]:
        res = this.judgeTap(note)
        break
      case NoteUtils.NOTE_TYPES[1]:
        res = this.judgeSlide(note)
        break
      case NoteUtils.NOTE_TYPES[2]:
        res = this.judgeHold(note)
        break
      case NoteUtils.NOTE_TYPES[3]:
        res = this.judgeSwipe(note)
        break
    }
    
    if (res >= 0) {
      // 判定成功，更新判定时间
      this.lastJudgeTime = this.catcher.getTime()
    }
    
    return res
  }
  
  judgeTap (note) {
    if (
      this.tapEnabled && 
      this.state === Gesture.STATE.down &&
      this.isValidNotePos(note)
    ) {
      const timeOffset = Math.floor(this.getJudgeTime() - note.time)
      const level = this.getJudgeLevel(timeOffset)
      if (level >= 0) {
        // 一个手势只能判定一次单键
        this.tapEnabled = false
        // 解放手势，允许判定Tap以外的其他类型按键被down以外的手势判定
        this.othersEnabled = true
        // 判定成功
        note.setJudge(level, timeOffset)
      }
      return level
    }
    // 返回负数代表未判定
    return -1
  }
  
  judgeSlide (note) {
    if (!this.isValidNotePos(note)) {
      return -1
    }
    
    const timeOffset = Math.floor(this.getJudgeTime() - note.time)
    const level = this.getJudgeLevel(timeOffset)
    
    if (
      // down手势为一切开端，必然可以判定滑键Slide，但是会区分判定等级
      (this.state === Gesture.STATE.down && level >= 0) ||
      // 手势必须被解放，move才能判定滑键，会区分判定等级
      (this.othersEnabled && this.state === Gesture.STATE.move && level >= 0) ||
      // hold 判定滑键，只有完美判定
      (this.othersEnabled && this.state === Gesture.STATE.hold && level == 0)
    ) {
      // 如果第一次交给了滑键，则也不能再判定单键
      this.tapEnabled = false
      // 解放手势，允许判定Tap以外的其他类型按键被down以外的手势判定
      this.othersEnabled = true
      // 判定成功
      note.setJudge(level, timeOffset)
    }
    
    return level
  }
  
  judgeHold (note) {
    if (!this.isValidNotePos(note)) {
      return -1
    }
    
    // Hold类型的判定，只存在完美判定，且可以接受除了UP以外的任何手势
    // 这样做的目的是面条中断时，依然可以半途接上
    const timeOffset = Math.floor(this.getJudgeTime() - note.time)
    let level = this.getJudgeLevel(timeOffset)
    if (timeOffset >= 0 && level >= 0) {
      // 对于迟判，只要尚未脱离判定区，都转换为完美判定
      level = 0
    }
    
    // 只接受完美判定，可以接受除了UP以外的任何手势
    if (level === 0 && this.state !== Gesture.STATE.up) {
      // 如果第一次交给了滑键，则也不能再判定单键
      this.tapEnabled = false
      // 解放手势，允许判定Tap以外的其他类型按键被down以外的手势判定
      this.othersEnabled = true
      // 判定成功
      note.setJudge(level, timeOffset)
    }
    
    return level
  }
  
  judgeSwipe (note) {
    return -1
  }
  
  // 更新手势状态，一般在判定judge完成后调用
  update () {
    const curTime = this.catcher.getTime()
    
    if (this.state === Gesture.STATE.up) {
      // up事件是事件的末尾，手势将被移除
      this.catcher.removeGesture(this)
      return
    }
    
    if (this.othersEnabled && curTime - this.lastJudgeTime > this.limitTime) {
      // 对于其他类型的事件，检验判定时间
      // 如果过长时间没有判定到按键，则取消手势的解放状态，限制滑键和长按判定，避免变成接水果游戏
      this.othersEnabled = false
    }
    
    // 事件转为hold
    this.hold()
  }
  
  // 获取判定等级
  getJudgeLevel (offset) {
    const gameConfig = Game.config.game
    if (offset < 0) {
      offset = offset * (-1)
    }
    const judgeTimeList = gameConfig.judgeTime
    const len = judgeTimeList.length
    for (let i = 0; i < len; i++) {
      const min = i === 0 ? 0 : judgeTimeList[i - 1]
      const max = judgeTimeList[i]
      if (offset >= min && offset < max) {
        return i
      }
    }
    return -1
  }
  
  // 判断手势位置是否能判定到按键
  isValidNotePos (note) {
    const gameConfig = Game.config.game
    const { trueHeight, judgeAreaSize } = NoteUtils.getValidSize()
    const pos = this.pos
    const top = trueHeight - judgeAreaSize / 2
    const bottom = top + judgeAreaSize
    const y = NoteUtils.eff2RawY(pos.y)
    if (y < top || y > bottom) {
      // Y轴判断位置
      return false
    }
    const left = note.x - note.width / 2
    const right = note.x + note.width / 2
    // console.log(pos.x, pos.y, y, top, bottom, left, right)
    if (pos.x < left || pos.x > right) {
      return false
    }
    return true
  }
  
  // 获取判定时间
  getJudgeTime () {
    // hold状态下的判定时间就是当前时间，其他状态下，以状态变化时的瞬时时间为准
    return this.state === Gesture.STATE.hold ? this.catcher.getTime() : this.time
  }
}