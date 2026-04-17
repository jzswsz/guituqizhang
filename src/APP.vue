<template>
  <div class="game-app">
    <!-- 游戏首页 -->
    <GameHome v-if="!gameStarted" @start-game="startGame" />
    
    <!-- 游戏主界面 -->
    <div v-else-if="!gameCompleted" class="game-container">
      <!-- 车站场景：使用游戏引擎 -->
      <GameEngine 
        v-if="currentScene === 'chezhan'"
        ref="gameEngineRef"
        @enter-car="enterCar"
      />

      <!-- 车内场景 -->
      <div v-else class="car-scene">
        <img :src="getImageUrl('chenei.png')" class="scene-bg" alt="车内背景">
        
        <!-- 离开车内按钮 -->
        <div class="exit-car-btn" @click="exitCar">
          <span>🚪 离开车内</span>
        </div>
        
        <!-- 车内可交互物品 -->
        <div class="interactive-items">
          <div class="item pinganfu" @click="openMemorySpace" :class="{ completed: pinganfuCompleted }">
            <img :src="getImageUrl('pinganfu.png')" alt="平安符">
            <span>平安符</span>
          </div>
          <div class="item beibao" @click="openBackpack" :class="{ completed: thermosCompleted }">
            <img :src="getImageUrl('beibao.png')" alt="背包">
            <span>背包</span>
          </div>
        </div>
        
        <!-- 情感碎片计数器 -->
        <div class="fragments-counter">情感碎片: {{ emotionalFragments }}/3</div>
        
        <!-- 手机图标 -->
        <div class="phone-icon" @click="openPhonePuzzle">
          <img :src="getImageUrl('shouji.png')" alt="手机">
        </div>
      </div>

      <!-- 父亲对话框 -->
      <div v-if="fatherDialogVisible" class="modal" @click.self="closeFatherDialog">
        <div class="dialog-container">
          <img :src="getImageUrl('fuqin.png')" class="father-portrait" alt="父亲">
          <div class="dialog-box">
            <div class="dialog-text">
              {{ displayedText }}
              <span class="cursor" v-if="!isTypingComplete">|</span>
            </div>
            <button class="close-dialog" @click="closeFatherDialog">关闭</button>
          </div>
        </div>
      </div>

      <!-- 记忆空间模态框 -->
      <div v-if="memorySpaceVisible" class="modal" @click.self="closeMemorySpace">
        <div class="memory-modal">
          <h2>记忆空间</h2>
          <div class="tickets-container">
            <div
              v-for="(ticket, index) in tickets"
              :key="ticket.id"
              class="ticket-card"
            >
              <div class="ticket-info">
                <div class="ticket-route">{{ ticket.route }}</div>
                <div class="ticket-date">{{ ticket.date }}</div>
              </div>
              <div class="ticket-controls">
                <button @click="moveTicket(index, -1)" :disabled="index === 0">▲</button>
                <button @click="moveTicket(index, 1)" :disabled="index === tickets.length - 1">▼</button>
              </div>
            </div>
          </div>
          <button class="submit-tickets" @click="checkTicketOrder">提交排序</button>
          <button class="close-modal" @click="closeMemorySpace">关闭</button>
        </div>
      </div>

      <!-- 背包模态框 -->
      <div v-if="backpackVisible" class="modal" @click.self="closeBackpack">
        <div class="backpack-modal">
          <h2>背包</h2>
          <img :src="getImageUrl('baowenbei.png')" class="thermos" alt="保温杯">
          <div class="audio-hint">
            📢 录音提示: "爸，姜茶不要太烫，我舌头怕烫，要温温的。"
          </div>

          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="slider" :style="{ top: sliderPosition + '%' }"></div>
              <div class="green-zone" :style="{ top: greenZoneStart + '%', height: greenZoneHeight + '%' }"></div>
            </div>
          </div>

          <div class="progress-controls">
            <button @click="checkWaterTemp" class="confirm-btn">确认</button>
            <div class="water-feedback">{{ waterFeedback }}</div>
          </div>

          <button class="close-modal" @click="closeBackpack">关闭</button>
        </div>
      </div>

      <!-- 手机谜题 -->
      <div v-if="phonePuzzleVisible" class="phone-puzzle-overlay" @click.self="phonePuzzleVisible = false">
        <div class="phone-puzzle-container">
          <div class="phone-screen" :style="{ backgroundImage: `url(${getImageUrl('shoujikong.png')})` }">
            <div class="phone-header">
              <h3>手 机</h3>
              <button class="close-phone" @click="phonePuzzleVisible = false">✕</button>
            </div>
            
            <div class="phone-tabs">
              <button @click="phoneActiveTab = 'calls'" :class="{ active: phoneActiveTab === 'calls' }">通话记录</button>
              <button @click="phoneActiveTab = 'drafts'" :class="{ active: phoneActiveTab === 'drafts' }">草稿短信</button>
            </div>
            
            <div v-if="phoneActiveTab === 'calls'" class="calls-list">
              <div 
                v-for="call in phoneCalls" 
                :key="call.id"
                class="call-item"
                :class="{ matched: call.matched }"
                draggable="true"
                @dragstart="handleDragStart($event, call)"
                @dragover.prevent
                @drop="handleDropOnCall(call)"
              >
                <span class="call-date">{{ call.date }}</span>
                <span class="call-status" :class="call.status === '未接' ? 'missed' : 'answered'">
                  {{ call.status }}
                </span>
                <span v-if="call.matched" class="matched-badge">✓ 已匹配</span>
              </div>
            </div>
            
            <div v-if="phoneActiveTab === 'drafts'" class="drafts-list">
              <div 
                v-for="draft in phoneDrafts" 
                :key="draft.id"
                class="draft-item"
                :class="{ sent: draft.sent }"
                draggable="true"
                @dragstart="handleDragStart($event, draft)"
              >
                <p class="draft-text">{{ draft.text }}</p>
                <span v-if="draft.sent" class="sent-badge">✓ 已发送</span>
              </div>
            </div>
            
            <div class="phone-footer">
              <p v-if="phoneAllMatched" class="complete-message">草稿已保存</p>
              <p v-else class="hint-message">将草稿拖拽到对应的通话记录上</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 普通提示弹窗 -->
      <div v-if="alertMessage" class="alert-toast">{{ alertMessage }}</div>
    </div>

    <!-- 结局场景 -->
    <div v-else class="ending-scene">
      <div class="white-overlay" :class="{ 'active': showWhiteOverlay }"></div>
      
      <div v-if="showNightguardDialog" class="ending-dialog-container" :class="{ 'fade-in': dialogVisible }">
        <div class="nightguard-portrait">🌙 守夜人</div>
        <div class="ending-dialog-box">
          <div class="ending-dialog-text">{{ nightguardText }}</div>
        </div>
      </div>

      <div v-if="showBondValue" class="bond-value" :class="{ 'slide-in': bondVisible }">
        羁绊值 +1（总羁绊值：{{ bondValue }}/6）
      </div>

      <div v-if="showNextButton" class="next-button-container" :class="{ 'fade-in-up': buttonVisible }">
        <button class="next-chapter-btn" @click="showComingSoon">下一章</button>
      </div>

      <div v-if="showComingSoonModal" class="modal" @click.self="showComingSoonModal = false">
        <div class="coming-soon-modal">
          <h2>✨ 敬请期待 ✨</h2>
          <p>第二章 · 待续</p>
          <button class="close-modal" @click="showComingSoonModal = false">关 闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import GameHome from './components/GameHome.vue'
