import Tap from'./Tap.js'

import Game from '@/libs/Game.js'
import utils from '@/libs/utils/index.js'

class HoldStart extends Tap {
  constructor () {
    super()
  }
}

class HoldItem extends Tap {
  constructor () {
    super()
  }
}

export default class Hold {
  constructor () {
  }
  
  init (options, controller) {
    this.controller = controller
    this._options = options
    this._checkInit()
    
    Object.assign(this, this._options)
    
    
  }
  
  // 检查options和controller是否合理
  _checkInit () {
    Tap.prototype._checkInit.call(this)
  }
}