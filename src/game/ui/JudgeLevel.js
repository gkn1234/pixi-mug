import { Container, Sprite } from 'pixi.js'
import { TimelineLite } from 'gsap'

import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'

import NoteUtils from '../core/NoteUtils.js'

// 判定等级UI
export default class JudgeLevel extends Container {
  // textures 四种判定的纹理列表
  constructor () {
    super()
    this._init()
  }
  
  // 判定UI显示的持续时间
  static SHOW_TIME = 5000
  // 动画持续时间
  static ANIMATION_TIME = 200
  
  static _checkConfig () {
    const gameConfig = Game.config.game
    if (!Game.sheet || !utils.obj.isArray(gameConfig.judgeTxtSrc) || !utils.obj.isObject(gameConfig.judgeTxtPos)) {
      throw new Error('Invalid judge resources config!')
    }
  }
  
  static _initResources () {
    JudgeLevel._checkConfig()
    
    const gameConfig = Game.config.game
    JudgeLevel.textures = gameConfig.judgeTxtSrc.map((src) => {
      return Game.sheet.textures[src]
    })
  }
  
  // 初始化判定统计，统计数组的0/1/2/3/4对应 大P/小P/Good/Bad/Miss
  reset () {
    this.hide()
    
    const len = JudgeLevel.textures.length
    this.judgeSta = new Array(len)
    for (let i = 0; i < len; i++) {
      this.judgeSta[i] = 0
    }
  }
  
  _init () {
    if (!JudgeLevel.textures) {
      JudgeLevel._initResources()
    }
    
    this.reset()
    
    const gameConfig = Game.config.game
    
    const height = utils.obj.isValidNum(gameConfig.judgeTxtPos.height) && gameConfig.judgeTxtPos.height >= 0 ?
      gameConfig.judgeTxtPos.height : 60
    const pos = NoteUtils.resolvePos(gameConfig.judgeTxtPos)
    this.x = pos.x
    this.y = pos.y
    
    // 现将多种判定对应的Sprite都放入列表
    this.levelSprites = []
    const len = JudgeLevel.textures.length
    for (let i = 0; i < len; i++) {
      const sprite = new Sprite(JudgeLevel.textures[i])
      // 调整元素的宽高为相同比例，并且设置居中
      sprite.anchor.set(0.5, 0.5)
      const ratio = height / sprite.height
      sprite.scale.set(ratio)
      this.levelSprites.push(sprite)
    }
  }
  
  /*
    指定判定，触发判定等级UI显示。
    level的0/1/2/3/-1对应 大P/小P/Good/Bad/Miss
    scene 展示判定的场景容器
  */
  trigger (level, scene) {
    const len = this.levelSprites.length
    if (level >= len - 1) {
      return
    }
    
    // 展现
    this.show(scene)
    
    // 呈现对应的判定Sprite，并播放动画
    const index = level < 0 ? len - 1 : level
    const sprite = this.levelSprites[index]
    if (!sprite.parent) {
      // 如果没有父对象，说明判定进行了转化
      this.removeChild(this.children[0])
      this.addChild(sprite)
    }
    
    // 播放动画
    const timeline = new TimelineLite()
    timeline.fromTo(this.scale, JudgeLevel.ANIMATION_TIME / 2000, { x: 1, y: 1 }, { x: 1.2, y: 1.2 })
      .to(this.scale, JudgeLevel.ANIMATION_TIME / 2000, { x: 1, y: 1 })
    
    // 进行判定统计
    this.judgeSta[index]++
  }
  
  // 展现
  show (parent) {
    if (!this.parent) {
      parent.addChild(this)
    }
    
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.hide()
    }, JudgeLevel.SHOW_TIME)
  }
  
  // 隐藏
  hide () {
    if (this.parent) {
      this.parent.removeChild(this)
    }
    
    clearTimeout(this.timer)
  }
}