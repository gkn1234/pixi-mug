/*
import { Application, Loader } from 'pixi.js'

import config from '@/config.js'
import TapKey from './keys/TapKey.js'

// 单例对象
export default class Game {
  constructor (gameCanvas, context, options = {}) {    
    if (typeof Game.instance === 'object') {
      return Game.instance
    }
    Game.instance = this
    
    const appOptions = {
      width: config.width,
      height: config.height,
      view: gameCanvas,
      ...options
    }
    this.app = new Application(appOptions)
    this.context = context
    this.stage = this.app.stage
    this.ticker = this.app.ticker
    // 初始化资源加载器
    this.loader = new Loader()
    
    return this
  }
}


const game = {
  app: null,
  loader: null,
  
  start (gameCanvas) {
    const app = new PIXI.Application({
      width: config.width,
      height: config.height,
      view: gameCanvas
    })
    game.app = app
    console.log(game.app.stage)
    game.loader = new PIXI.Loader()
    game.loader
      .add('/img/tap.png')
      .load(game.setup);
  },
  
  setup () {
    const gameContainer = new PIXI.Container()
    gameContainer.x = (config.width - config.game.bottomMaxWidth) / 2
    gameContainer.y = 0
    game.app.stage.addChild(gameContainer)
    
    const tapKeyTexture = game.loader.resources['/img/tap.png'].texture
    
    const key1 = new TapKey(tapKeyTexture, {
      posNum: 1
    })
    key1.startDrop(gameContainer, game.app.ticker)
    setTimeout(() => {
      const key2 = new TapKey(tapKeyTexture, {
        posNum: 2
      })
      key2.startDrop(gameContainer, game.app.ticker)
    }, 100)
    setTimeout(() => {
      const key3 = new TapKey(tapKeyTexture, {
        posNum: 3
      })
      key3.startDrop(gameContainer, game.app.ticker)
    }, 200)
    setTimeout(() => {
      const key4 = new TapKey(tapKeyTexture, {
        posNum: 4
      })
      key4.startDrop(gameContainer, game.app.ticker)      
    }, 300)



  },
}

export default game
*/

import Game from '@/libs/Game.js'

import config from './config.js'
import scenes from './scenes.js'

/*
  gameCanvas canvas对象
  context 启动时的Vue上下文
*/
export default function (gameCanvas, context) {
  Game.useView(gameCanvas)
    .useConfig(config)
    .useScenes(scenes)
    .use('ui', context)
    .start()
}