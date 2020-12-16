import { Point } from 'pixi.js'

import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'

// 核心逻辑辅助工具类
export default class NoteUtils {
  constructor () {}
  
  // 合法的按键类型
  static NOTE_TYPES = ['Tap', 'Slide', 'Hold', 'Swipe']
  // 按键offset偏移到下一轨时的参数
  static OFFSET_TO_NEXT = 4
  // 最大与小轨道数
  static MIN_KEY_NUM = 2
  static MAX_KEY_NUM = 8
  static DEFAULT_KEY_NUM = 4
  // 对下落容器进行仿射变换的倍率，这样顶部宽度正好是底部宽度的1 / 5
  // 仿射变换的原理没有搞清楚，现在是摸索API试出来的效果，以后一定要好好学计算机图形学
  static AFFINE_FACTOR = 5
  
  // 速度在1速的基础上每增加1，用时减少的比例，最高8速用时比例为 7 / 28，正好是 1 / 4，相当于节奏大师4速
  static SPEED_TIME_FACTOR = 3 / 28
  
  static configWarn () {
    
  }
  
  /* 
    获取落键容器的尺寸信息(宽高)
    容器宽度 containerWidth 取config中的设定值
    容器高度 containerHeight 取config中的设定值
    判定线高度 judgeHeight 取config中的设定值
    真实宽度 trueWidth - 真实的容器的宽度，不是底部宽度，而是判定线处的宽度(仿射变换后)
    真实高度 trueHeight - 真实的容器高度，减掉判定线高度后的值(仿射变换后)
    有效宽度 effWidth - 在X方向上，排除边框，允许落键的范围
    有效高度 effHeight - 在Y方向上，按键下落到判定线处所走过的真实路程(仿射变换前)
  */
  static getValidSize () {
    if (!NoteUtils.validSize) {
      const gameConfig = Game.config.game
      
      const check = utils.obj.checkAll([
        gameConfig.containerWidth,
        gameConfig.containerHeight,
        gameConfig.judgeHeight,
        gameConfig.judgeAreaSize,
        gameConfig.containerBorderWidth
      ], (obj) => {
        return utils.obj.isValidNum(obj) && obj >= 0
      })
      if (!check) {
        throw new Error('Invalid size config!!')
      }
      
      const containerWidth = gameConfig.containerWidth
      const containerHeight = gameConfig.containerHeight
      const judgeHeight = gameConfig.judgeHeight
      const judgeAreaSize = gameConfig.judgeAreaSize
      // 容器的高度在判定线以上
      const trueHeight = containerHeight - judgeHeight
      const trueWidth = containerWidth * (trueHeight / containerHeight)
      // 有效宽度要排除边框
      const effWidth = trueWidth - 2 * gameConfig.containerBorderWidth
      const effHeight = NoteUtils.AFFINE_FACTOR * trueHeight
      // 计算仿射变换参照点
      const ratio = NoteUtils.AFFINE_FACTOR > 1 ?
        NoteUtils.AFFINE_FACTOR / (NoteUtils.AFFINE_FACTOR - 1) : 2
      const affinePoint = new Point(0, trueHeight * ratio)
      
      NoteUtils.validSize = {
        containerWidth, containerHeight,
        judgeHeight, judgeAreaSize,
        trueHeight, trueWidth,
        effWidth, effHeight,
        affinePoint
      }
    }
    return NoteUtils.validSize
  }
  
  // 获取标准运动参数
  static getMoveData () {
    if (!NoteUtils.moveData) {
      const gameConfig = Game.config.game
      // 获取尺寸信息
      const size = NoteUtils.getValidSize()
      
      const check = utils.obj.checkAll([
        gameConfig.noteSpeed,
        gameConfig.noteMoveTime,
      ], (obj) => {
        return utils.obj.isValidNum(obj) && obj >= 0
      })
      if (!check) {
        throw new Error('Invalid move config!!')
      }
      
      // 速度设定
      const noteSpeed = gameConfig.noteSpeed
      // 由速度设定决定的真实下落时间
      const tNoteMove = gameConfig.noteMoveTime * (1 - (noteSpeed - 1) * NoteUtils.SPEED_TIME_FACTOR)
      // 标准下落速度
      const vStandard = size.effHeight / tNoteMove
      
      NoteUtils.moveData = {
        noteSpeed, tNoteMove, vStandard
      }
    }
    return NoteUtils.moveData
  }
  
