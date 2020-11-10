import game from './game.js'

export default {
  name: 'gameIndex',
  components: {
    
  },
  data () {
    return {
      
    }
  },
  mounted () {
    this.gameCanvas = this.$el.querySelector('#gameCanvas')
    game.start(this.gameCanvas)
  },
}