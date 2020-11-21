import Game from '@/libs/Game.js'
import utils from '@/libs/utils/index.js'

// 按键判定器
export default class KeyCatcher {
  constructor (scene) {
    this.scene = scene
    this._init()
  }
  
  
  _init () {
    // 划分PC端和移动端，PC端键盘判定，移动端手势判定
    this._initMobileJudge()
  }
  
  // 移动端按键判定
  _initMobileJudge () {
    const gameConfig = Game.config.game
    // 生成判定区域
    let judgeArea = new Sprite(Game.loader.resources['/img/tap.png'].texture)
    judgeArea.width = Game.config.width
    judgeArea.height = gameConfig.judgeWidth
    judgeArea.y = gameConfig.keyDistanceY - gameConfig.judgeLineToBottom - gameConfig.judgeWidth / 2
    judgeArea.interactive = true
    this.scene.addChild(judgeArea)
    this.judgeArea = judgeArea
    console.log(judgeArea)
    
    judgeArea.on('pointerdown', (e) => {
      console.log(e)
    })
    judgeArea.on('pointermove', (e) => {
      console.log(e.data.identifier, e.data.global.x, e.data.global.y)
    })
    judgeArea.on('pointerup', () => {
      
    })
  }
}