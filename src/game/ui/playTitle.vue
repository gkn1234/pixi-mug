<template>
  <div class="play-title" :style="style" v-show="isShow">
    <div class="play-title-top">
      <span>歌曲标题</span>
      <div>1000000</div>
    </div>
    <div></div>
  </div>
</template>

<script>

import { reactive, ref } from 'vue'

export default {
  name: 'playTitle',
  setup () {
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
    
    
    return {
      isShow, show, hide,
      style
    }
  }
}
  
</script>

<style lang="stylus">
  
.play-title
  position absolute

.play-title-top
  height 30px
  line-height 30px
  display flex
  justify-content space-between 
  align-items center
  padding 0 10px
  color #ffffff
  border-bottom 1px solid #ffffff

</style>
