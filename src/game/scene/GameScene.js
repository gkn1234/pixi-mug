import Scene from '@/libs/Scene.js'

import Game from '@/libs/Game.js'

import { Text } from 'pixi.js'

export default class GameScene extends Scene {
  constructor () {
    super()
  }
  
  onCreate () {
    const text = new Text('bbbbb', { fill: '#ffffff' })
    this._container.addChild(text)
    console.log(text, Game.stage)
  }
  
  onShow () {
    console.log(1)
  }
}