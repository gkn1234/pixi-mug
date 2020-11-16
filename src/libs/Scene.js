import { Container } from 'pixi.js'

import Game from './Game.js'

// 场景类
export default class Scene {
  constructor () {
    // 判断场景是否加载的标记
    this._isLoaded = false
    this._container = new Container()
  }
  
  // 打开场景
  open () {
    // 场景加入舞台
    Game.stage.addChild(this._container)
    // 打开完成后，执行对应的生命周期函数
    this.onShow()
  }
  
  // 关闭场景
  close () {
    this.onClose()
    // 关闭场景后，场景恢复到未加载状态
    this._isLoaded = false
  }
  
  // 替换场景，关闭当前场景，打开新场景
  replace () {
    
  }
  
  // 不关闭当前场景的情况下，打开新场景
  push () {
    
  }
  
  // 场景初始化的回调函数
  onCreate (params) {}
  
  // 场景加载时的回调函数
  onLoad (params) {}
  
  // 当场景展现时的回调函数
  onShow (params) {}
  
  // 当场景关闭前的回调函数
  onClose () {}
  
  static load (scene, params = {}) {
    return Game.scenes.load(scene, params = {})
  }
  
  static loadSync (scene, params = {}) {
    return Game.scenes.loadSync(scene, params = {})
  }
}