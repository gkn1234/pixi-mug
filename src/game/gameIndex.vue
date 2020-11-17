<template>
  <div>
    <canvas id="gameCanvas"></canvas>
  </div>
</template>

<script>

import game from './main.js'

export default {
  name: 'gameIndex',
  components: {

  },
  setup () {
    
  },
  mounted () {
    this.gameCanvas = this.$el.querySelector('#gameCanvas')
    game(this.gameCanvas, this)
  },
}

</script>

<style>
</style>
