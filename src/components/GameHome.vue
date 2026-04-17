<template>
  <div class="game-home" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="title-container">
      <h1 class="pixel-title">回 忆 之 旅</h1>
      <p class="pixel-subtitle">Memory Journey</p>
    </div>
    
    <div class="button-container">
      <button class="pixel-button" @click="startGame">
        <span>▶ 开始游戏</span>
      </button>
      <button class="pixel-button" @click="showInstructions">
        <span>ℹ 游戏说明</span>
      </button>
    </div>
    
    <!-- 游戏说明弹窗 -->
    <div v-if="showInstructionsModal" class="modal-overlay" @click.self="showInstructionsModal = false">
      <div class="instructions-modal pixel-border">
        <h2 class="pixel-title-small">游 戏 说 明</h2>
        <div class="instructions-content">
          <p>🎮 点击平安符、背包、手机进行游戏</p>
          <p>🔍 完成三个谜题，收集情感碎片</p>
          <p>💡 每个谜题都有线索提示</p>
          <p>📱 手机谜题需要拖拽短信到通话记录</p>
        </div>
        <button class="pixel-button-small" @click="showInstructionsModal = false">确 定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'  // 这行必须要有！

const emit = defineEmits(['start-game'])

const backgroundImage = '/images/shouye.png'
const showInstructionsModal = ref(false)

const startGame = () => {
  emit('start-game')
}

const showInstructions = () => {
  showInstructionsModal.value = true
}
</script>

<style scoped>
.game-home {
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Courier New', monospace;
}

.title-container {
  text-align: center;
  margin-bottom: 100px;
  animation: fadeInDown 1s ease;
}

.pixel-title {
  font-size: 64px;
  font-family: 'Courier New', monospace;
  color: #fff;
  text-shadow: 4px 4px 0 #000, 8px 8px 0 rgba(0,0,0,0.5);
  letter-spacing: 4px;
  margin-bottom: 20px;
}

.pixel-subtitle {
  font-size: 20px;
  color: #ffd700;
  text-shadow: 2px 2px 0 #000;
  letter-spacing: 2px;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeInUp 1s ease;
}

.pixel-button {
  background: #000;
  border: 3px solid #fff;
  padding: 15px 40px;
  font-size: 24px;
  font-family: 'Courier New', monospace;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.pixel-button:hover {
  background: #fff;
  color: #000;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255,255,255,0.5);
}

.pixel-button:active {
  transform: scale(0.95);
}

.modal-overlay {
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
  backdrop-filter: blur(5px);
}

.instructions-modal {
  background: #000;
  border: 4px solid #fff;
  padding: 40px;
  min-width: 500px;
  text-align: center;
  animation: fadeIn 0.3s;
}

.pixel-title-small {
  font-size: 32px;
  color: #ffd700;
  margin-bottom: 30px;
  text-shadow: 2px 2px 0 #000;
}

.instructions-content {
  text-align: left;
  margin-bottom: 30px;
}

.instructions-content p {
  color: #fff;
  font-size: 16px;
  margin: 15px 0;
  line-height: 1.5;
}

.pixel-button-small {
  background: #fff;
  border: 2px solid #000;
  padding: 10px 30px;
  font-size: 18px;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  transition: all 0.3s;
}

.pixel-button-small:hover {
  background: #000;
  color: #fff;
  border-color: #fff;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>