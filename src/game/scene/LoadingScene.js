import Scene from '@/libs/Scene.js'

import Game from '@/libs/Game.js'

import { Text } from 'pixi.js'

export default class LoadingScene extends Scene {
  constructor () {
    super()
  }
  
  onCreate () {
    const text = new Text('assasasa', { fill: '#ffffff' })
    this._container.addChild(text)
    console.log(text, Game.stage)
  }
  
  onShow () {
    Game.loader
      .add('/img/tap.png')
      .load(() => {
        this.startGame()
      })
  }
  
  startGame () {
    setTimeout(() => {
      Scene.load('GameScene').then((scene) => {
        console.log(scene)
        scene.open()
      })
      .catch((e) => {
        console.log(e)
      })      
    }, 3000)

  }
}