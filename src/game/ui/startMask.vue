<template>
  <div class="start-mask" v-show="isShow" :style="style" @click="clickHandler">
    <div class="start-mask-content">
      <div>点击屏幕开始</div>
    </div>
  </div>
</template>

<script>

import { reactive, ref, getCurrentInstance } from 'vue'

export default {
  name: 'startMask',
  setup () {
    const { ctx } = getCurrentInstance()
    
    const isShow = ref(false)
    const show = (callback) => {
      isShow.value = true
      // 指定单击屏幕后的回调函数
      ctx.onClick = callback
    }
    const hide = () => {
      isShow.value = false
      ctx.onClick = null
    }
    
    // 样式
    const style = reactive({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    })
    
    // 点击回调
    const clickHandler = () => {
      if (typeof ctx.onClick === 'function') {
        ctx.onClick()
      }
    }
    
    return {
      isShow, show, hide,
      style,
      clickHandler
    }
  }
}

</script>

<style lang="stylus">
  
.start-mask
  position absolute
  color #ffffff
  background-color rgba(0, 0, 0, 0.4)

.start-mask-content
  position absolute
  top 50%
  left 50%
  transform translate(-50%, -50%)

</style>
