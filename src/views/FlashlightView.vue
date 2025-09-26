<template>
  <div class="flashlight">
    <div class="flashlight__container">
      <h1 class="flashlight__title">Фонарик</h1>

      <div class="flashlight__status" :class="{ 'flashlight__status--active': isFlashlightOn }">
        <div class="flashlight__status-indicator"></div>
        <span class="flashlight__status-text">
          {{ isFlashlightOn ? 'Фонарик включен' : 'Фонарик выключен' }}
        </span>
      </div>

      <div class="flashlight__controls">
        <button
          class="flashlight__button"
          :class="{ 'flashlight__button--active': isFlashlightOn }"
          @click="toggleFlashlight"
          :disabled="!hasCameraSupport || isLoading"
        >
          {{ isLoading ? 'Загрузка...' : (isFlashlightOn ? 'Выключить' : 'Включить') }}
        </button>
      </div>

      <div class="flashlight__info" v-if="!hasCameraSupport">
        <p>Ваше устройство не поддерживает функцию фонарика</p>
      </div>

      <div class="flashlight__error" v-if="errorMessage">
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Скрытый видео-элемент для работы с камерой -->
      <video
        ref="videoEl"
        playsinline
        muted
        style="display: none;"
      ></video>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Реактивные переменные
const isFlashlightOn = ref(false)
const hasCameraSupport = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const videoEl = ref(null)

let stream = null
let track = null

// Проверка поддержки камеры
const checkCameraSupport = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Камера не поддерживается')
    }

    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')
    hasCameraSupport.value = videoDevices.length > 0

    if (!hasCameraSupport.value) {
      throw new Error('Камера не найдена')
    }
  } catch (error) {
    console.error('Ошибка проверки камеры:', error)
    errorMessage.value = 'Камера не поддерживается'
    hasCameraSupport.value = false
  }
}

// Запуск камеры
const startCamera = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }

    stream = await navigator.mediaDevices.getUserMedia(constraints)
    track = stream.getVideoTracks()[0]

    if (videoEl.value) {
      videoEl.value.srcObject = stream
      await videoEl.value.play()
    }

    // Небольшая задержка для инициализации
    await new Promise(resolve => setTimeout(resolve, 200))

  } catch (error) {
    console.error('Ошибка запуска камеры:', error)
    errorMessage.value = 'Ошибка запуска камеры'
    throw error
  } finally {
    isLoading.value = false
  }
}

// Остановка камеры
const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
    track = null
  }
  isFlashlightOn.value = false
}

// Управление фонариком
const setFlashlightState = async (turnOn) => {
  if (!track) return

  try {
    const capabilities = track.getCapabilities()
    let success = false

    // Пробуем torch
    if (capabilities.torch === true) {
      try {
        await track.applyConstraints({ torch: turnOn })
        success = true
      } catch (e) {
        console.warn('Torch не работает:', e.message)
      }
    }

    // Пробуем fillLightMode
    if (!success && capabilities.fillLightMode) {
      const mode = turnOn ? 'flash' : 'off'
      if (capabilities.fillLightMode.includes(mode)) {
        try {
          await track.applyConstraints({ fillLightMode: mode })
          success = true
        } catch (e) {
          console.warn('FillLightMode не работает:', e.message)
        }
      }
    }

    if (success) {
      isFlashlightOn.value = turnOn
      errorMessage.value = ''
    } else {
      throw new Error('Фонарик не поддерживается')
    }
  } catch (error) {
    console.error('Ошибка управления фонариком:', error)
    errorMessage.value = error.message
  }
}

// Переключение фонарика
const toggleFlashlight = async () => {
  try {
    if (!isFlashlightOn.value) {
      // Включаем
      if (!stream) {
        await startCamera()
      }
      await setFlashlightState(true)
    } else {
      // Выключаем
      await setFlashlightState(false)
      stopCamera()
    }
  } catch (error) {
    console.error('Ошибка переключения фонарика:', error)
    errorMessage.value = 'Ошибка переключения фонарика'
  }
}

// Инициализация
onMounted(() => {
  checkCameraSupport()
})

// Очистка
onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.flashlight {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 20px;
}

.flashlight__container {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.flashlight__title {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: 300;
}

.flashlight__status {
  margin-bottom: 3rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.flashlight__status--active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.flashlight__status-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #666;
  margin: 0 auto 0.5rem;
  transition: all 0.3s ease;
}

.flashlight__status--active .flashlight__status-indicator {
  background: #ffeb3b;
  box-shadow: 0 0 20px #ffeb3b;
}

.flashlight__status-text {
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
}

.flashlight__controls {
  margin-bottom: 2rem;
}

.flashlight__button {
  width: 200px;
  height: 60px;
  border: none;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.flashlight__button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.flashlight__button--active {
  background: linear-gradient(45deg, #ff6b6b 0%, #ee5a24 100%);
}

.flashlight__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.flashlight__info,
.flashlight__error {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.flashlight__info {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.4);
  color: #ffc107;
}

.flashlight__error {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
  color: #f44336;
}

.flashlight__info p,
.flashlight__error p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