import GameEngine from './game/GameEngine.vue'

// 游戏状态
const gameStarted = ref(false)
const gameCompleted = ref(false)
const currentScene = ref('chezhan')

// 出租车位置
const taxiPosition = { x: 1460, y: 300 }

// 谜题状态
const pinganfuCompleted = ref(false)
const thermosCompleted = ref(false)
const phoneCompleted = ref(false)
const emotionalFragments = ref(0)
const memorySpaceVisible = ref(false)
const backpackVisible = ref(false)
const fatherDialogVisible = ref(false)
const phonePuzzleVisible = ref(false)
const alertMessage = ref('')

// 父亲对话框
const displayedText = ref('')
let typingInterval = null
const isTypingComplete = ref(false)

// 结局场景状态
const showWhiteOverlay = ref(false)
const showNightguardDialog = ref(false)
const dialogVisible = ref(false)
const nightguardText = ref('')
const showBondValue = ref(false)
const bondVisible = ref(false)
const showNextButton = ref(false)
const buttonVisible = ref(false)
const showComingSoonModal = ref(false)
const bondValue = ref(1)
let endingTypingInterval = null

// 保温杯进度条
const sliderPosition = ref(50)
const greenZoneStart = ref(40)
const greenZoneHeight = ref(20)
const waterFeedback = ref('')
let animationInterval = null
let sliderDirection = 1

