import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'

import MapItem from './MapItem.js'

// 谱面文件对象，对于谱面数据进行纠错、整理、排序
export default class MapData {
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
      // 变速参数速度不得小于0或等于1，且起点不能超过终点
      (speedObj.speed < 0 || speedObj.speed === 1 || speedObj.start < 0 || speedObj.end < 0 || speedObj.end <= speedObj.start)
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
    
    // 解析谱面
    this._resolveNotes()
  }
  
  // 预处理整体变速对象，剔除不合法的对象
  _preloadSpeedChange () {
    if (!utils.obj.isArray(this._data.speedChanges)) {
      return
    }
    
    this.speedChanges = []
    const speedChanges = this._data.speedChanges
    let len = speedChanges.length
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
    
    // 第二遍遍历检查，后一个变速的start必须大于前一个变速的end，否则将强制调整
    len = this.speedChanges.length
    for (let i = 0; i < len; i++) {
      let speedObj = this.speedChanges[i]
      if (i > 0 && speedObj.start < this.speedChanges[i - 1].end) {
        speedObj.start = this.speedChanges[i - 1].end
      }
    }
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
      const note = new MapItem(notes[i], this.speedChanges)
      if (note.disabled) {
        continue
      }
      this.notes.push(note)
    }
    
    // 最后按照时间升序进行排序
    this.notes.sort((a, b) => {
      return a.start - b.start
    })
  }
  
  // 将谱面指针与变速指针均置为开头
  begin () {
    this.index = 0
    this.speedIndex = 0
  }
  
  // 获取下一个谱面对象
  nextNote () {
    return this.index + 1 >= this.notes.length ? null : this.notes[this.index + 1]
  }
  
  // 获取下一个变速对象
  nextSpeed () {
    return this.speedIndex + 1 >= this.speedChanges.length ? null : this.speedChanges[this.speedIndex + 1]
  }
  
  // 以当前时间触发谱面指针与变速指针更新，返回需要下落的所有按键
  forward (time) {
    let res = []
    
    let note = this.notes[this.index]
    // 更新谱面指针，计算需要下落的按键
    while (note && time >= note.start) {
      res.push(note)
      this.index++
      note = this.nextNote()
    }
    
    // 更新变速指针
    let speed = this.nextSpeed()
    while (speed && time >= speed.start && time <= speed.end) {
      this.speedIndex++
      speed = this.nextSpeed()
    }
    
    return res
  }
  
  // 获取当前变速参数
  getCurrentSpeed () {
    return this.speedChanges.length === 0 ? 1 : this.speedChanges[this.speedIndex].speed
  }
}