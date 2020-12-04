import NoteUtils from './NoteUtils.js'

// 谱面文件单个按键项
export default class MapItem {
  constructor (data, speedChanges) {
    // 把按键参数和全局变速信息先保存下来
    this._data = data
    this._data.globalSpeedChanges = speedChanges
    
    this._init()
  }
  
  // 合法的按键类型
  static NOTE_TYPES = ['Tap', 'Slide', 'Hold', 'Swipe']
  // 按键offset偏移到下一轨时的参数
  static OFFSET_TO_NEXT = 4
  // 最大与小轨道数
  static MIN_KEY_NUM = 2
  static MAX_KEY_NUM = 8
  static DEFAULT_KEY_NUM = 4
  
  // 检查输入数据的合法性
  _checkInit () {
    if (
      // 数据必须为对象类型
      !utils.obj.isObject(this._data) ||
      // 必须指定合法的type
      NOTE_TYPES.indexOf(this._data.type) < 0
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
    
    // 先将输入数据拷贝给对象
    Object.assign(this, this._data)
    // 对于 key/pos/offset 三个轨道位置参数进行修正，并计算出位置信息width/x
    this._fixedPos(this)
    // 获取独特的设置，如高度，资源纹理等，见config.game中的noteUnique字段。计算出 texture/height
    this._initUnique()
    // 解析变速
    // this._resolveSpeedChange()
  }
  
  /*
    key/pos/offset 三个参数能够精确指定按键在轨道中的位置，此函数对于传入对象obj的三参数进行修正
    @key {Number} [4] - 指定该键是几key下的按键，取值范围2 - 8
    @pos {Number} [1] - 指定该按键在第几条轨道上，0号轨道在最左边，取值范围0 - (key - 1)
    @offset {Number} [0] - 指定该键在原有标准位置下的偏移量，正数向右，负数向左。-4会偏移到左边一轨，4会偏移到右边一轨
  */
  _fixedPos (obj) {
    // 规范化key
    obj.key = utils.obj.isValidNum(obj.key) && obj.key >= MapItem.MIN_KEY_NUM && obj.key <= MapItem.MAX_KEY_NUM ?
      Math.floor(obj.key) : MapItem.DEFAULT_KEY_NUM
    
    // 初步规范化pos
    obj.pos = utils.obj.isValidNum(obj.pos) && obj.pos >= 0 && obj.pos < obj.key ?
      Math.floor(obj.pos) : 0
      
    // 分析offset
    if (!utils.obj.isValidNum(obj.offset) || obj.offset < 0) {
      // 完全不合法的offset，此时给予默认值0
      obj.offset = 0
      return
    }
    else if (obj.offset >= 0 && obj.offset < MapItem.OFFSET_TO_NEXT) {
      // offset偏移量正常，无需进一步调整
      return
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
      const deltaPos = offset / MapItem.OFFSET_TO_NEXT
      obj.pos = obj.pos + deltaPos
      obj.offset = obj.offset % MapItem.OFFSET_TO_NEXT
    }
    
    // 最后根据三大参数补充位置信息
    this._getGeo(obj)
  }
  
  // 以当下对象的key和pos，计算offset的临界值
  _getOffsetBorder (obj) {
    const rightPos = MapItem.MAX_KEY_NUM - obj.pos
    const leftPos = obj.pos
    return {
      min: (-1) * leftPos * MapItem.OFFSET_TO_NEXT,
      max: rightPos * MapItem.OFFSET_TO_NEXT
    }
  }
  
  /* 
    以给定对象的三大参数计算出位置信息
    X坐标参考anchor(0.5, 0)
  */
  _getGeo (obj) {
    // 获取有效宽度
    const { effWidth } = NoteUtils.getValidSize()
    
    // 按键宽度
    const width = effWidth / obj.key
    // 原始坐标，以底部左侧边框为原点
    const rawX = obj.pos * width + obj.offset * (width / MapItem.OFFSET_TO_NEXT) + (width * 0.5)
    // 转换为坐标系内的有效坐标，以判定线中点为原点
    const x = NoteUtils.raw2EffX(rawX)
    
    obj.width = width
    obj.x = x
  }
  
  // 获取独特的设置，如高度，资源纹理等，见config.game中的noteUnique字段
  _initUnique () {
    const noteUnique = NoteUtils.getNoteUnique(this.type)
    const noteSrc = noteUnique.src
    this.style = utils.obj.isValidNum(this.style) && this.style >= 0 && this.style < noteSrc.length ? Math.floor(options.style) : 0
    this.textureName = noteSrc[this.style]
    
    const sheet = NoteUtils.getSheet()
    this.texture = sheet.textures[this.textureName]
    
    if (noteUnique.hasOwnProperty('height')) {
      // 对Tap、Swipe、Slide来说非常重要的高度
      this.height = noteUnique.height
    }
  }
  
  // 解析变速
  _resolveSpeedChange () {
    
  }
}