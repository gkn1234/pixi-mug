<template>
  <div class="game-mask" v-show="isShow" :style="style">
    <div class="game-mask-full" v-show="state === 'start'" @click="startHandler">
      <div class="game-mask-center">点击屏幕开始</div>
    </div>
    <div class="game-mask-center" v-show="state === 'pause'">
      <button @click="resumeHandler">继续游戏</button>
      <button @click="restartHandler">重新开始</button>
    </div>
    <div class="game-mask-center" v-show="state === 'resume'">
      <div>{{ resumeLeftTime }}</div>
    </div>
  </div>
</template>

<script>

import { reactive, ref, getCurrentInstance } from 'vue'

export default {
  name: 'gameMask',
  setup () {
    const { ctx } = getCurrentInstance()
    
    // 解除暂停需要等待的时间
    const RESUME_TIME = 3
    
    // 显示状态
    let isShow = ref(false)
    let state = ref('start')
    let resumeLeftTime = ref(RESUME_TIME)
    const show = () => {
      isShow.value = true
      state.value = 'start'
    }
    const pauseShow = () => {
      isShow.value = true
      state.value = 'pause'
    }
    const resumeShow = () => {
      return new Promise((resolve, reject) => {
        isShow.value = true
        state.value = 'resume'
        resumeLeftTime.value = RESUME_TIME
        let timer = setInterval(() => {
          resumeLeftTime.value--
          if (resumeLeftTime.value === 0) {
            hide()
            clearInterval(timer)
            resolve()            
          }
        }, 1000)
      })
    }
    const hide = () => {
      isShow.value = false
    }
    
    // 样式
    const style = reactive({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    })
    
    // 开始回调
    const startHandler = () => {
      if (typeof ctx.onStart === 'function') {
        ctx.onStart()
      }
    }
    // 继续游戏回调
    const resumeHandler = () => {
      if (typeof ctx.onResume === 'function') {
        ctx.onResume()
      }
    }
    // 重开游戏回调
    const restartHandler = () => {
      if (typeof ctx.onRestart === 'function') {
        ctx.onRestart()
      }
    }
    // 绑定点击回调
    const setEvent = (key, callback) => {
      // 指定单击屏幕后的回调函数
      ctx[key] = callback
    }
    
    
    return {
      isShow, state, resumeLeftTime,
      show, pauseShow, resumeShow, hide,
      style,
      setEvent, startHandler, resumeHandler, restartHandler
    }
  }
}

</script>

<style lang="stylus">
  
.game-mask
  position absolute
  color #ffffff
  user-select none
  background-color rgba(0, 0, 0, 0.4)

.game-mask-center
  position absolute
  top 50%
  left 50%
  transform translate(-50%, -50%)

.game-mask-full
  width 100%
  height 100%
  position relative

</style>
