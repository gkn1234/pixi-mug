import utils from '@/utils/index.js'

export default class SceneManager {
  // 传入一个数组，记录场景数据
  constructor (data = []) {    
    if (typeof SceneManager.instance === 'object') {
      return SceneManager.instance
    }
    SceneManager.instance = this
    
    if (!utils.obj.isArray(data)) {
      throw new Error('Invalid scenes data!')
    }
    this.scenesData = data
    // 储存场景对象的数据结构
    this.scenesMap = {}
  }
  
  /*
    场景替换，关闭当前场景，打开
  */
  replace () {
    
  }
  
  
  /*
    加载场景
  */
  load (scene, params = {}) {
    return new Promise((resolve, reject) => {
      const sceneObj = this.loadSync(scene, params = {})
      resolve(sceneObj)
    })    
  }
  
  loadSync (scene, params = {}) {
    const sceneObj = this._resolveScene(scene, params = {})
    if (!sceneObj._isLoaded) {
      sceneObj.onLoad(params)
      sceneObj._isLoaded = true
    }
    return sceneObj
  }
  
  // 获取场景对象
  _resolveScene (scene, params = {}) {
    // scene默认为字符串
    let sceneData
    if (utils.obj.isValidNum(scene)) {
      if (scene < 0 || scene >= this.scenesData) {
        throw new Error('Target scene does not exist!')
      }
      // 参数为数字
      sceneData = this.scenesData[scene]
    }
    else if (utils.obj.isString(scene) && scene !== '') {
      const res = this.scenesData.find(item => item.name === scene)
      if (!res) {
        throw new Error('Target scene does not exist!')
      }
      sceneData = res
    }
    else {
      throw new Error('Invalid scene name!')
    }
    
    if (!this.scenesMap[sceneData.name]) {
      const InitFunc = sceneData.component
      if (!InitFunc || typeof InitFunc !== 'function' || !InitFunc.prototype) {
        throw new Error('Invalid scene data!')
      }
      this.scenesMap[sceneData.name] = new InitFunc()
      // 新创建的场景要经过初始化
      this.scenesMap[sceneData.name].onCreate(params)
    }
    
    return this.scenesMap[sceneData.name]
  }
}