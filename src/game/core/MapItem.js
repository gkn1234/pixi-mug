import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'

import NoteUtils from './NoteUtils.js'

// 谱面文件单个按键信息
export default class MapItem {
  constructor (data, speedChanges) {
    // 把按键参数和全局变速信息先保存下来
    this._data = data
    this._data.globalSpeedChanges = speedChanges
    
    this._init()
  }
  
  // 检查输入数据的合法性
  _checkInit () {
    if (
      // 数据必须为对象类型
      !utils.obj.isObject(this._data) ||
      // 必须指定合法的type
      NoteUtils.NOTE_TYPES.indexOf(this._data.type) < 0 ||
      // 必须指定合法的time
      (!utils.obj.isValidNum(this._data.time) || this._data.time < 0)
    ) {
      this._warnInvalidItem()
      return false
    }
    return true
  }
  
  // 数据非法警示
  _warnInvalidItem () {
    console.error('Invalid note data!', this._data)
  }
  
  _init () {
    const checkInit = this._checkInit()
    if (!checkInit) {
      // 初始化数据非法
      this.disabled = true
      return
    }
    
    // 获取时间
    this.time = this._data.time
    // 获取持续时间
    this.duration = utils.obj.isValidNum(this._data.duration) && this._data.duration > 0 ? this._data.duration : 0
    // 先将输入数据拷贝给对象
    Object.assign(this, this._data)
    
    // 对于 key/pos/offset 三个轨道位置参数进行修正，并计算出位置信息width/x
    this._fixedPos(this)
    if (this.end && utils.obj.isObject(this.end)) {
      // 补充end对象，Hold键型具有end对象
      this.end.key = this.key
      this._fixedPos(this.end)
    }
    
    // 获取独特的设置，如高度，资源纹理等，见config.game中的noteUnique字段。计算出 texture/height
    this._initUnique()
    // 解析变速信息
    this._resolveSpeedChange()
  }
  
  /*
    key/pos/offset 三个参数能够精确指定按键在轨道中的位置，此函数对于传入对象obj的三参数进行修正
    @key {Number} [4] - 指定该键是几key下的按键，取值范围2 - 8
    @pos {Number} [1] - 指定该按键在第几条轨道上，0号轨道在最左边，取值范围0 - (key - 1)
    @offset {Number} [0] - 指定该键在原有标准位置下的偏移量，正数向右，负数向左。-4会偏移到左边一轨，4会偏移到右边一轨
  */
  _fixedPos (obj) {
    // 规范化key
    obj.key = utils.obj.isValidNum(obj.key) && obj.key >= NoteUtils.MIN_KEY_NUM && obj.key <= NoteUtils.MAX_KEY_NUM ?
      Math.floor(obj.key) : NoteUtils.DEFAULT_KEY_NUM
    
    // 初步规范化pos
    obj.pos = utils.obj.isValidNum(obj.pos) && obj.pos >= 0 && obj.pos < obj.key ?
      Math.floor(obj.pos) : 0
      
    // 分析offset
    if (!utils.obj.isValidNum(obj.offset) || obj.offset < 0) {
      // 完全不合法的offset，此时给予默认值0
      obj.offset = 0
    }
    else if (obj.offset >= 0 && obj.offset < NoteUtils.OFFSET_TO_NEXT) {
      // offset偏移量正常，无需进一步调整
    }
    else {
      // 先算出offset的极限
      const { min, max } = this._getOffsetBorder(obj)
      if (obj.offset < min) {
        obj.offset = min
      }
      if (obj.offset > max) {
        obj.offset = max
      }
      // 大于OFFSET_TO_NEXT的offset要通过偏移pos的方式控制下来
      const deltaPos = offset / NoteUtils.OFFSET_TO_NEXT
      obj.pos = obj.pos + deltaPos
      obj.offset = obj.offset % NoteUtils.OFFSET_TO_NEXT
    }
    
    // 最后根据三大参数补充位置信息
    this._getGeo(obj)
  }
  
  // 以当下对象的key和pos，计算offset的临界值
  _getOffsetBorder (obj) {
    const rightPos = NoteUtils.MAX_KEY_NUM - obj.pos
    const leftPos = obj.pos
    return {
      min: (-1) * leftPos * NoteUtils.OFFSET_TO_NEXT,
      max: rightPos * NoteUtils.OFFSET_TO_NEXT
    }
  }
  
  /* 
    以给定对象的三大参数计算出位置信息
    X坐标参考anchor(0.5, 0)
  */
  _getGeo (obj) {
    // 获取有效宽度
    const { effWidth, containerWidth } = NoteUtils.getValidSize()
    
    // 按键宽度
    const width = effWidth / obj.key
    // 原始坐标，以游戏区域最左侧为原点
    const offsetX = (containerWidth - effWidth) / 2
    const rawX = obj.pos * width + obj.offset * (width / NoteUtils.OFFSET_TO_NEXT) + (width * 0.5) + offsetX
    // 转换为坐标系内的有效坐标，以判定线中点为原点
    const x = NoteUtils.raw2EffX(rawX)
    
    obj.width = width
    obj.x = x
  }
  
