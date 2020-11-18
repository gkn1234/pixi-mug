<template>
  <div class="game-wrapper" @resize="fixedScreen">
    <div class="game-wrapper-content" :style="style">
      <slot></slot>
    </div>
  </div>
</template>

<script>

import { reactive, computed } from 'vue'

import utils from '../utils/index.js'

export default {
  name: 'gameWrapper',
  props: {
    // 设置，传入config即可
    options: {
      type: Object,
      default () {
        return {}
      }
    },
    // 整体宽度
    width: {
      type: [String, Number],
      default: ''
    },
    // 游戏整体高度
    height: {
      type: [String, Number],
      default: ''
    },
    // 背景颜色
    background: {
      type: String,
      default: 'rgba(255, 0, 0, 1)'
    },
    // 适配模式
    fixedMode: {
      type: String,
      default: ''
    },
    // 屏幕方向
    mobileScreenMode: {
      type: String,
      default: 'auto'
    }
  },
  methods: {
    // 屏幕适配方法
    fixScreen () {
      if (!utils.obj.isObject(this.options) || !this.isSizeNumber(this.options.gameWidth) || !this.isSizeNumber(this.options.gameHeight)) {
        // 设定的宽高不为像素数字，无法适配
        return
      }
      
      const fixedMode = utils.common.isMobileUser() ? this.options.fixedMode : this.options.pcFixedMode
      switch (fixedMode) {
        case 'fixedWidth':
          // 适配模式2：宽度顶满 fixWidth
          this.fixedWidth()
          break
        case 'fixedHeight':
          // 适配模式3：高度顶满 fixedHeight
          this.fixedHeight()
          break
        case 'fullFixed':
          // 适配模式3：宽度高度均优先顶满
          this.fullFixed()
          break
        case 'fullFixedLand':
          // 适配模式4：只有横屏时顶满，竖屏时用fixedWidth
          if (utils.common.isMobileLandscape()) {
            this.fullFixed()
          }
          else {
            this.fixedWidth()
          }
          break
        case 'fullFixedPor':
          // 适配模式5：只有纵屏时顶满，横屏时用fixedHeight
          if (utils.common.isMobileLandscape()) {
            this.fullFixed()
          }
          else {
            this.fixedHeight()
          }
          break
        default:
          this.style.transform = 'translate(-50%, -50%)'
          // 适配模式1：默认水平垂直居中 default
      }
    },
    // 宽度顶满 fixedWidth
    fixedWidth () {
      // 移动端翻转屏幕是获取的window.innerWidth值不准确
      // console.log(this.$el.offsetWidth, this.$el.offsetHeight)
      const desWidth = this.isSizeNumber(this.options.gameMaxWidth) && this.options.gameMaxWidth < this.$el.offsetWidth ? this.options.gameMaxWidth : this.$el.offsetWidth

      const ratio = desWidth / parseInt(this.options.gameWidth)
      this.style.transform = `translate(-50%, -50%) scale(${ratio})`
    },
    // 高度顶满 fixedHeight
    fixedHeight () {
      const desHeight = this.isSizeNumber(this.options.gameMaxHeight) && this.options.gameMaxHeight < this.$el.offsetHeight ? this.options.gameMaxHeight : this.$el.offsetHeight
      const ratio = desHeight / parseInt(this.options.gameHeight)
      this.style.transform = `translate(-50%, -50%) scale(${ratio})`
    },
    // 宽度高度均优先顶满
    fullFixed () {
      const xRatio = this.$el.offsetWidth / parseInt(this.options.gameWidth)
      const yRatio = this.$el.offsetHeight / parseInt(this.options.gameHeight)
      this.style.transform = `translate(-50%, -50%) scale(${xRatio}, ${yRatio})`
    }
  },
  setup (props, context) {
    const initStyle = () => {
      let style = reactive({
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      })
      
      if (!utils.obj.isObject(props.options)) {
        return style
      }
      style.width = isSizeNumber(props.options.gameWidth) ? props.options.gameWidth + 'px' : props.options.gameWidth
      style.height = isSizeNumber(props.options.gameHeight) ? props.options.gameHeight + 'px' : props.options.gameHeight
      style.backgroundColor = props.options.gameBackground
      return style
    }
    // 检查宽高变量是否为像素数字
    const isSizeNumber = (val) => {
      return utils.obj.isNumString(val) || utils.obj.isValidNum(val)
    }
    
    // 初始化游戏容器样式
    const style = initStyle()
    
    return { 
      style,
      isSizeNumber
    }
  },
  mounted () {
    // 执行屏幕适配
    this.fixScreen()
    window.addEventListener('resize', utils.common.debounce(this.fixScreen, 200))
  },
}

</script>

<style lang="stylus">

.game-wrapper
  position relative
  height 100%
  background-color #000000

</style>