  // 获取时间延迟参数
  static getDelayData () {
    if (!NoteUtils.delayData) {
      const gameConfig = Game.config.game
      
      const timeBeforeStart = utils.obj.isValidNum(gameConfig.timeBeforeStart) && gameConfig.timeBeforeStart >= 0 ?
        gameConfig.timeBeforeStart : 3000
      const startDelay = utils.obj.isValidNum(gameConfig.startDelay) ? gameConfig.startDelay : 0
      
      NoteUtils.delayData = {
        timeBeforeStart, startDelay
      }
    }
    return NoteUtils.delayData
  }
  
  // 获取按键独特配置
  static getNoteUnique (type) {
    if (!NoteUtils.noteUnique) {
      NoteUtils.noteUnique = {}
    }
    if (NoteUtils.noteUnique[type]) {
      return NoteUtils.noteUnique[type]
    }
    
    const gameConfig = Game.config.game
    const setting = gameConfig.noteUnique[type]
    if (!utils.obj.isObjectType(setting)) {
      throw new Error('Every note unique config must be an object!')
    }
    NoteUtils.noteUnique[type] = setting
    return NoteUtils.noteUnique[type]
  }
  
  // 获取标准时间参数
  
  /*
    将原始X坐标转换为有效X坐标
    原始X坐标 - X轴以游戏区域最左侧为原点，向右为正方向
    有效X坐标 - 以container的锚点anchor为原点，即判定线的中心点为原点，正方向向右
  */
  static raw2EffX (rawX) {
    const { containerWidth } = NoteUtils.getValidSize()
    return rawX - containerWidth / 2
  }
  static eff2RawX (effX) {
    const { containerWidth } = NoteUtils.getValidSize()
    return effX + containerWidth / 2
  }
  
  /*
    将原始Y坐标转换为有效Y坐标
    原始Y坐标 - 以游戏区域顶部为原点，正方向向下
    有效Y坐标 - 以container的锚点anchor为原点，即判定线的中心点为原点，正方向向下
  */
  static raw2EffY (rawY) {
    const { effHeight } = NoteUtils.getValidSize()
    return rawY - effHeight
  }
  static eff2RawY (effY) {
    const { effHeight } = NoteUtils.getValidSize()
    return effY + effHeight
  }
  
  /*
    根据top/bottom/left/right，解析定位坐标
  */
  static resolvePos (obj) {
    const { containerWidth, containerHeight } = NoteUtils.getValidSize()
    const POS_KEYS = ['top', 'bottom', 'left', 'right', 'centerX', 'centerY']
    let res = {
      x: 0,
      y: 0
    }
    
    for (let key in obj) {
      const index = POS_KEYS.indexOf(key)
      if (index < 0) {
        continue
      }
      if (!utils.obj.isValidNum(obj[key])) {
        continue
      }
      
      switch (key) {
        case 'top':
          res.y = obj.top
          break
        case 'bottom':
          res.y = containerHeight - obj.bottom
          break
        case 'left':
          res.x = obj.left
          break
        case 'right':
          res.x = containerWidth - obj.right
          break
        case 'centerX':
          res.x = containerWidth / 2 + obj.centerX
          break
        case 'centerY':
          res.y = containerHeight / 2 + obj.centerY
          break
        default:
      }
    }
    
    return res
  }
  
  // 获取X分音符的时间长度
  getNoteDuration (divide = 8) {
    // BPM的意义是一分钟4分音符的数量，先计算出4分音符的长度
    const baseDuration = 60 * 1000 / this.bpm
    const ratio = 4 / divide
    return baseDuration * ratio
  }
}