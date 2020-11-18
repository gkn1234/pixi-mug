import { Application, Loader } from 'pixi.js'

import SceneManager from './SceneManager.js'

import utils from './utils/index.js'

const Game = {
  // 启动游戏
  start () {
    if (!Game.config) {
      throw new Error('You must set Game.config by Game.useConfig() before start!')
    }
    if (!Game.canvas) {
      throw new Error('You must set Game.canvas by Game.useView() before start!')
    }
    
    const config = Game.config
    const appOptions = {
      width: config.width,
      height: config.height,
      view: Game.canvas,
      ...config.startOptions
    }
    Game.app = new Application(appOptions)
    // 游戏主舞台
    Game.stage = Game.app.stage
    // 游戏循环渲染器
    Game.ticker = Game.app.ticker
    // 初始化资源加载器
    Game.loader = new Loader()
    
    
    if (Game.scenes) {
      // 未指定初始场景，则打开配置的第一个场景
      const startScene = config.startScene && config.startScene !== '' ? config.startScene : 0
      Game.scenes.load(startScene).then((scene) => {
        scene.open()
      })
      .catch((e) => {
        console.log(e)
      })
    }
  },
  
  // 设置Game对象的key为value
  use (key = '', value) {
    Game[key] = value
    return Game
  },
  
  // 设置Game对象的config配置信息
  useConfig (config) {
    Game.config = config
    return Game
  },
  
  // 设置Game对象的场景信息
  useScenes (scenes) {
    Game.scenes = new SceneManager(scenes)
    return Game
  },
  
  // 设置游戏渲染的canvas
  useView (canvas) {
    Game.canvas = canvas
    return Game
  },
  
  // 启动一个
  startScene () {
    
  },
  
  // 解析配置文件
  _resolveConfig (config) {
    
  }
}

// 最好不要乱搞Game对象
const GameProxy = new Proxy(Game, {
  /*
  get (target, key) {
    if (!Game.enabled) {
      if (typeof target[key] === 'function') {
        return target[key]
      }
      throw new Error('You can\'t visit Game\'s prop before Game.start()!')
    }
    return target[key]
  },
  */
  set (target, key, value) {
    throw new Error('You cant\'t set Game\'s prop without functions!')
  }
})

export default GameProxy