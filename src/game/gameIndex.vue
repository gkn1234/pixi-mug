<template>
  <game-wrapper :options="options">
    <canvas id="gameCanvas"></canvas>
    <game-mask ref="gameMask"></game-mask>
    <play-title ref="playTitle"></play-title>
    <judge-show ref="judgeShow"></judge-show>
  </game-wrapper>
</template>

<script>
  
import { reactive, computed } from 'vue'

import gameWrapper from '@/libs/ui/gameWrapper.vue'

import playTitle from './ui/playTitle.vue'
import gameMask from './ui/gameMask.vue'
import judgeShow from './ui/judgeShow.vue'

import config from './config.js'
import gameStart from './main.js'

export default {
  name: 'gameIndex',
  components: {
    gameWrapper,
    playTitle,
    gameMask,
    judgeShow
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
