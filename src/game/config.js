// 游戏设置
export default {
  // 游戏渲染区域 Canvas的宽高
  width: 1920,
  height: 1080,
  // 游戏整体区域宽高
  gameWidth: 1920,
  gameHeight: 1080,
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
    // 抗锯齿
    antialias: true,
    resolution: 1,
  },
  // 起始场景，不存在或为空时，起始打开scenes.js里的第一个场景对象
  startScene: '',
  
  // 游戏设置
  game: {
    // 音乐
    bgm: '/bgm/a.mp3',
    // 背景图片
    bgImage: '',
    
    // 资源图集
    resources: '/assets.json',
    // 音符面板的资源
    containerSrc: 'board.png',
    // 判定线的资源名称
    judgeSrc: 'judge.png',
    // 各种note的独特设置
    noteUnique: {
      Tap: {
        height: 60,
        src: ['tap_0.png', 'tap_1.png', 'tap_2.png']
      },
      Slide: {
        height: 45,
        src: ['slide_0.png', 'slide_1.png', 'slide_2.png']
      },
      Hold: {
        src: ['hold_0.png', 'hold_1.png', 'hold_2.png'],
        splitSrc: ['hold_split_0.png', 'hold_split_1.png', 'hold_split_2.png'],
        height: 20
      },
      Swipe: {
        src: ['tap_0.png', 'tap_1.png', 'tap_2.png'],
        arrowSrc: ['arrow_0.png', 'arrow_1.png', 'arrow_2.png'],
        height: 80,
        arrowHeight: 120
      }
    },
    
    // 音符面板的宽，面板居中
    containerWidth: 1920,
    // 音符面板的高，从顶部起算
    containerHeight: 1080,
    // 音符面板的边框宽度，限制落键范围
    containerBorderWidth: 80,
    
    // 判定线 距离 音符面板 底部的距离
    judgeHeight: 144,
    // 有效判定区域的宽度
    judgeAreaSize: 288,
    
    // 运动参数
    // 键位从顶部到判定线用时(1速)，速度每加1，用时减去 3/28
    noteMoveTime: 2500,
    // 落键速度(可以设置1/2/3/4/5/6/7/8速)
    noteSpeed: 1,
    
    // 延迟参数
    // 歌曲播放前的空白时间，单位ms，即使不设置，也会强制空出3秒
    timeBeforeStart: 3000,
    // 按键延迟时间，正数代表按键延后(音乐提前)，负数代表按键提前(音乐延后)。该参数只影响音乐播放时间，不应该影响按键逻辑！！！
    startDelay: 0,
    
    // 判定区间，小P,Good,Bad,Miss，小于第一个数字的是大P，注意这个值其实是+-x，判定区间大小为此值的两倍。不按照此规范赋值，程序将会发生不可预测的错误
    judgeTime: [35, 70, 120, 150],
    // 判定得分比例，小P,Good,Bad,Miss，大P为100%。不按照此规范赋值，程序将会发生不可预测的错误
    judgeScorePercent: [90, 60, 30, 0],
    // 判定特效动画名称，大P，小P，Good，Bad。不按照此规范赋值，程序将会发生不可预测的错误
    judgeAnimationSrc: ['perfect', 'perfect', 'good', 'bad'],
    // 判定文字动画，大P，小P，Good，Bad。不按照此规范赋值，程序将会发生不可预测的错误
    judgeTxtSrc: ['perfect0_txt.png', 'perfect1_txt.png', 'good_txt.png', 'bad_txt.png', 'miss_txt.png'],
    // 判定文字的大小、位置
    judgeTxtPos: {
      // 高度
      height: 60,
      // 中心相对于面板中点的偏移量
      centerX: 0,
      // 中心相对于顶部的偏移量
      top: 800
    },
    // 连击文字的大小、位置
    comboTxtPos: {
      // 尺寸
      titleHeight: 50, 
      numHeight: 100,
      // 位置
      right: 150,
      top: 600
    },
    // 分数结算的大小、位置
    scorePos: {
      height: 60,
      // x与y相对的原点为左上角
      x: 10,
      y: 10
    }
  },
}