// 手机谜题相关
const phoneActiveTab = ref('calls')
const phoneAllMatched = ref(false)
let draggedPhoneItem = null

const phoneCalls = ref([
  { id: 1, date: '2023年11月15日', status: '已接', matched: false, matchId: 1 },
  { id: 2, date: '2023年11月15日', status: '未接', matched: false, matchId: 2 },
  { id: 3, date: '2024年1月15日', status: '已接', matched: false, matchId: 3 },
  { id: 4, date: '2024年1月15日', status: '未接', matched: false, matchId: 4 }
])

const phoneDrafts = ref([
  { id: 1, text: '爸，我到上海了，别担心', sent: false, matchId: 1 },
  { id: 2, text: '闺女，爸在楼下，你忙就不上去了', sent: false, matchId: 4 },
  { id: 3, text: '爸，新年快乐，今年我值班', sent: false, matchId: 3 },
  { id: 4, text: '爸，我刚到，你到了吗', sent: false, matchId: 2 }
])

// 车票数据
// 车票数据（使用随机顺序）
const getAllTickets = () => {
  const allTickets = [
    { id: 1, date: '2023年11月15日', route: '芜湖站 → 上海站' },
    { id: 2, date: '2023年11月15日', route: '上海站 → 芜湖站' },
    { id: 3, date: '2024年1月15日', route: '芜湖站 → 上海站' },
    { id: 4, date: '2024年1月15日', route: '上海站 → 芜湖站' }
  ]
  // 随机打乱顺序
  for (let i = allTickets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTickets[i], allTickets[j]] = [allTickets[j], allTickets[i]]
  }
  return allTickets
}

const tickets = ref(getAllTickets())

const gameEngineRef = ref(null)

// 辅助函数
const getImageUrl = (filename) => {
  return `/images/${filename}`
}

const showAlert = (message, duration = 2000) => {
  alertMessage.value = message
  setTimeout(() => { alertMessage.value = '' }, duration)
}

// 显示父亲对话
const showFatherDialogByText = (text) => {
  fatherDialogVisible.value = true
  displayedText.value = ''
  isTypingComplete.value = false
  if (typingInterval) clearInterval(typingInterval)
  let index = 0
  typingInterval = setInterval(() => {
    if (index < text.length) {
      displayedText.value += text[index]
      index++
    } else {
      clearInterval(typingInterval)
      isTypingComplete.value = true
      typingInterval = null
    }
  }, 80)
}

const closeFatherDialog = () => {
  fatherDialogVisible.value = false
  if (typingInterval) clearInterval(typingInterval)
}

// 场景切换
const startGame = () => {
  gameStarted.value = true
  currentScene.value = 'chezhan'
  // 延迟加载图片，确保组件已挂载
  setTimeout(() => {
    loadImagesAndStart()
  }, 100)
}

