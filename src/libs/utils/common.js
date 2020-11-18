const commonUtils = {
  // 判断移动端还是PC断
  isMobileUser () {
    return navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
  },
  
  // 判断移动端横竖屏
  isMobileLandscape () {
    return window.orientation === 90 || window.orientation === -90
  },
  isMobilePortrait () {
    return window.orientation === 180 || window.orientation === 0
  },
  
  // 进入全屏
  enterFullScreen (el = document.body) {
    const requestFullscreen =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen
    if (requestFullscreen) {
      requestFullscreen.call(el)
      return el
    }
    return false
  },
  
  // 获取当前全屏元素
  getFullSceenEle () {
    return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || document.mozFullScreenElement || null
  },
  
  // 退出全屏
  exitFullScreen () {
    const exitFullScreen = 
      document.exitFullscreen ||
      document.mozCancelFullScreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen
    if (exitFullScreen) {
      exitFullScreen.call(document)
      return true
    }
    return false
  },
  
  /*
    *********************************
    @section 防抖和节流
    *********************************
  */
  // 节流函数，使得handler函数每次执行都必须有一个间隔wait
  throttle (handler, wait) {
    var lastTime = 0
    
    return function () {
      var nowTime = new Date().getTime()
      
      if (nowTime - lastTime > wait) {
        handler.apply(this, arguments)
        lastTime = nowTime
      }
    }
  },
  
  // 防抖函数，使得handler函数将被延迟执行，无论触发的速度有多快，适用于输入
  debounce (handler, delay) {
    var timer;
   
    return function () {
      var arg = arguments
  
      clearTimeout(timer)
  
      timer = setTimeout(() => {
        handler.apply(this, arg)
      }, delay)
    }
  },
}

export default commonUtils