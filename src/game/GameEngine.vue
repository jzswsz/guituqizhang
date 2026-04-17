<template>
  <div class="game-engine">
    <canvas 
      ref="gameCanvas" 
      :width="canvasWidth" 
      :height="canvasHeight"
      tabindex="0"
      @keydown="handleKeyDown"
      @keyup="handleKeyUp"
      @click="focusCanvas"
    ></canvas>
    
    <!-- 交互提示 -->
    <div v-if="interactionHint" class="interaction-hint">
      💡 {{ interactionHint }}
    </div>
    
    <!-- 进入车内确认弹窗 -->
    <div v-if="showEnterCarDialog" class="modal" @click.self="closeEnterCarDialog">
      <div class="dialog-container">
        <div class="dialog-box">
          <div class="dialog-text">是否进入车内？</div>
          <div class="dialog-buttons">
            <button class="confirm-btn" @click="confirmEnterCar">确认</button>
            <button class="cancel-btn" @click="closeEnterCarDialog">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Player } from './Player'
import { Camera } from './Camera'
import { GameMap } from './Map'

const emit = defineEmits(['enter-car'])

// Canvas 配置
const gameCanvas = ref(null)
const canvasWidth = ref(window.innerWidth)
const canvasHeight = ref(window.innerHeight)
let ctx = null

// 游戏对象
let player = null
let camera = null
let gameMap = null
let animationId = null

// 交互状态
const interactionHint = ref('')
const showEnterCarDialog = ref(false)

// 地图配置
const MAP_WIDTH = 1980
const MAP_HEIGHT = 1980
const PLAYER_SIZE = 90

// 图片资源
let mapImage = null
let foregroundImage = null  // 新增：前景遮挡图
let playerImages = {
  up: [],
  down: [],
  left: [],
  right: []
}

// 初始化游戏
const initGame = () => {
  console.log('initGame 被调用, 地图尺寸:', MAP_WIDTH, 'x', MAP_HEIGHT)
  
  // 创建玩家
  player = new Player(
    MAP_WIDTH / 2, 
    MAP_HEIGHT / 2, 
    PLAYER_SIZE, 
    PLAYER_SIZE, 
    5
  )
  
  // 创建相机
  camera = new Camera(
    canvasWidth.value, 
    canvasHeight.value, 
    MAP_WIDTH, 
    MAP_HEIGHT
  )
  
  // 创建地图（传入前景图）
  gameMap = new GameMap(MAP_WIDTH, MAP_HEIGHT, mapImage, foregroundImage)
  
  // 添加障碍物
  setupObstacles()
  
  // 添加交互区域
  setupInteractiveAreas()
  
  // 设置玩家动画（如果有图片）
  if (playerImages.down.length > 0) {
    player.setAnimations(
      playerImages.up,
      playerImages.down,
      playerImages.left,
      playerImages.right
    )
  }
  
  console.log('initGame 完成，地图背景:', gameMap.backgroundImage ? '有' : '无')
}

// 设置障碍物
const setupObstacles = () => {
  // 注意：addObstacle 需要 4 个参数 (x, y, width, height)
  
  // 左侧大柱子/建筑物
  gameMap.addObstacle(0, 396, 849, 269)
  gameMap.addObstacle(1131, 396, 849, 269)
  
  // 右侧大柱子/建筑物
  gameMap.addObstacle(1837, 396, 143, 1232)
  gameMap.addObstacle(0, 396, 143, 1203)
  
  // 底部左侧障碍物
  gameMap.addObstacle(0, 1148, 758, 85)
  
  // 底部右侧障碍物
  gameMap.addObstacle(1247, 1148, 758, 85)
  
  // 出租车障碍物（注意：x坐标8918超出了地图范围1980，需要修正）
  // gameMap.addObstacle(8918, 170, 145, 65)  // 这个坐标超出地图了，暂时注释

  // 长椅/花坛（8个长椅）
  gameMap.addObstacle(1418, 827, 189, 27)
  gameMap.addObstacle(1418, 982, 189, 27)
  gameMap.addObstacle(1124, 827, 189, 27)
  gameMap.addObstacle(1124, 982, 189, 27)
  gameMap.addObstacle(674, 827, 189, 27)
  gameMap.addObstacle(674, 982, 189, 27)
  gameMap.addObstacle(417, 827, 152, 27)
  gameMap.addObstacle(417, 982, 152, 27)
}

// 设置交互区域（出租车）
const setupInteractiveAreas = () => {
  const taxiX = 847
  const taxiY = 142
  
  gameMap.addInteractiveArea(taxiX, taxiY, 289, 129, 'enterCar', { 
    message: '出租车',
    action: 'enter'
  })
}

// 键盘事件
const handleKeyDown = (e) => {
  const key = e.key.toLowerCase()
  if (player && player.keys.hasOwnProperty(key)) {
    player.setKey(key, true)
    e.preventDefault()
  }
}

const handleKeyUp = (e) => {
  const key = e.key.toLowerCase()
  if (player && player.keys.hasOwnProperty(key)) {
    player.setKey(key, false)
    e.preventDefault()
  }
}

// 让Canvas获得焦点
const focusCanvas = () => {
  gameCanvas.value?.focus()
}

