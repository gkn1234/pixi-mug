import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'

export default class keyGesture {
  constructor (id, time) {
    this.id = id
    // 初始化down/move/up 三个事件
    this.down = null
    this.move = null
    this.up = null
    
    // 记录手势创建出来时的时间
    this.time = time
    // 手势必须要有续航，如果在miss的判定时间内，未能判定到任何对象，则失效
    const gameConfig = Game.config.game
    this.missTime = gameConfig.judgeTime[gameConfig.judgeTime.length - 1]
    // 续航时间
    this.actTime = time
  }
  
  // 根据事件对象获取位置参数
  _getPos (e) {
    return {
      x: e.data.global.x,
      y: e.data.global.y
    }
  }
  
  // 加入down事件
  down (time, e) {
    this.down = {
      ...this._getPos(e),
      time: time,
      detail: e
    }
    // down事件如果在一段时间内，没有判定到任何按键，则自动取消
    
  }
}