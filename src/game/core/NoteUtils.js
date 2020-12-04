import { Point } from 'pixi.js'

import utils from '@/libs/utils/index.js'
import Game from '@/libs/Game.js'

// 核心逻辑辅助工具类
export default class NoteUtils {
  constructor () {}
  
  // 对下落容器进行仿射变换的倍率，这样顶部宽度正好是底部宽度的1 / 5
  // 仿射变换的原理没有搞清楚，现在是摸索API试出来的效果，以后一定要好好学计算机图形学
  static AFFINE_FACTOR = 5
  
  // 速度在1速的基础上每增加1，用时减少的比例，最高8速用时比例为 7 / 28，正好是 1 / 4，相当于节奏大师4速
  static SPEED_TIME_FACTOR = 3 / 28
  
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
      const containerWidth = gameConfig.containerWidth
      const containerHeight = gameConfig.containerHeight
      const judgeHeight = gameConfig.judgeHeight
      // 容器的高度在判定线以上
      const tureHeight = containerHeight - judgeHeight
      const trueWidth = containerWidth * (tureHeight / containerHeight)
      // 有效宽度要排除边框
      const effWidth = trueWidth - 2 * gameConfig.containerBorderWidth
      const effHeight = NoteUtils.AFFINE_FACTOR * tureHeight
      // 计算仿射变换参照点
      const ratio = NoteUtils.AFFINE_FACTOR > 1 ?
        NoteUtils.AFFINE_FACTOR / (NoteUtils.AFFINE_FACTOR - 1) : 2
      const affinePoint = new Point(0, tureHeight * ratio)
      
      NoteUtils.validSize = {
        containerWidth, containerHeight, judgeHeight,
        tureHeight, trueWidth,
        effWidth, effHeight,
        affinePoint
      }
    }
    return NoteUtils.validSize
  }
  
  // 获取标准运动参数
  static getMoveData () {
    if (!NoteUtils.moveData) {
      // 获取尺寸信息
      const size = NoteUtils.getValidSize()
      // 速度设定
      const keySpeed = gameConfig.keySpeed
      // 由速度设定决定的真实下落时间
      const tKeyMove = gameConfig.keyMoveTime * (1 - (keySpeed - 1) * NoteUtils.SPEED_TIME_FACTOR)
      // 标准下落速度
      const vStandard = size.effHeight / keyMoveTime
      
      NoteUtils.moveData = {
        keySpeed, tKeyMove, vStandard
      }
    }
    return NoteUtils.moveData
  }
  
  // 获取资源图集的引用
  static getSheet () {
    if (!NoteUtils.sheet) {
      const gameConfig = Game.config.game
      NoteUtils.sheet = Game.loader.resources[gameConfig.resources].spritesheet
    }
    return NoteUtils.sheet
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
    if (!setting) {
      return null
    }
    NoteUtils.noteUnique[type] = setting
    return NoteUtils.noteUnique[type]
  }
  
  // 获取标准时间参数
  
  /*
    将原始X坐标转换为有效X坐标
    原始X坐标 - X轴以有效落键区域的最左侧为原点，向右为正方向
    有效X坐标 - 以container的锚点anchor为原点，即判定线的中心点为原点，正方向向右
  */
  static raw2EffX (rawX) {
    const { effWidth } = NoteUtils.getValidSize()
    return rawX - effWidth / 2
  }
  
  /*
    将原始Y坐标转换为有效Y坐标
    原始Y坐标 - 以顶部为原点，正方向向下
    有效Y坐标 - 以container的锚点anchor为原点，即判定线的中心点为原点，正方向向下
  */
  static raw2EffY (rawY) {
    const { tureHeight } = NoteUtils.getValidSize()
    return rawY - tureHeight
  }
}