const enterCar = () => {
  currentScene.value = 'chenei'
}

const exitCar = () => {
  currentScene.value = 'chezhan'
  if (gameEngineRef.value) {
    gameEngineRef.value.setPlayerPosition(taxiPosition.x, taxiPosition.y)
  }
}

// 加载图片资源
const loadImagesAndStart = async () => {
  console.log('开始加载图片...')
  
  // 加载地图背景
  const mapImg = new Image()
  mapImg.src = getImageUrl('chezhan.png')
  await new Promise((resolve) => {
    mapImg.onload = () => {
      console.log('地图图片加载成功，尺寸:', mapImg.width, 'x', mapImg.height)
      resolve()
    }
    mapImg.onerror = () => {
      console.warn('地图图片加载失败: chezhan.png')
      resolve()
    }
  })

  // 加载前景遮挡图（遮罩层）
  const foregroundImg = new Image()
  foregroundImg.src = getImageUrl('zhedang.png')  // 您的遮挡图层图片
  await new Promise((resolve) => {
    foregroundImg.onload = () => {
      console.log('前景遮挡图加载成功，尺寸:', foregroundImg.width, 'x', foregroundImg.height)
      resolve()
    }
    foregroundImg.onerror = () => {
      console.warn('前景图片加载失败: zhedang.png，将不使用遮挡效果')
      resolve()
    }
  })

  // 加载人物动画（每个方向4帧）
  const directions = ['down', 'up', 'left', 'right']
  const loadedImages = { up: [], down: [], left: [], right: [] }
  
  for (const dir of directions) {
    for (let i = 1; i <= 4; i++) {
      const img = new Image()
      const imgPath = getImageUrl(`renwu_${dir}_${i}.png`)
      img.src = imgPath
      await new Promise((resolve) => {
        img.onload = () => {
          console.log(`加载成功: renwu_${dir}_${i}.png`)
          loadedImages[dir].push(img)
          resolve()
        }
        img.onerror = () => {
          console.warn(`人物图片加载失败: renwu_${dir}_${i}.png`)
          loadedImages[dir].push(null)
          resolve()
        }
      })
    }
  }
  
  // 将图片传递给游戏引擎（包括前景图）
  if (gameEngineRef.value) {
    console.log('传递图片到游戏引擎')
    gameEngineRef.value.setImages(mapImg, loadedImages, foregroundImg)
  }
}

// 检查是否完成所有谜题
const checkAllPuzzlesComplete = () => {
  if (pinganfuCompleted.value && thermosCompleted.value && phoneCompleted.value && !gameCompleted.value) {
    gameCompleted.value = true
    triggerEndingScene()
  }
}

// 触发结局场景
const triggerEndingScene = () => {
  setTimeout(() => { showWhiteOverlay.value = true }, 500)
  setTimeout(() => {
    showNightguardDialog.value = true
    typeNightguardText('你已经看到了一部分真相。现在，你可以和他说话了。')
    setTimeout(() => { dialogVisible.value = true }, 100)
    setTimeout(() => {
      showBondValue.value = true
      setTimeout(() => { bondVisible.value = true }, 100)
    }, 3000)
    setTimeout(() => { typeNightguardText('你还有六天。继续走吧。') }, 5000)
    setTimeout(() => {
      showNextButton.value = true
      setTimeout(() => { buttonVisible.value = true }, 100)
    }, 8000)
  }, 1000)
}

const typeNightguardText = (text) => {
  if (endingTypingInterval) clearInterval(endingTypingInterval)
  nightguardText.value = ''
  let index = 0
  endingTypingInterval = setInterval(() => {
    if (index < text.length) {
      nightguardText.value += text[index]
      index++
    } else {
      clearInterval(endingTypingInterval)
      endingTypingInterval = null
    }
  }, 60)
}