  // 获取独特的设置，如高度，资源纹理等，见config.game中的noteUnique字段
  _initUnique () {
    const noteUnique = NoteUtils.getNoteUnique(this.type)
    if (!noteUnique) {
      throw new Error('Invalid note unique config!')
    }
    
    const noteSrc = noteUnique.src
    this.style = utils.obj.isValidNum(this.style) && this.style >= 0 && this.style < noteSrc.length ? Math.floor(options.style) : 0
    this.textureName = noteSrc[this.style]
    
    const sheet = Game.sheet
    this.texture = sheet.textures[this.textureName]
    
    if (noteUnique.hasOwnProperty('splitSrc')) {
      // Hold专属，长条头部尾部的分节按键
      const splitSrc = noteUnique.splitSrc
      this.splitTextureName = splitSrc[this.style]
      this.splitTexture = sheet.textures[this.splitTextureName]
    }
    
    if (noteUnique.hasOwnProperty('height')) {
      // 对Tap、Swipe、Slide来说非常重要的高度
      this.height = noteUnique.height
    }
  }
  
  // 解析变速，计算初始高度和开始下落的时间
  _resolveSpeedChange () {
    const gameConfig = Game.config.game
    const { tNoteMove, vStandard } = NoteUtils.getMoveData()
    const { effHeight } = NoteUtils.getValidSize()
    const { timeBeforeStart } = NoteUtils.getDelayData()
    const speedChanges = this._data.globalSpeedChanges
    // 初始化变速区间，构建一个从游戏开始到按键落下的时间序列
    const startTime = timeBeforeStart * (-1)
    const endTime = this.time + this.duration
    let speedSections = [this._createSpeedSection(startTime, endTime, 1)]
    
    // 初始化y - 按键初始高度
    this.y = null
    // 初始化start - 按键下落时间
    this.start = null
    // 初始化Hold的长度
    this.distance = null
    
    let len = speedChanges.length
    for (let i = 0; i < len; i++) {
      const speedChange = speedChanges[i]
      // 切割变速区间
      this._cutSpeedSections(speedSections, speedChange)
    }
    
    const startIndex = this._findSpeedSectionIndex(speedSections, this.time)
    const endIndex = speedSections.length - 1
    let s = 0
    // 根据relativeSpeedChange中的变速对象，计算按键从顶部出现的准确时间
    for (let i = startIndex; i >= 0; i--) {
      const section = speedSections[i]
      const v = section.speed * vStandard
      const t = i === startIndex ? this.time - section.start : section.end - section.start
      if (s + v * t >= effHeight) {
        // 距离超限，说明下落点就在这一段，按键可以从顶点下落
        const tLeft = (effHeight - s) / v
        this.start = section.end - tLeft
        this.y = NoteUtils.raw2EffY(0)
        break
      }
      s = s + v * t
    }
    if (this.y === null || this.start === null) {
      // 若追溯到源头都无法走完路程，说明开头的起始位置不为0
      this.y = NoteUtils.raw2EffY(effHeight - s)
      this.start = startTime      
    }
    
    // 迭代计算Hold的长度
    let d = 0
    for (let i = endIndex; i >= startIndex; i--) {
      const section = speedSections[i]
      const v = section.speed * vStandard
      const t = i === startIndex ? section.end - this.time : section.end - section.start
      d = d + v * t
    }
    this.distance = d
  }
  
  // 创建变速区间
  _createSpeedSection (start, end, speed = 1) {
    return { start, end, speed }
  }
  
  // 给定变速区间和时间，定位变速对象
  _findSpeedSectionIndex (speedSections = [], time) {
    const index = speedSections.findIndex((obj) => {
      return obj.start < time && time <= obj.end
    })
    return index
  }
  
  // 切割变速区间
  _cutSpeedSections (speedSections = [], speedChange) {
    const index = this._findSpeedSectionIndex(speedSections, speedChange.start)
    if (index < 0) { return }
    
    const section = speedSections[index]
    if (section.speed !== 1) {
      // 因为变速区间不可重叠，所以不会对speed不为1的区间进行处理
      return
    }

    if (speedChange.end >= section.end) {
      // 情况1 左边界不够，右边界超出
      const tail = section.end
      section.end = speedChange.start
      speedSections.splice(index + 1, 0, this._createSpeedSection(speedChange.start, tail, speedChange.speed))
      return
    }
    else {
      // 情况2 左边界不够，右边界也不够
      const tail = section.end
      section.end = speedChange.start
      speedSections.splice(index + 1, 0, this._createSpeedSection(speedChange.start, speedChange.end, speedChange.speed))
      speedSections.splice(index + 2, 0, this._createSpeedSection(speedChange.end, tail, 1))
      return
    }
  }
}