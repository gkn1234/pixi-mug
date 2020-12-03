import { Graphics, Sprite, Point } from 'pixi.js'

import Scene from '@/libs/Scene.js'
import Game from '@/libs/Game.js'
import utils from '@/libs/utils/index.js'

import KeyController from '../core/KeyController.js'

export default class GameScene extends Scene {
  constructor () {
    super()
  }
  
  // 仿射变换的倍率，这样顶部宽度正好是底部宽度的1 / 5
  // 仿射变换的原理没有搞清楚，现在是摸索API试出来的效果，以后一定要好好学计算机图形学
  static AFFINE_FACTOR = 5
  
  onCreate () {
    const config = Game.config
    const gameConfig = Game.config.game
    
    // 获取游戏资源
    this.sheet = Game.loader.resources['/assets.json'].spritesheet
    console.log(this.sheet)
    
    // 初始化谱面框架
    this.initNoteContainer()
    
    
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
        { time: 3000, type: 'Slide', key: 8, pos: 0, offset: 0 },
        { time: 3100, type: 'Slide', key: 8, pos: 1, offset: 0 },
        { time: 3200, type: 'Slide', key: 8, pos: 2, offset: 0 },
        { time: 3300, type: 'Slide', key: 8, pos: 3, offset: 0 },
        { time: 3400, type: 'Slide', key: 8, pos: 4, offset: 0 },
        { time: 3500, type: 'Slide', key: 8, pos: 5, offset: 0 },
        { time: 3600, type: 'Slide', key: 8, pos: 6, offset: 0 },
        { time: 3700, type: 'Slide', key: 8, pos: 7, offset: 0 },
        { time: 3800, type: 'Slide', key: 8, pos: 6, offset: 0 },
        { time: 3900, type: 'Slide', key: 8, pos: 5, offset: 0 },
        { time: 4000, type: 'Slide', key: 8, pos: 4, offset: 0 },
        { time: 4100, type: 'Slide', key: 8, pos: 3, offset: 0 },
        { time: 4200, type: 'Slide', key: 8, pos: 2, offset: 0 },
        { time: 4300, type: 'Slide', key: 8, pos: 1, offset: 0 },
        { time: 4400, type: 'Slide', key: 8, pos: 0, offset: 0 },
        { time: 4500, type: 'Slide', key: 8, pos: 1, offset: 0 },
        { time: 4600, type: 'Slide', key: 8, pos: 2, offset: 0 },
        { time: 4700, type: 'Slide', key: 8, pos: 3, offset: 0 },
        { time: 4800, type: 'Slide', key: 8, pos: 4, offset: 0 },
        { time: 4900, type: 'Slide', key: 8, pos: 5, offset: 0 },
        { time: 5000, type: 'Slide', key: 8, pos: 6, offset: 0 },
        { time: 5100, type: 'Slide', key: 8, pos: 7, offset: 0 },
        // { time: 3000, type: 'Hold', duration: 1000, key: 4, pos: 0, offset: 0, end: { key: 4, pos: 1, offset: 2 } },
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
    this.controller = new KeyController(this.noteData, this.noteContainer)
    console.log(this.controller)
  }
  
  // 初始化容器
  initNoteContainer () {
    const gameConfig = Game.config.game
    
    // 背景封面图
    
    
    // 按键容器，内部所有内容都会进行仿射变换，注意原点在容器底部中心
    this.noteContainer = new PIXI.projection.Container2d()
    this.noteContainer.position.set(Game.config.width / 2, gameConfig.containerHeight)
    
    // 容器皮肤
    const containerSkin = new PIXI.projection.Sprite2d(this.sheet.textures['board.png'])
    containerSkin.anchor.set(0.5, 1)
    containerSkin.width = gameConfig.containerWidth
    containerSkin.height = gameConfig.containerHeight * GameScene.AFFINE_FACTOR
    
    // 对容器做仿射变化，起到3D转2D的效果
    const ratio = GameScene.AFFINE_FACTOR > 1 ? 
      GameScene.AFFINE_FACTOR / (GameScene.AFFINE_FACTOR - 1) : 2
    const pos = new Point(0, gameConfig.containerHeight * ratio)
    this.noteContainer.proj.setAxisY(pos, -1)
    
    // 加入底部判定线
    const judgeLine = new Sprite(this.sheet.textures['judge.png'])
    judgeLine.width = gameConfig.containerWidth
    judgeLine.height = gameConfig.judgeLineToBottom
    judgeLine.anchor.set(0.5, 0)
    judgeLine.position.set(Game.config.width / 2, gameConfig.containerHeight - gameConfig.judgeLineToBottom)
    
    this.addChild(this.noteContainer)
    this.addChild(judgeLine)
    this.noteContainer.addChild(containerSkin)
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