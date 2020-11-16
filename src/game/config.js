// 游戏设置
export default {
  // 游戏渲染区域 Canvas的宽高
  width: 667,
  height: 375,
  // 页面区域
  // 除了宽高以外的其他配置
  startOptions: {
    
  },
  // 起始场景，不存在或为空时，起始打开scenes.js里的第一个场景对象
  startScene: '',
  
  // 游戏设置
  game: {
    // 判定线距离底部的距离 
    judgeLineToBottom: 60,
    // 底部音符区域最大宽度
    bottomMaxWidth: 600,
    // 键位Y轴的运动距离
    keyDistanceY: 375,
    // 顶部和底部的比例
    topScaleRatio: 0.15,
    // 键位的初速度(1速)，几速乘以几
    keyMoveSpeedInitial: 0,
    // 键位从顶部到判定线用时(1速)，几速除以几
    keyMoveTime: 2500,
    // 落键速度(可以设置1/2/3/4速)
    keySpeed: 4,
    // 按键宽度取决于轨道
    // 按键高度设置(以按键到达屏幕底部的大小为准)
    keyHeight: {
      tapKey: 15
    }
  },
  
  // 资源设置
  resources: {
    // tap按键资源
    tapKey: '/img/tap.png'
  }
}