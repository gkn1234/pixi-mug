import { Graphics, Sprite } from 'pixi.js'

import Scene from '@/libs/Scene.js'
import Game from '@/libs/Game.js'
import utils from '@/libs/utils/index.js'

import KeyController from '../keys/KeyController.js'

export default class GameScene extends Scene {
  constructor () {
    super()
  }
  
  onCreate () {
    const config = Game.config
    const gameConfig = Game.config.game
    
    // 获取游戏资源
    this.sheet = Game.loader.resources['/assets.json'].spritesheet
    console.log(this.sheet)
    // 画底部判定线
    let judgeLine = new Graphics()
    const judgeLineY = config.height - gameConfig.judgeLineToBottom
    judgeLine.lineStyle(2, 0xFFFFFF)
    judgeLine.moveTo(0, judgeLineY)
    judgeLine.lineTo(config.width, judgeLineY)
    this.addChild(judgeLine)
    
    // 画背景图
    
    // 读取谱面
    this.noteData = {
      notes: [
        { time: 825, type: 'Tap', key: 4, pos: 0, offset: 0 },
        { time: 825, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 1180, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 1357, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 1712, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 2067, type: 'Tap', key: 4, pos: 0, offset: 1 },
        { time: 2422, type: 'Tap', key: 4, pos: 0, offset: 2 },
        { time: 2599, type: 'Tap', key: 4, pos: 1, offset: 1 },
        { time: 2776, type: 'Tap', key: 4, pos: 1, offset: 2 },
        { time: 3000, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 3100, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 3200, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 3300, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 3400, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 3500, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 3600, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 3700, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 3800, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 3900, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 4000, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 4100, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 4200, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 4300, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 4400, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 4500, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 4600, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 4700, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 4800, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 4900, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 5000, type: 'Slide', key: 4, pos: 0, offset: 0 },
        { time: 5100, type: 'Slide', key: 4, pos: 0, offset: 0 },
        /*{ time: 3000, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 3100, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 3200, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 3300, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 3400, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 3500, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 3600, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 3700, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 3800, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 3900, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 4000, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 4100, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 4200, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 4300, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 4400, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 4500, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 4600, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 4700, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 4800, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 4900, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 5000, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 5100, type: 'Tap', key: 4, pos: 1, offset: 0 },
        { time: 3000, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 3100, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 3200, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 3300, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 3400, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 3500, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 3600, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 3700, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 3800, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 3900, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 4000, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 4100, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 4200, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 4300, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 4400, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 4500, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 4600, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 4700, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 4800, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 4900, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 5000, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 5100, type: 'Tap', key: 4, pos: 2, offset: 0 },
        { time: 3000, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 3100, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 3200, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 3300, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 3400, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 3500, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 3600, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 3700, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 3800, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 3900, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 4000, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 4100, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 4200, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 4300, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 4400, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 4500, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 4600, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 4700, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 4800, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 4900, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 5000, type: 'Tap', key: 4, pos: 3, offset: 0 },
        { time: 5100, type: 'Tap', key: 4, pos: 3, offset: 0 },*/
      ],
      speedChanges: [
        
      ],
      bpm: 150
    }
    // 初始化游戏控制器
    this.controller = new KeyController(this.noteData, this)
    console.log(this.controller)
  }
  
  onOpen () {
    // 显示标题
    Game.ui.$refs.playTitle.show()
    
    // 绑定控制器和UI
    Game.ui.$refs.judgeShow.show()
    
    // 启动遮罩层
    Game.ui.$refs.gameMask.show()
    // 绑定游戏全屏事件
    Game.ui.$refs.playTitle.setEvent('onFullScreen', this.fullScreen.bind(this))
  }
  
  onShow () {
    // 绑定遮罩层点击事件，允许单击屏幕启动游戏
    Game.ui.$refs.gameMask.setEvent('onStart', this.gameStart.bind(this))
    // 绑定遮罩层点击事件，暂停后可以继续游戏
    Game.ui.$refs.gameMask.setEvent('onResume', this.gameResume.bind(this))
    // 绑定遮罩层点击事件，暂停后可以重开开游戏
    Game.ui.$refs.gameMask.setEvent('onRestart', this.gameRestart.bind(this))
  }
  
  gameStart () {
    Game.ui.$refs.gameMask.hide()
    // 绑定游戏暂停事件
    Game.ui.$refs.playTitle.setEvent('onPause', this.gamePause.bind(this))
 
    this.controller.start()
  }
  
  gamePause () {
    this.controller.pause()
    
    // 显示暂停遮罩
    Game.ui.$refs.gameMask.pauseShow()
    // 暂停按钮取消绑定事件
    Game.ui.$refs.playTitle.setEvent('onPause', null)
  }
  
  gameResume () {
    // 遮罩切换为回复遮罩
    Game.ui.$refs.gameMask.resumeShow().then(() => {
      // 重新绑定游戏暂停事件
      Game.ui.$refs.playTitle.setEvent('onPause', this.gamePause.bind(this))
      
      this.controller.resume()      
    })    
  }
  
  gameRestart () {
    Game.ui.$refs.gameMask.hide()
    // 重新绑定游戏暂停事件
    Game.ui.$refs.playTitle.setEvent('onPause', this.gamePause.bind(this))

    this.controller.restart() 
  }
  
  fullScreen () {
    if (utils.common.getFullSceenEle()) {
      utils.common.exitFullScreen()
    }
    else {
      utils.common.enterFullScreen()
    }
  }
}