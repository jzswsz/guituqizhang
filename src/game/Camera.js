export class Camera {
  constructor(screenWidth, screenHeight, mapWidth, mapHeight) {
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    this.mapWidth = mapWidth
    this.mapHeight = mapHeight
    this.x = 0
    this.y = 0
  }

  // 跟随目标
  follow(targetX, targetY, targetWidth, targetHeight) {
    // 计算理想相机位置（让玩家在屏幕中央）
    let targetCameraX = targetX + targetWidth / 2 - this.screenWidth / 2
    let targetCameraY = targetY + targetHeight / 2 - this.screenHeight / 2

    // 边界限制
    targetCameraX = Math.max(0, Math.min(targetCameraX, this.mapWidth - this.screenWidth))
    targetCameraY = Math.max(0, Math.min(targetCameraY, this.mapHeight - this.screenHeight))

    this.x = targetCameraX
    this.y = targetCameraY
  }

  // 世界坐标转屏幕坐标
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    }
  }

  // 屏幕坐标转世界坐标
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    }
  }
}