<template>
  <div class="phone-puzzle">
    <div class="phone-screen" :style="{ backgroundImage: `url(${phoneBgImage})` }">
      <div class="phone-header">
        <h3>手 机</h3>
        <button class="close-phone" @click="close">✕</button>
      </div>
      
      <div class="phone-tabs">
        <button @click="activeTab = 'calls'" :class="{ active: activeTab === 'calls' }">通话记录</button>
        <button @click="activeTab = 'drafts'" :class="{ active: activeTab === 'drafts' }">草稿短信</button>
      </div>
      
      <!-- 通话记录列表 -->
      <div v-if="activeTab === 'calls'" class="calls-list">
        <div 
          v-for="call in calls" 
          :key="call.id"
          class="call-item"
          :class="{ matched: call.matched }"
          draggable="true"
          @dragstart="handleDragStart($event, call)"
        >
          <span class="call-date">{{ call.date }}</span>
          <span class="call-status" :class="call.status === '未接' ? 'missed' : 'answered'">
            {{ call.status }}
          </span>
          <span v-if="call.matched" class="matched-badge">✓ 已匹配</span>
        </div>
      </div>
      
      <!-- 草稿短信列表 -->
      <div v-if="activeTab === 'drafts'" class="drafts-list">
        <div 
          v-for="draft in drafts" 
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
        <p v-if="allMatched" class="complete-message">草稿已保存</p>
        <p v-else class="hint-message">将草稿拖拽到对应的通话记录上</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['close', 'complete'])

const phoneBgImage = '/images/shoujikong.png' // 手机背景图

// 通话记录数据
const calls = ref([
  { id: 1, date: '2023年11月15日', status: '已接', matched: false, matchId: 1 },
  { id: 2, date: '2023年11月15日', status: '未接', matched: false, matchId: 2 },
  { id: 3, date: '2024年1月15日', status: '已接', matched: false, matchId: 3 },
  { id: 4, date: '2024年1月15日', status: '未接', matched: false, matchId: 4 }
])

// 草稿短信数据
const drafts = ref([
  { 
    id: 1, 
    text: '爸，我到上海了，别担心', 
    sent: false, 
    matchId: 1,
    matched: false
  },
  { 
    id: 2, 
    text: '闺女，爸在楼下，你忙就不上去了', 
    sent: false, 
    matchId: 4,
    matched: false
  },
  { 
    id: 3, 
    text: '爸，新年快乐，今年我值班', 
    sent: false, 
    matchId: 3,
    matched: false
  },
  { 
    id: 4, 
    text: '爸，我刚到，你到了吗', 
    sent: false, 
    matchId: 2,
    matched: false
  }
])

const activeTab = ref('calls')
const allMatched = ref(false)

let draggedItem = null

// 拖拽开始
const handleDragStart = (event, item) => {
  draggedItem = item
  event.dataTransfer.setData('text/plain', JSON.stringify(item))
  event.dataTransfer.effectAllowed = 'copy'
}

// 拖拽放置（在通话记录上）
const handleDrop = (event, call) => {
  event.preventDefault()
  if (!draggedItem) return
  
  // 检查是否匹配
  if (draggedItem.matchId === call.id && !call.matched && !draggedItem.sent) {
    // 匹配成功
    call.matched = true
    const draft = drafts.value.find(d => d.id === draggedItem.id)
    if (draft) {
      draft.sent = true
      draft.matched = true
    }
    
    // 检查是否全部完成
    checkAllMatched()
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const checkAllMatched = () => {
  const allCallsMatched = calls.value.every(call => call.matched)
  const allDraftsSent = drafts.value.every(draft => draft.sent)
  
  if (allCallsMatched && allDraftsSent) {
    allMatched.value = true
    setTimeout(() => {
      emit('complete')
    }, 1500)
  }
}

const close = () => {
  emit('close')
}

// 添加拖拽事件监听
import { onMounted } from 'vue'
onMounted(() => {
  const dropZones = document.querySelectorAll('.call-item')
  dropZones.forEach(zone => {
    zone.addEventListener('dragover', handleDragOver)
    zone.addEventListener('drop', (e) => {
      const callId = parseInt(e.currentTarget.dataset.id)
      const call = calls.value.find(c => c.id === callId)
      if (call) handleDrop(e, call)
    })
  })
})
</script>

<style scoped>
.phone-puzzle {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  animation: fadeIn 0.3s;
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

.phone-header h3 {
  margin: 0;
  font-family: 'Courier New', monospace;
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
  transition: all 0.3s;
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
  transition: all 0.3s;
}

.call-item:active {
  cursor: grabbing;
}

.call-item.matched {
  background: rgba(76, 175, 80, 0.9);
  opacity: 0.7;
}

.call-date {
  font-size: 12px;
  font-weight: bold;
}

.call-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.call-status.missed {
  background: #ff4444;
  color: white;
}

.call-status.answered {
  background: #4caf50;
  color: white;
}

.matched-badge {
  color: #4caf50;
  font-size: 12px;
}

.draft-item {
  background: rgba(255,255,255,0.9);
  margin: 10px 0;
  padding: 12px;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.3s;
}

.draft-item:active {
  cursor: grabbing;
}

.draft-item.sent {
  background: rgba(76, 175, 80, 0.9);
  opacity: 0.7;
}

.draft-text {
  margin: 0 0 8px 0;
  font-size: 12px;
  line-height: 1.4;
}

.sent-badge {
  color: #4caf50;
  font-size: 12px;
}

.phone-footer {
  padding: 15px;
  background: rgba(0,0,0,0.8);
  text-align: center;
}

.complete-message {
  color: #ffd700;
  font-family: 'Courier New', monospace;
  animation: pulse 1s;
}

.hint-message {
  color: #fff;
  font-size: 12px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>