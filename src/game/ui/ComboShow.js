import { Container, Sprite, Text } from 'pixi.js'
import { TimelineLite } from 'gsap'

import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'

import NoteUtils from '../core/NoteUtils.js'

export default class ComboShow extends Container {
  constructor () {
    super()
    this._init()
  }
  
  // 动画持续时间
  static ANIMATION_TIME = 200
  
  reset () {
    this.hide()
    
    this.combo = 0
    this.maxCombo = 0
  }
  
  _checkConfig () {
    const gameConfig = Game.config.game
    if (!Game.sheet || !utils.obj.isObject(gameConfig.comboTxtPos)) {
      throw new Error('Invalid combo resources config!')
    }
  }
  
  _init () {
    this.reset()
    
    this._checkConfig()
    
    const gameConfig = Game.config.game
    const pos = NoteUtils.resolvePos(gameConfig.comboTxtPos)
    const titleHeight = utils.obj.isValidNum(gameConfig.comboTxtPos.titleHeight) && gameConfig.comboTxtPos.titleHeight >= 0 ?
      gameConfig.comboTxtPos.titleHeight : 50
    const numHeight = utils.obj.isValidNum(gameConfig.comboTxtPos.numHeight) && gameConfig.comboTxtPos.numHeight >= 0 ?
      gameConfig.comboTxtPos.numHeight : 100
    this.x = pos.x
    this.y = pos.y
    
    const numTxt = new Text('', { align: 'center', fontSize: numHeight, fill: 0xffffff })
    const titleTxt = new Text('COMBO', { align: 'center', fontSize: titleHeight, fill: 0xffffff })
    numTxt.anchor.set(0.5, 0.5)
    titleTxt.anchor.set(0.5, 0.5)
    titleTxt.y = numHeight / 2 + titleHeight / 2
    this.addChild(numTxt)
    this.addChild(titleTxt)
    
    this.numTxt = numTxt
  }
  
  // 连击
  trigger (parent) {
    // 显示UI
    this.show(parent)
    
    // 统计连击
    this.setCombo()
    
    // 修改文字
    this.numTxt.text = this.combo.toString()
    
    // 播放动画
    const timeline = new TimelineLite()
    timeline.fromTo(this.scale, ComboShow.ANIMATION_TIME / 2000, { x: 1, y: 1 }, { x: 1.2, y: 1.2 })
      .to(this.scale, ComboShow.ANIMATION_TIME / 2000, { x: 1, y: 1 })
  }
  
  miss () {
    this.hide()
    
    this.combo = 0
    this.numTxt.text = this.combo.toString()
  }
  
  setCombo () {
    this.combo++
    if (this.combo > this.maxCombo) {
      this.maxCombo++
    }
  }
  
  show (parent) {
    if (!this.parent) {
      parent.addChild(this)
    }
  }
  
  hide () {
    if (this.parent) {
      this.parent.removeChild(this)
    }
  }
}