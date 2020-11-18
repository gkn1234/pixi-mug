import { Text, Graphics, Sprite, Texture } from 'pixi.js'

import Scene from '@/libs/Scene.js'
import Game from '@/libs/Game.js'

import KeyController from '../keys/KeyController.js'

export default class GameScene extends Scene {
  constructor () {
    super()
  }
  
  onCreate () {
    this.initUI()
    // 添加遮罩层
    
    // 谱面按键列表
    this.noteData = {
      notes: [],
      speedChanges: []
    }
    
    // 读取谱面
    this.controller = new KeyController(this.noteData)
    
  }
  
  onOpen () {
    Game.ui.$refs.playTitle.show()
    Game.ui.$refs.startMask.show(this.gameStart.bind(this))
  }
  
  onShow () {
    /*console.log(1)
    const s = new Sprite(Game.loader.resources['/img/tap.png'].texture)
    this.addChild(s)
    s.vertexData[4] = 200
    console.log(s, s.getLocalBounds())*/
    const s = new Sprite(Game.loader.resources['/img/tap.png'].texture)
    this.addChild(s)
    s.interactive = true;
    s.on('click', () => {
      console.log(1)
    })
    s.on('tap', () => {
      console.log(1)
    })
  }
  
  initUI () {
    const config = Game.config
    const gameConfig = Game.config.game
    
    // 画底部判定线
    let judgeLine = new Graphics()
    const judgeLineY = config.height - gameConfig.judgeLineToBottom
    judgeLine.lineStyle(2, 0xFFFFFF)
    judgeLine.moveTo(0, judgeLineY)
    judgeLine.lineTo(config.width, judgeLineY)
    this.addChild(judgeLine)
    
    
  }
  
  gameStart () {
    Game.ui.$refs.startMask.hide()
    this.controller.start()
  }
}