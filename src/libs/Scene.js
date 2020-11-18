import { Container } from 'pixi.js'
import { TimelineLite } from 'gsap'

import Game from './Game.js'

import utils from './utils/index.js'

// 场景类
export default class Scene extends Container {
  constructor () {
    super()
    // 判断场景是否加载的标记
    this._isSceneLoaded = false
  }
  
  static SCENE_ANIMATIONS = {
    // 淡入动画
    fadeIn: { 
      fromVars: { alpha: 0 }, 
      toVars: { alpha: 1 } ,
    },
    // 淡出动画
    fadeOut: { 
      fromVars: { alpha: 1 },
      toVars: { alpha: 0 },
    },
  }
  
  /*
    执行场景过渡动画
    options {Object} 动画参数。如为null，则不播放动画。为Object时成员如下：
      duration {Number} [1000] 动画持续时间，单位毫秒.
        {Number} [-1] 为负数时，不采用动画
      name {String} - 指定了此参数时，则获取记录中的基础动画参数
      to {Object} - 没有指定name时，此参数有效。此参数为传给Tween方法的对象，动画终止状态
        ? - 不填此参数时，name必须指定
      from {Object} -  传给Tween方法的对象，动画起始状态
        ? - 不填此参数时，Tween调用to方法，不指定其实状态，而是由现状态过渡
  */
  sceneAnimate (options = null) {
    return new Promise((resolve, reject) => {
      const ANIMATE_WARN = 'There are invalid params for Scene Animate!'
      if (!options || typeof options !== 'object') {
        // options参数不为对象，忽略动画播放
        resolve(this)
      }
      
      let duration = options.duration
      if (duration < 0 || !utils.obj.isValidNum(duration)) {
        duration = 1000
      }
      
      let fromVars, toVars
      if (options.name && utils.obj.isString(options.name)) {
        // 指定了name时，获取预定义的动画参数
        const res = Scene.SCENE_ANIMATIONS[options.name]
        if (!res) {
          // 参数有问题，不播放动画
          console.warn(ANIMATE_WARN)
          resolve(this)
        }
        fromVars = res.fromVars
        toVars = res.toVars
      }
      else if (options.to && typeof options.to === 'object') {
        // 不传name时，必须指定to
        fromVars = options.from
        toVars = options.to
      }
      else {
        // 获取失败，不播放动画
        console.warn(ANIMATE_WARN)
        resolve(this)
      }
      
      // 执行动画
      const timeline = new TimelineLite({
        onComplete: () => {
          resolve(this)
        }
      })
      
      if (!fromVars || typeof fromVars !== 'object') {
        // 未指定动画起始状态
        timeline.to(this, duration / 1000, toVars)
      }
      else {
        timeline.fromTo(this, duration / 1000, fromVars, toVars)
      }
    })
  }
  
  /* 
    打开本场景，动画参数意义同上
  */
  async open (animateOptions) {
    // 场景加入舞台
    Game.stage.addChild(this)
    // 打开瞬间声明周期
    this.onOpen()
    // 播放打开动画
    await this.sceneAnimate(animateOptions)
    // 打开完成后，执行对应的生命周期函数
    this.onShow()
    return this
  }
  
  // 关闭本场景，动画参数意义同上
  async close (animateOptions) {
    // 播放关闭动画
    await this.sceneAnimate(animateOptions)
    // 场景退出舞台
    Game.stage.removeChild(this)
    // 执行对应的生命周期函数
    this.onClose()
    // 关闭场景后，场景恢复到未加载状态
    this._isSceneLoaded = false
    return this
  }
  
  // 释放场景及其内存
  async release (closeScene = false, closeAnimations) {
    if (!this._isSceneLoaded) {
      // 场景已经关闭，直接释放即可
      this.onDestroy()
    }
    else {
      if (closeScene) {
        // 对于打开的场景，并且指定了需要先关闭场景的情况
        await this.close(closeAnimations)
        this.onDestroy()
        Game.scenes.release(this.name)
      }
      else {
        // 强制销毁打开的场景
        Game.stage.removeChild(this)
        // 关闭周期
        this.onClose()
        this._isSceneLoaded = false
        // 销毁周期
        this.onDestroy()
      }
    }    

    // 通知场景管理器回收场景
    Game.scenes.release(this.name)
  }
  
  // 替换场景，关闭当前场景，打开新场景
  async replace (scene, params = {}, thisSceneAnimations, newSceneAnimations) {
    const newScene = await Scene.load(scene, params)
    await this.close(thisSceneAnimations)
    await newScene.open(newSceneAnimations)
    return newScene
  }
  
  // 不关闭当前场景的情况下，打开新场景
  async push (scene, params = {}, newSceneAnimations = {}) {
    const newScene = await Scene.load(scene, params)
    await newScene.open(newSceneAnimations)
    return newScene
  }
  
  // 场景初始化的回调函数
  onCreate (params) {}
  
  // 场景加载时的回调函数
  onLoad (params) {}
  
  // 场景打开瞬间的回调函数
  onOpen () {}
  
  // 当场景展现时的回调函数
  onShow () {}
  
  // 当场景关闭后的回调函数
  onClose () {}
  
  // 场景被释放前的回调函数
  onDestroy () {}
  
  static load (scene, params = {}) {
    return Game.scenes.load(scene, params = {})
  }
  
  static loadSync (scene, params = {}) {
    return Game.scenes.loadSync(scene, params = {})
  }
}