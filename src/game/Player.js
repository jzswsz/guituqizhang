export class Player {
  constructor(x, y, width, height, speed = 5) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.speed = speed
    this.direction = 'down' // up, down, left, right
    this.keys = {
      w: false, a: false, s: false, d: false
    }
    this.image = null
    this.animations = {
      up: [],
      down: [],
      left: [],
      right: []
    }
    this.currentFrame = 0
    this.lastFrameTime = 0
    this.frameInterval = 100 // 毫秒
  }

  // 设置人物动画图片
  setAnimations(upFrames, downFrames, leftFrames, rightFrames) {
    this.animations.up = upFrames || []
    this.animations.down = downFrames || []
    this.animations.left = leftFrames || []
    this.animations.right = rightFrames || []
    // 默认使用向下动画的第一帧
    if (this.animations.down.length > 0) {
      this.image = this.animations.down[0]
    }
  }

  // 更新动画帧
  updateAnimation(isMoving) {
    const now = Date.now()
    if (isMoving && now - this.lastFrameTime > this.frameInterval) {
      const frames = this.animations[this.direction]
      if (frames && frames.length > 0) {
        this.currentFrame = (this.currentFrame + 1) % frames.length
        this.image = frames[this.currentFrame]
        this.lastFrameTime = now
      }
    } else if (!isMoving) {
      // 静止时使用第1帧
      const frames = this.animations[this.direction]
      if (frames && frames.length > 0 && this.currentFrame !== 0) {
        this.currentFrame = 0
        this.image = frames[0]
      }
    }
  }

  // 更新玩家位置
  update(mapWidth, mapHeight, obstacles = []) {
    let newX = this.x
    let newY = this.y
    let isMoving = false

    if (this.keys.w) { 
      newY -= this.speed
      this.direction = 'up'
      isMoving = true
    }
    if (this.keys.s) { 
      newY += this.speed
      this.direction = 'down'
      isMoving = true
    }
    if (this.keys.a) { 
      newX -= this.speed
      this.direction = 'left'
      isMoving = true
    }
    if (this.keys.d) { 
      newX += this.speed
      this.direction = 'right'
      isMoving = true
    }

    // 更新动画
    this.updateAnimation(isMoving)

    // 碰撞检测
    let canMoveX = true
    let canMoveY = true

    for (let obstacle of obstacles) {
      // 检测X方向移动
      const testRectX = { x: newX, y: this.y, width: this.width, height: this.height }
      if (this.rectCollide(testRectX, obstacle)) {
        canMoveX = false
      }
      // 检测Y方向移动
      const testRectY = { x: this.x, y: newY, width: this.width, height: this.height }
      if (this.rectCollide(testRectY, obstacle)) {
        canMoveY = false
      }
    }

    // 边界检测
    if (canMoveX && newX >= 0 && newX + this.width <= mapWidth) {
      this.x = newX
    }
    if (canMoveY && newY >= 0 && newY + this.height <= mapHeight) {
      this.y = newY
    }

    return isMoving
  }

  // 矩形碰撞检测
  rectCollide(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y
  }

  // 设置按键状态
  setKey(key, isPressed) {
    if (this.keys.hasOwnProperty(key)) {
      this.keys[key] = isPressed
    }
  }

  // 绘制玩家
  draw(ctx, cameraX, cameraY) {
    const screenX = this.x - cameraX
    const screenY = this.y - cameraY
    
    if (this.image) {
      ctx.drawImage(this.image, screenX, screenY, this.width, this.height)
    } else {
      // 占位绘制
      ctx.fillStyle = '#ff6b6b'
      ctx.fillRect(screenX, screenY, this.width, this.height)
      ctx.fillStyle = '#fff'
      ctx.font = '12px Arial'
      ctx.fillText('玩家', screenX + 10, screenY + 25)
    }
  }

  // 获取玩家中心点
  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    }
  }

  // 设置玩家位置
  setPosition(x, y) {
    this.x = x
    this.y = y
  }
}