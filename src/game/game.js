import * as PIXI from 'pixi.js'

import config from '@/config.js'

// v0 * 2500 + 3125000 * a = 375

const game = {
  app: null,
  loader: null,
  
  obj: null,
  
  start (gameCanvas) {
    const app = new PIXI.Application({
      width: config.width,
      height: config.height,
      view: gameCanvas
    })
    game.app = app
    game.loader = new PIXI.Loader()
    game.loader
      .add('/img/tap.png')
      .load(game.setup);
    
  },
  
  setup () {
    //Add the cat to the stage
    new Key()
    console.log(game.app.ticker)
    game.app.timer = new Date().getTime()
    setTimeout(() => {
      new Key()
    }, 200)
  },
  
  loop () {
    // 1速150帧到底
    // 2速75帧到底
    // 3速50帧到底
    // 4速40帧到底
    game.app.obj.y = game.app.obj.y + game.app.obj.vy
    game.app.obj.curScale = game.app.obj.curScale + game.app.obj.vScale
    game.app.obj.scale.set(game.app.obj.curScale, game.app.obj.curScale)
  }
}

class Key {
  constructor () {
    this.obj = new PIXI.Sprite(game.loader.resources['/img/tap.png'].texture)
    game.app.stage.addChild(this.obj)
    
    this.timeToBottom = 625
    this.obj.anchor.set(0.5, 0)
    this.obj.scale.set(0.15)
    this.obj.x = 667 / 2
    this.a = 375 / (this.timeToBottom * this.timeToBottom * 0.5)
    this.time = Date.now()
    game.app.ticker.add(this.loop, this)
  }
  
  loop () {
    const nowTime = Date.now() - this.time
    // this.obj.vy = this.obj.vy + 0.00012 * 
    this.obj.y = 1/2 * this.a * nowTime * nowTime
    const deltaScale = nowTime / this.timeToBottom
    // this.obj.curScale = this.obj.curScale + this.obj.vScale
    this.obj.scale.set(0.15 + 0.85 * deltaScale)
    if (nowTime >= this.timeToBottom && !this.show) {
      this.show = true
      console.log('do', 0.15 + 0.85 * deltaScale, this.obj.y)
    }
  }
}

export default game