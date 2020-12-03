<template>
  <div class="judge-show" v-show="isShow">
    <div class="judge-show-on" v-show="state >= 0 && combo > 0">
      <div ref="judgeTxt">
        <div class="judge-show-text">
          <div v-if="state === 0">Perfect0</div>
          <div v-else-if="state === 1">Perfect1</div>
          <div v-else-if="state === 2">Good</div>
          <div v-else>Bad</div>        
        </div>
        <div class="judge-show-combo">{{ combo }}</div>
      </div>
      <div class="judge-show-accurate">{{ accurate }}</div>
    </div>
    <div class="judge-show-miss" v-show="state < 0">Miss</div>
  </div>
</template>

<script>

import { reactive, ref, computed, getCurrentInstance } from 'vue'

export default {
  name: 'judgeShow',
  setup () {
    const { ctx } = getCurrentInstance()
    
    let isShow = ref(false)
    const show = () => {
      isShow.value = true
    }
    const hide = () => {
      isShow.value = false
    }
    
    let state = ref(0)
    let combo = ref(0)
    let accurate = ref('')
    const judge = (sta, com, acc) => {
      state.value = sta
      combo.value = com
      accurate.value = acc >= 0 ? '+' + acc : acc
    }
    
    return {
      isShow, show, hide,
      state, combo, accurate, judge
    }
  }
}  

</script>

<style lang="stylus">
  
.judge-show
  position absolute
  right 0
  top 50%
  transform translate(0, -50%)
  color #ffffff
  width 70px
  text-align center
  user-select none

</style>
