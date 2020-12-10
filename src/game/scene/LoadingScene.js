import Scene from '@/libs/Scene.js'

import Game from '@/libs/Game.js'

import { Text } from 'pixi.js'

export default class LoadingScene extends Scene {
  constructor () {
    super()
  }
  
  onCreate () {
    const text = new Text('assasasa', { fill: '#ffffff' })
    this.addChild(text)
    console.log(text, Game.stage)
  }
  
  onShow () {
    const gameConfig = Game.config.game
    Game.loader
      .add(gameConfig.resources)
      .add(gameConfig.bgm)
      .load(this.startGame.bind(this))
  }
  
  startGame (loader, resources) {
    const gameConfig = Game.config.game
    // 保存资源图集引用
    Game.use('sheet', resources[gameConfig.resources].spritesheet)
    
    setTimeout(() => {
      this.replace('GameScene', {}, {
        name: 'fadeOut'
      }, {
        name: 'fadeIn'
      })
      .then((res) => {
        this.release()
      })
      .catch((e) => {
        console.log(e)
      }) 
    }, 1000)

  }
}