const showComingSoon = () => {
  showComingSoonModal.value = true
}

// 车票排序
const moveTicket = (index, direction) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= tickets.value.length) return
  const temp = tickets.value[index]
  tickets.value[index] = tickets.value[newIndex]
  tickets.value[newIndex] = temp
}

const checkTicketOrder = () => {
  const isCorrect = 
    tickets.value[0].route === '芜湖站 → 上海站' && tickets.value[0].date === '2023年11月15日' &&
    tickets.value[1].route === '上海站 → 芜湖站' && tickets.value[1].date === '2023年11月15日' &&
    tickets.value[2].route === '芜湖站 → 上海站' && tickets.value[2].date === '2024年1月15日' &&
    tickets.value[3].route === '上海站 → 芜湖站' && tickets.value[3].date === '2024年1月15日'

  if (isCorrect && !pinganfuCompleted.value) {
    pinganfuCompleted.value = true
    emotionalFragments.value++
    showAlert('获得情感碎片*1')
    closeMemorySpace()
    showFatherDialogByText('她瘦了，但没跟我说。我还是别上去了，她忙。')
    checkAllPuzzlesComplete()
  } else if (pinganfuCompleted.value) {
    showAlert('你已经完成过这个谜题了！')
  } else {
    showAlert('排序错误，请按日期和行程顺序排列！')
  }
}

const openMemorySpace = () => {
  if (pinganfuCompleted.value) {
    showAlert('平安符已经完成，记忆已收集！')
    return
  }
  memorySpaceVisible.value = true
}

const closeMemorySpace = () => {
  memorySpaceVisible.value = false
}

// 保温杯谜题
const openBackpack = () => {
  if (thermosCompleted.value) {
    showAlert('保温杯谜题已完成！')
    return
  }
  backpackVisible.value = true
  startSliderAnimation()
}

const closeBackpack = () => {
  backpackVisible.value = false
  waterFeedback.value = ''
  stopSliderAnimation()
}

const startSliderAnimation = () => {
  if (animationInterval) clearInterval(animationInterval)
  animationInterval = setInterval(() => {
    let newPosition = sliderPosition.value + (sliderDirection * 2)
    if (newPosition >= 100) { newPosition = 100; sliderDirection = -1 }
    else if (newPosition <= 0) { newPosition = 0; sliderDirection = 1 }
    sliderPosition.value = newPosition
  }, 30)
}

const stopSliderAnimation = () => {
  if (animationInterval) { clearInterval(animationInterval); animationInterval = null }
}

const checkWaterTemp = () => {
  const isInGreenZone = sliderPosition.value >= greenZoneStart.value &&
                        sliderPosition.value <= (greenZoneStart.value + greenZoneHeight.value)

  if (isInGreenZone) {
    waterFeedback.value = '水温刚好，喝到了温水'
    showAlert('水温刚好，喝到了温水')
    if (!thermosCompleted.value) {
      thermosCompleted.value = true
      emotionalFragments.value++
      showAlert('获得情感碎片*1')
      closeBackpack()
      showFatherDialogByText('闺女，爸给你带了姜茶，等你放学。\n（可是女儿已经和同学离开了...）')
      checkAllPuzzlesComplete()
    }
  } else {
    waterFeedback.value = sliderPosition.value < greenZoneStart.value ? '凉了，没味了。' : '太烫了，她喝不了。'
    showAlert(waterFeedback.value)
  }
  setTimeout(() => { if (waterFeedback.value) waterFeedback.value = '' }, 2000)
}

// 手机谜题
const openPhonePuzzle = () => {
  if (phoneCompleted.value) {
    showAlert('手机谜题已完成！')
    return
  }
  phonePuzzleVisible.value = true
}

const handleDragStart = (event, item) => {
  draggedPhoneItem = item
  event.dataTransfer.setData('text/plain', JSON.stringify(item))
}

