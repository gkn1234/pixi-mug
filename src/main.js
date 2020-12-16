import { createApp, reactive } from 'vue'
import App from './App.vue'

import VConsole from 'vconsole'

// 引入pixi-projection插件
import * as PIXI from 'pixi.js'
global.PIXI = PIXI
require('pixi-projection')


// new VConsole()

createApp(App).mount('#app')

class A {
  constructor (a) {
    this.a = a
    return new Proxy(this, {
      get (target, key) {
        console.log('get', key)
        return target[key]
      },
      set (target, key, val) {
        console.log('set', key, val)
        if (key === 'c') {
          throw new Error('a')
        }
        target[key] = val
        return true
      }
    })
  }
  
  do () {
    this.a = 1
    console.log(this.a)
  }
}

function act (obj) {
  obj.a = 5
  obj.c = 7
  obj.d = 8
}

let b = new Proxy(new A(), {
  get (target, key) {
    console.log('get', key)
    return target[key]
  },
  set (target, key, val) {
    console.log('set', key, val)
    target[key] = val
    return true
  }
})