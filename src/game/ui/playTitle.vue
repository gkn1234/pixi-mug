<template>
  <div class="play-title" :style="style" v-show="isShow">
    <div class="play-title-top">
      <span>歌曲标题</span>
      <div class="play-title-flex">
        <div class="play-title-icon play-title-flex" @click="pauseHandler">
          <img src="/icon/icon-pause.png" />
          <span>暂停</span>
        </div>
        <div class="play-title-icon play-title-flex" @click="fullHandler">
          <img src="/icon/icon-fill-screen.png" />
          <span>全屏</span>
        </div>
        <span>1000000</span>
      </div>
    </div>
    <div></div>
  </div>
</template>

<script>

import { reactive, ref, getCurrentInstance } from 'vue'

export default {
  name: 'playTitle',
  setup () {
    const { ctx } = getCurrentInstance()
    
    const isShow = ref(false)
    const show = () => {
      isShow.value = true
    }
    const hide = () => {
      isShow.value = false
    }
    
    // 样式
    const style = reactive({
      top: 0,
      left: 0,
      right: 0,
      height: '60px'
    })
    
    // 绑定事件函数
    const setEvent = (key, callback) => {
      ctx[key] = callback
    }
    // 暂停触发
    const pauseHandler = () => {
      if (typeof ctx.onPause === 'function') {
        ctx.onPause()
      }
    }
    // 全屏触发
    const fullHandler = () => {
      if (typeof ctx.onFullScreen === 'function') {
        ctx.onFullScreen()
      }
    }
    
    return {
      isShow, show, hide,
      style,
      setEvent, pauseHandler, fullHandler
    }
  }
}
  
</script>

<style lang="stylus">
  
.play-title
  position absolute
  user-select none

.play-title-top
  height 30px
  line-height 30px
  display flex
  justify-content space-between 
  align-items center
  padding 0 10px
  color #ffffff
  border-bottom 1px solid #ffffff

.play-title-flex
  display flex
  align-items center

.play-title-icon
  margin-right 10px
  
  img
    width 20px
    height 20px
    margin-right 3px

</style>
