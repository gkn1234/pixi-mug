import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'

import MapItem from './MapItem.js'

// 谱面文件对象，对于谱面数据进行纠错、整理、排序
export default MapData {
  constructor (data) {
    this._data = data
    
    this._init()
  }
  
  // 检查输入数据的合法性
  _checkInit () {
    if (!utils.obj.isObject(this._data)) {
      throw new Error('Invalid map data!')
    }
  }
  
  // 检查某个整体变速对象是否合法
  static _isValidSpeedChange (obj) {
    if (
      // 参数必须为合法数字
      !util.obj.isValidNums(speedObj.speed, speedObj.start, speedObj.end) ||
      // 全局速度不得小于0，且起点不能超过终点
      (speedObj.speed < 0 || speedObj.start < 0 || speedObj.end < 0 || speedObj.end <= speedObj.start)
    ) {
      console.error('Invalid speed change data!', obj)
      return false
    }
    return true
  }
  
  // 构造谱面对象
  _init () {
    // 合法性检测
    this._checkInit()
    
    // 预处理整体变速对象
    this._preloadSpeedChange()
  }
  
  // 预处理整体变速对象，剔除不合法的对象
  _preloadSpeedChange () {
    if (!utils.obj.isArray(this._data.speedChanges)) {
      return
    }
    
    this.speedChanges = []
    const speedChanges = this._data.speedChanges
    const len = speedChanges.length
    for (let i = 0; i < len; i++) {
      let speedObj = speedChanges[i]
      const check = MapData._checkSpeedChange(speedObj)
      if (check) {
        this.speedChanges.push(speedObj)
      }
    }
    
    // 最后按照时间升序进行排序
    this.speedChanges.sort((a, b) => {
      return a.start - b.start
    })
  }
  
  // 解析谱面
  _resolveNotes () {
    if (!utils.obj.isArray(this._data.notes)) {
      return
    }
    
    this.notes = []
    const notes = this._data.notes
    const len = notes.length
    for (let i = 0; i < len; i++) {
      const note = new MapItem(notes[i])
      if (note.disabled) {
        continue
      }
      
    }
  }
  
  // 速度检测
  _initSpeed () {
    
  }
}