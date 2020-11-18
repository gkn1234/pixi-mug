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
    Game.loader
      .add('bgm', '/bgm/a.mp3')
      .add('/img/tap.png')
      .load(() => {
        this.startGame()
      })
  }
  
  startGame () {
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