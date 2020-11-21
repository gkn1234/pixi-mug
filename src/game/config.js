// 游戏设置
export default {
  // 游戏渲染区域 Canvas的宽高
  width: 667,
  height: 375,
  // 游戏整体区域宽高
  gameWidth: 667,
  gameHeight: 375,
  // 游戏区域最大宽高，fixedWidth/fixedHeight时有效
  gameMaxWidth: 1920,
  gameMaxHeight: 1080,
  // 游戏整体区域背景
  gameBackground: '#000000',
  // 移动端屏幕适配模式 fixedWidth/fixedHeight/fullFixed/fullFixedLand/fullFixedPor
  fixedMode: 'fullFixedLand',
  // 屏幕方向 landscape/portrait/auto，暂时不支持
  screenOrientation: 'landscape',
  // PC端屏幕适配模式
  pcFixedMode: 'fixedWidth',
  // 页面区域
  // 除了宽高以外的其他配置
  startOptions: {
    // backgroundColor: 0x007aff
  },
  // 起始场景，不存在或为空时，起始打开scenes.js里的第一个场景对象
  startScene: '',
  
  // 游戏设置
  game: {
    // 判定线距离底部的距离 
    judgeLineToBottom: 60,
    // 判定区域的宽度
    judgeWidth: 60,
    // 判定区间，小P,Good,Bad,Miss，小于第一个数字的是大P，注意这个值其实是+-x，判定区间大小为此值的两倍
    judgeTime: [15, 30, 60, 100],
    // 判定得分比例，小P,Good,Bad,Miss，大P为100%
    judgeScorePercent: [90, 60, 30, 0],
    // 底部音符区，最大宽度
    bottomMaxWidth: 667,
    // 键位Y轴的运动距离(运动到底部)
    keyDistanceY: 375,
    // 顶部和底部的比例
    topScaleRatio: 0.15,
    // 键位的初速度(1速)，几速乘以几
    keyMoveSpeedInitial: 0,
    // 键位从顶部到判定线用时(1速)，几速除以几
    keyMoveTime: 2500,
    // 落键速度(可以设置1/2/3/4速)
    keySpeed: 4,
    // 歌曲播放前的空白时间，单位ms，即使不设置，也会强制空出3秒
    timeBeforeStart: 3000,
    // 按键延迟时间，正数代表按键延后(音乐提前)，负数代表按键提前(音乐延后)
    keyStartDelay: 0,
    
    // 按键详细设置
    keySetting: {
      // 单点按键
      Tap: {
        // 高度设置(以到达屏幕底部的宽度为准)
        height: 15,
        // 纹理资源
        res: ['/img/tap.png']
      }
    }
  },
  
  // 资源设置
  resources: [
    
  ]
}