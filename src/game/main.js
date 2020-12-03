import Game from '@/libs/Game.js'

import config from './config.js'
import scenes from './scenes.js'

/*
  gameCanvas canvas对象
  context 启动时的Vue上下文
*/
export default function (gameCanvas, context) {
  Game.useView(gameCanvas)
    .useConfig(config)
    .useScenes(scenes)
    .use('ui', context)
    .start()
}