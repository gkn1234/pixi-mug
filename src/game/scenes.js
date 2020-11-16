import LoadingScene from './scene/LoadingScene.js'
import GameScene from './scene/GameScene.js'

const scenes = [
  // 第一个场景就是起始场景
  {
    name: 'LoadingScene',
    component: LoadingScene
  },
  {
    name: 'GameScene',
    component: GameScene
  }
]

export default scenes