// 更新交互提示
const updateInteractionHint = () => {
  if (!player || !gameMap) return
  
  const interaction = gameMap.checkInteraction(
    player.x, 
    player.y, 
    player.width, 
    player.height
  )
  
  if (interaction) {
    interactionHint.value = `按 E 键 ${interaction.data.message}`
    
    const checkEKey = (e) => {
      if (e.key === 'e' || e.key === 'E') {
        handleInteraction(interaction)
        document.removeEventListener('keydown', checkEKey)
      }
    }
    document.addEventListener('keydown', checkEKey)
    
    setTimeout(() => {
      document.removeEventListener('keydown', checkEKey)
    }, 100)
  } else {
    interactionHint.value = ''
  }
}

// 处理交互
const handleInteraction = (interaction) => {
  switch(interaction.action) {
    case 'enterCar':
      showEnterCarDialog.value = true
      break
  }
}

// 确认进入车内
const confirmEnterCar = () => {
  showEnterCarDialog.value = false
  emit('enter-car')
}

const closeEnterCarDialog = () => {
  showEnterCarDialog.value = false
}

// 游戏循环
const gameLoop = () => {
  if (!player || !camera || !gameMap) return
  
  player.update(MAP_WIDTH, MAP_HEIGHT, gameMap.obstacles)
  camera.follow(player.x, player.y, player.width, player.height)
  updateInteractionHint()
  render()
  
  animationId = requestAnimationFrame(gameLoop)
}

// 渲染 - 关键：前景图在玩家之后绘制，实现遮挡效果
const render = () => {
  if (!ctx) return
  
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  ctx.save()
  
  // 1. 绘制地图背景
  gameMap.draw(ctx, camera.x, camera.y)
  
  // 2. 绘制玩家
  player.draw(ctx, camera.x, camera.y)
  
  // 3. 绘制前景图层（遮罩层，遮挡玩家）
  gameMap.drawForeground(ctx, camera.x, camera.y)
  
  ctx.restore()
}

// 窗口大小适配
const handleResize = () => {
  canvasWidth.value = window.innerWidth
  canvasHeight.value = window.innerHeight
  
  if (camera) {
    camera.screenWidth = canvasWidth.value
    camera.screenHeight = canvasHeight.value
  }
  
  if (gameCanvas.value) {
    gameCanvas.value.width = canvasWidth.value
    gameCanvas.value.height = canvasHeight.value
  }
  
  // 重新渲染
  if (ctx) render()
}

// 设置图片资源（增加前景图参数）
const setImages = (mapImg, playerImgSets, fgImg = null) => {
  console.log('setImages 被调用', mapImg ? '地图图片存在' : '地图图片为空')
  if (mapImg) {
    console.log('地图图片尺寸:', mapImg.width, 'x', mapImg.height)
  }
  if (fgImg) {
    console.log('前景图片尺寸:', fgImg.width, 'x', fgImg.height)
  }
  
  mapImage = mapImg
  foregroundImage = fgImg  // 设置前景图
  
  playerImages = {
    up: playerImgSets.up || [],
    down: playerImgSets.down || [],
    left: playerImgSets.left || [],
    right: playerImgSets.right || []
  }
  
  if (player && gameMap) {
    if (playerImages.down.length > 0) {
      player.setAnimations(
        playerImages.up,
        playerImages.down,
        playerImages.left,
        playerImages.right
      )
    }
    if (mapImage) {
      console.log('更新地图背景')
      gameMap.setBackground(mapImage)
    }
    if (foregroundImage) {
      console.log('更新前景图层')
      gameMap.setForeground(foregroundImage)
    }
    render()
  } else {
    console.log('游戏未初始化，等待 initGame')
  }
}

// 设置玩家位置
const setPlayerPosition = (x, y) => {
  if (player) {
    console.log('设置玩家位置:', x, y)
    player.setPosition(x, y)
    if (camera) {
      camera.follow(player.x, player.y, player.width, player.height)
      render()
    }
  }
}

// 暴露方法给父组件
defineExpose({
  setImages,
  initGame,
  setPlayerPosition
})

onMounted(() => {
  console.log('GameEngine onMounted, 窗口尺寸:', window.innerWidth, 'x', window.innerHeight)
  ctx = gameCanvas.value.getContext('2d')
  gameCanvas.value.width = canvasWidth.value
  gameCanvas.value.height = canvasHeight.value
  
  initGame()
  
  setTimeout(() => {
    gameCanvas.value.focus()
  }, 100)
  
  gameLoop()
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.game-engine {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.game-engine canvas {
  display: block;
  width: 100%;
  height: 100%;
  outline: none;
  cursor: crosshair;
}

.interaction-hint {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: #ffd700;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  pointer-events: none;
  z-index: 100;
  animation: fadeInUp 0.3s;
  white-space: nowrap;
  border: 1px solid #ffd700;
  backdrop-filter: blur(5px);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
}

.dialog-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-box {
  background: #fff;
  border-radius: 20px;
  padding: 30px 40px;
  text-align: center;
  min-width: 300px;
  animation: fadeIn 0.3s;
}

.dialog-text {
  font-size: 20px;
  margin-bottom: 25px;
  color: #333;
  font-family: 'Courier New', monospace;
}

.dialog-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.confirm-btn {
  padding: 10px 30px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-family: 'Courier New', monospace;
}

.cancel-btn {
  padding: 10px 30px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-family: 'Courier New', monospace;
}

.confirm-btn:hover {
  background: #45a049;
}

.cancel-btn:hover {
  background: #ff5252;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>