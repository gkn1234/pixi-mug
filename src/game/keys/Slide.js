import Tap from'./Tap.js'

import Game from '@/libs/Game.js'
import utils from '@/libs/utils/index.js'

export default class Slide extends Tap {
  constructor () {
    super()
  }
  
  // 与单键相比，滑键能被所有事件判定
  checkGesture (gesture) {
    if (this.isGesturePosIn(gesture.pos)) {
      // 位置判定成功
      const timeOffset = gesture.time - this.time
      const level = this.getJudgeLevel(timeOffset)
      if (level >= 0) {
        // 一旦手势成功判定单键，则将单键锁tapDisabled置为true，一个手势只能判定一次单键
        gesture.tapDisabled = true
        // 判定成功
        this.controller.setJudge(level, timeOffset, this)
        // 打击特效
        this.controller.tapAnimate(level, this.judgeCenterX)
        // 判定成功时自然要删除按键，避免连续判定
        this.endDrop()
      }
      return level
    }
    return -1
  }
}