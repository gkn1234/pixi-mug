import Tap from'./Tap.js'

import Game from '@/libs/Game.js'
import utils from '@/libs/utils/index.js'

export default class Slide extends Tap {
  constructor () {
    super()
  }
  
  // 与单键相比，滑键能被所有事件判定
  checkGesture (gesture) {
    // 获取判定时间
    const judgeTime = gesture.getJudgeTime()
    
    if (this.isGesturePosIn(gesture.pos)) {
      // 位置判定成功
      const timeOffset = Math.floor(judgeTime - this.time)
      const level = this.getJudgeLevel(timeOffset)
      if (
        // move / down / up 状态的手势会进行准确度校验
        (level >= 0 && !gesture.isHold()) ||
        // hold状态永远只做完美判定
        (level == 0 && gesture.isHold())
      ) {
        // 一旦手势成功判定单键，则将单键锁tapDisabled置为true，一个手势只能判定一次单键
        gesture.tapDisabled = true
        // 判定成功
        this.setJudge(level, timeOffset)
      }
      return level
    }
    return -1
  }
}