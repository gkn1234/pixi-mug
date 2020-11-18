<template>
  <game-index></game-index>
</template>

<script>
  
import gameIndex from '@/game/gameIndex.vue'

export default {
  name: 'App',
  components: {
    gameIndex
  }
}

</script>

<style>

html, body, #app {
  height: 100%;
  margin: 0
}

</style>
