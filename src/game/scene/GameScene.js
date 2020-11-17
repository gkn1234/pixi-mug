import Scene from '@/libs/Scene.js'

import Game from '@/libs/Game.js'

import { Text, Graphics, Sprite, Texture } from 'pixi.js'

export default class GameScene extends Scene {
  constructor () {
    super()
  }
  
  onCreate () {
    // this.initUI()
    
    // 谱面按键列表
    this.noteList = [
      { time: '1000',  }
    ]
    
    
  }
  
  onShow () {
    /*console.log(1)
    const s = new Sprite(Game.loader.resources['/img/tap.png'].texture)
    this.addChild(s)
    s.vertexData[4] = 200
    console.log(s, s.getLocalBounds())*/
    const starTexture = Texture.from('/img/tap.png');
    
    const starAmount = 1000;
    let cameraZ = 0;
    const fov = 20;
    const baseSpeed = 0.025;
    let speed = 0;
    let warpSpeed = 0;
    const starStretch = 5;
    const starBaseSize = 0.05;
    
    const stars = [];
    for (let i = 0; i < starAmount; i++) {
        const star = {
            sprite: new Sprite(starTexture),
            z: 0,
            x: 0,
            y: 0,
        };
        star.sprite.anchor.x = 0.5;
        star.sprite.anchor.y = 0.7;
        randomizeStar(star, true);
        this.addChild(star.sprite);
        stars.push(star);
    }
    
    function randomizeStar(star, initial) {
        star.z = initial ? 200 : cameraZ + Math.random() * 1000 + 2000;
    
        // 用径向随机坐标计算星星的位置，这样就不会有星星撞击相机。
        const deg = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 1;
        star.x = Math.cos(deg) * distance;
        star.y = Math.sin(deg) * distance;
    }
    
    // 每5秒钟更改一次飞行速度
    setInterval(() => {
        warpSpeed = warpSpeed > 0 ? 0 : 1;
    }, 5000);
    
    // 监听动画更新
    Game.ticker.add((delta) => {
      console.log(delta, )
        // 简单easing。当用于实数时，应将其更改为适当的缓动功能。
        speed += (warpSpeed - speed) / 20;
        cameraZ += delta * 10 * (speed + baseSpeed);
        for (let i = 0; i < starAmount; i++) {
            const star = stars[i];
            if (star.z < cameraZ) randomizeStar(star);
    
            // 通过非常简单的投影将星图3d位置映射到2d
            const z = star.z - cameraZ;
            star.sprite.x = star.x * (fov / z) * Game.config.width + Game.config.width / 2;
            star.sprite.y = star.y * (fov / z) * Game.config.width + Game.config.height / 2;
    
            // 计算星星坐标和旋转。
            const dxCenter = star.sprite.x - Game.config.width / 2;
            const dyCenter = star.sprite.y - Game.config.height / 2;
            const distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
            const distanceScale = Math.max(0, (2000 - z) / 2000);
            star.sprite.scale.x = distanceScale * starBaseSize;
            // 星星朝向中心，因此y轴朝向中心。
            // 根据我们移动的速度，拉伸因子的大小以及距中心的距离来缩放星形。
            star.sprite.scale.y = distanceScale * starBaseSize + distanceScale * speed * starStretch * distanceCenter / Game.config.width;
            star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
        }
    });
    console.log(Game.ticker)
    
  }
  
  initUI () {
    const config = Game.config
    const gameConfig = Game.config.game
    
    // 画底部判定线
    let judgeLine = new Graphics()
    const judgeLineY = config.height - gameConfig.judgeLineToBottom
    judgeLine.lineStyle(2, 0xFFFFFF)
    judgeLine.moveTo(0, judgeLineY)
    judgeLine.lineTo(config.width, judgeLineY)
    this.addChild(judgeLine)
    
    
  }
}