import * as PIXI from 'pixi.js'

import config from '@/config.js'

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
    game.loader = new PIXI.Loader()
    
    game.loader
      .add('/img/tap.png')
      .load(game.setup);
  },
  
  setup () {
    //Create the cat sprite
    let obj = new PIXI.Sprite(game.loader.resources['/img/tap.png'].texture)
    //Add the cat to the stage
    game.app.stage.addChild(obj)
  }
}

export default game