const handleDropOnCall = (call) => {
  if (!draggedPhoneItem) return
  if (draggedPhoneItem.matchId === call.id && !call.matched && !draggedPhoneItem.sent) {
    call.matched = true
    const draft = phoneDrafts.value.find(d => d.id === draggedPhoneItem.id)
    if (draft) draft.sent = true
    
    const allCallsMatched = phoneCalls.value.every(c => c.matched)
    const allDraftsSent = phoneDrafts.value.every(d => d.sent)
    
    if (allCallsMatched && allDraftsSent && !phoneCompleted.value) {
      phoneAllMatched.value = true
      phoneCompleted.value = true
      emotionalFragments.value++
      showAlert('获得情感碎片*1')
      setTimeout(() => {
        phonePuzzleVisible.value = false
        showFatherDialogByText('算了，她忙，别打扰她。')
        checkAllPuzzlesComplete()
      }, 1500)
    }
  }
  draggedPhoneItem = null
}
</script>

<style scoped>
.game-app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.game-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #000;
}

/* 车内场景样式 */
.car-scene {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.scene-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.exit-car-btn {
  position: fixed;
  top: 20px;
  right: 90px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  border: 1px solid #fff;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}

.exit-car-btn:hover {
  background: #ff6b6b;
  transform: scale(1.05);
}

.interactive-items {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 20;
  display: flex;
  gap: 20px;
}

.item {
  text-align: center;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 10px;
  color: white;
  transition: transform 0.3s;
}

.item:hover {
  transform: scale(1.1);
}

.item img {
  width: 80px;
  height: 80px;
  display: block;
  margin-bottom: 5px;
}

.item.completed {
  opacity: 0.5;
  cursor: not-allowed;
}

.fragments-counter {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #ffd700;
  padding: 10px 20px;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  z-index: 100;
}

.phone-icon {
  position: fixed;
  top: 20px;
  right: 20px;
  cursor: pointer;
  z-index: 100;
  transition: transform 0.3s;
}

.phone-icon:hover {
  transform: scale(1.1);
}

.phone-icon img {
  width: 50px;
  height: 50px;
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
  gap: 20px;
  background: rgba(0, 0, 0, 0.9);
  padding: 20px;
  border-radius: 20px;
  max-width: 800px;
}

.father-portrait {
  width: 200px;
  height: auto;
  border-radius: 10px;
}

.dialog-box {
  flex: 1;
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  min-width: 300px;
}

.dialog-text {
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 20px;
  color: #333;
  white-space: pre-line;
}

.cursor {
  animation: blink 1s infinite;
}

.close-dialog {
  padding: 8px 20px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.memory-modal {
  background: rgba(0, 0, 0, 0.95);
  padding: 30px;
  border-radius: 20px;
  min-width: 600px;
  text-align: center;
}

.memory-modal h2 {
  color: white;
  margin-bottom: 20px;
}

.tickets-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.ticket-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-info {
  text-align: left;
}

.ticket-route {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.ticket-date {
  font-size: 14px;
  color: #666;
}

.ticket-controls {
  display: flex;
  gap: 10px;
}

.ticket-controls button {
  padding: 10px 15px;
  font-size: 18px;
  cursor: pointer;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 5px;
}

.backpack-modal {
  background: rgba(0, 0, 0, 0.95);
  padding: 30px;
  border-radius: 20px;
  min-width: 400px;
  text-align: center;
}

.backpack-modal h2 {
  color: white;
  margin-bottom: 20px;
}

.thermos {
  width: 150px;
  height: auto;
  margin-bottom: 20px;
}

.audio-hint {
  background: rgba(255, 215, 0, 0.2);
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 20px;
  color: #ffd700;
  font-size: 14px;
}

.progress-bar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.progress-bar {
  width: 50px;
  height: 300px;
  background: #ddd;
  position: relative;
  border-radius: 25px;
  overflow: hidden;
  border: 2px solid #fff;
}

.green-zone {
  position: absolute;
  width: 100%;
  background: rgba(76, 175, 80, 0.6);
  left: 0;
}

.slider {
  position: absolute;
  width: 100%;
  height: 4px;
  background: red;
  left: 0;
  z-index: 10;
}

.confirm-btn {
  padding: 10px 30px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px 0;
}

.water-feedback {
  color: #ffd700;
}

.phone-puzzle-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.phone-screen {
  width: 380px;
  height: 600px;
  background-size: cover;
  background-position: center;
  border-radius: 30px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.phone-header {
  background: rgba(0,0,0,0.8);
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.close-phone {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.phone-tabs {
  display: flex;
  background: rgba(0,0,0,0.7);
}

.phone-tabs button {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-family: 'Courier New', monospace;
}

.phone-tabs button.active {
  background: rgba(255,215,0,0.3);
  border-bottom: 2px solid #ffd700;
}

.calls-list, .drafts-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: rgba(0,0,0,0.6);
}

.call-item {
  background: rgba(255,255,255,0.9);
  margin: 10px 0;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: grab;
}

.call-item.matched {
  background: rgba(76, 175, 80, 0.9);
}

.draft-item {
  background: rgba(255,255,255,0.9);
  margin: 10px 0;
  padding: 12px;
  border-radius: 8px;
  cursor: grab;
}

.draft-item.sent {
  background: rgba(76, 175, 80, 0.9);
}

.draft-text {
  margin: 0;
  font-size: 12px;
}

.phone-footer {
  padding: 15px;
  background: rgba(0,0,0,0.8);
  text-align: center;
  color: white;
}

.complete-message {
  color: #ffd700;
}

.alert-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: #ffd700;
  padding: 15px 30px;
  border-radius: 10px;
  z-index: 400;
  font-size: 18px;
}

.close-modal {
  margin-top: 10px;
  padding: 8px 20px;
  background: #666;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
}

.submit-tickets {
  padding: 10px 30px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
}

/* 结局场景 */
.ending-scene {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #e8e0d4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.white-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  opacity: 0;
  transition: opacity 1s ease;
}

.white-overlay.active {
  opacity: 1;
}

.ending-dialog-container {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.5s ease;
  margin-bottom: 50px;
}

.ending-dialog-container.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.nightguard-portrait {
  font-size: 48px;
  text-align: center;
  margin-bottom: 20px;
}

.ending-dialog-box {
  background: rgba(44, 24, 16, 0.9);
  border-radius: 20px;
  padding: 25px 35px;
  max-width: 500px;
  border: 2px solid #d4a574;
}

.ending-dialog-text {
  font-size: 20px;
  color: #ffd700;
  line-height: 1.5;
  text-align: center;
}


.bond-value {
  position: absolute;
  top: 30px;
  left: -300px;
  background: rgba(0, 0, 0, 0.8);
  color: #ffd700;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 18px;
  transition: left 0.5s ease;
  border: 1px solid #ffd700;
}

.bond-value.slide-in {
  left: 20px;
}

.next-button-container {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.next-button-container.fade-in-up {
  opacity: 1;
  animation: buttonFadeInUp 0.5s ease;
}

.next-chapter-btn {
  background: linear-gradient(135deg, #2c1810, #4a2c1a);
  border: 2px solid #d4a574;
  padding: 15px 50px;
  font-size: 24px;
  font-family: 'Courier New', monospace;
  color: #ffd700;
  cursor: pointer;
  border-radius: 50px;
}

.coming-soon-modal {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  padding: 40px 60px;
  border-radius: 20px;
  text-align: center;
  border: 2px solid #ffd700;
}

.coming-soon-modal h2 {
  color: #ffd700;
  font-size: 32px;
  margin-bottom: 20px;
}

.coming-soon-modal p {
  color: white;
  font-size: 18px;
  margin-bottom: 30px;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes buttonFadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>