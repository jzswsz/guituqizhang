export class GameMap {
  constructor(width, height, backgroundImage = null, foregroundImage = null) {
    this.width = width
    this.height = height
    this.backgroundImage = backgroundImage
    this.foregroundImage = foregroundImage  // 前景图片（遮罩层）
    this.obstacles = []      // 障碍物数组
    this.interactiveAreas = [] // 可交互区域
  }

  // 设置背景图片
  setBackground(image) {
    this.backgroundImage = image
    console.log('设置背景图片:', image ? '已设置' : 'null', '图片尺寸:', image && image.complete ? image.width + 'x' + image.height : '未加载完成')
  }

  // 设置前景图片（遮罩层）
  setForeground(image) {
    this.foregroundImage = image
    console.log('设置前景图片:', image ? '已设置' : 'null', '图片尺寸:', image && image.complete ? image.width + 'x' + image.height : '未加载完成')
  }

  // 添加矩形障碍物
  addObstacle(x, y, width, height) {
    this.obstacles.push({ x, y, width, height })
  }

  // 添加可交互区域
  addInteractiveArea(x, y, width, height, action, data) {
    this.interactiveAreas.push({ x, y, width, height, action, data })
  }

  // 检查玩家是否在交互区域内
  checkInteraction(playerX, playerY, playerWidth, playerHeight) {
    const playerRect = {
      x: playerX,
      y: playerY,
      width: playerWidth,
      height: playerHeight
    }

    for (let area of this.interactiveAreas) {
      if (this.rectCollide(playerRect, area)) {
        return { action: area.action, data: area.data }
      }
    }
    return null
  }

  rectCollide(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y
  }

  // 绘制地图背景
  draw(ctx, cameraX, cameraY) {
    // 绘制背景图片
    if (this.backgroundImage && this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0) {
      ctx.drawImage(this.backgroundImage, -cameraX, -cameraY, this.width, this.height)
    } else if (this.backgroundImage) {
      // 图片还在加载中，绘制加载提示
      ctx.fillStyle = '#2c5f8a'
      ctx.fillRect(-cameraX, -cameraY, this.width, this.height)
      ctx.fillStyle = 'white'
      ctx.font = '20px Arial'
      ctx.fillText('加载背景图片中...', -cameraX + 100, -cameraY + 100)
      console.log('背景图片未完成加载')
    } else {
      // 没有背景图片，绘制占位背景
      ctx.fillStyle = '#2c5f8a'
      ctx.fillRect(-cameraX, -cameraY, this.width, this.height)
      
      // 绘制网格
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1
      const tileSize = 64
      for (let x = 0; x < this.width; x += tileSize) {
        ctx.beginPath()
        ctx.moveTo(x - cameraX, -cameraY)
        ctx.lineTo(x - cameraX, -cameraY + this.height)
        ctx.stroke()
      }
      for (let y = 0; y < this.height; y += tileSize) {
        ctx.beginPath()
        ctx.moveTo(-cameraX, y - cameraY)
        ctx.lineTo(-cameraX + this.width, y - cameraY)
        ctx.stroke()
      }
    }

    // 调试模式：绘制障碍物（半透明红色）和交互区域（半透明绿色）
    if (window.DEBUG_MODE) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
      for (let obstacle of this.obstacles) {
        ctx.fillRect(
          obstacle.x - cameraX,
          obstacle.y - cameraY,
          obstacle.width,
          obstacle.height
        )
      }

      ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'
      for (let area of this.interactiveAreas) {
        ctx.fillRect(
          area.x - cameraX,
          area.y - cameraY,
          area.width,
          area.height
        )
      }
    }
  }

  // 绘制前景图层（遮罩层）- 应该在玩家之后调用
  drawForeground(ctx, cameraX, cameraY) {
    if (this.foregroundImage && this.foregroundImage.complete && this.foregroundImage.naturalWidth > 0) {
      ctx.drawImage(this.foregroundImage, -cameraX, -cameraY, this.width, this.height)
    }
  }
}