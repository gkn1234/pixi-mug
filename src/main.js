import { createApp } from 'vue'
import App from './App.vue'

import VConsole from 'vconsole'

// 引入pixi-projection插件
import * as PIXI from "pixi.js";
global.PIXI = PIXI;
require("pixi-projection");


// new VConsole()

createApp(App).mount('#app')
