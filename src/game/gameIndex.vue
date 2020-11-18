<template>
  <game-wrapper :options="options">
    <canvas id="gameCanvas"></canvas>
    <play-title ref="playTitle"></play-title>
    <start-mask ref="startMask"></start-mask>
  </game-wrapper>
</template>

<script>
  
import { reactive, computed } from 'vue'

import gameWrapper from '@/libs/ui/gameWrapper.vue'

import playTitle from './ui/playTitle.vue'
import startMask from './ui/startMask.vue'

import config from './config.js'
import gameStart from './main.js'

export default {
  name: 'gameIndex',
  components: {
    gameWrapper,
    playTitle,
    startMask
  },
  setup () {
    const options = reactive({
      ...config
    })
    
    return {
      options
    }
  },
  mounted () {
    // 获取Canvas对象
    this.gameCanvas = this.$el.querySelector('#gameCanvas')
    // 启动游戏
    gameStart(this.gameCanvas, this)
  },
}  

</script>

<style>
</style>
