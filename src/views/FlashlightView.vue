<template>
  <div class="flashlight">
    <div class="flashlight__container">
      <h1 class="flashlight__title">Фонарик камеры</h1>

      <div class="flashlight__status" :class="{ 'flashlight__status--active': isFlashlightOn }">
        <div class="flashlight__status-indicator"></div>
        <span class="flashlight__status-text">
          {{ isFlashlightOn ? 'Фонарик включен' : 'Фонарик выключен' }}
        </span>
      </div>

      <div class="flashlight__controls">
        <ButtonComp
          :mod="isFlashlightOn ? 'gradient-2' : 'gradient-1'"
          @click="toggleFlashlight"
          :disabled="!hasCameraSupport"
        >
          {{ isFlashlightOn ? 'Выключить фонарик' : 'Включить фонарик' }}
        </ButtonComp>

        <ButtonComp
          mod="gradient-4"
          @click="stopCamera"
          v-if="isStreamActive"
        >
          Остановить камеру
        </ButtonComp>
      </div>

      <div class="flashlight__video-container" v-if="isStreamActive">
        <video
          ref="videoElement"
          autoplay
          muted
          playsinline
          class="flashlight__video"
        ></video>
      </div>

      <div class="flashlight__info" v-if="!hasCameraSupport">
        <p>Ваше устройство не поддерживает функцию фонарика камеры</p>
      </div>

      <div class="flashlight__error" v-if="errorMessage">
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'

const isFlashlightOn = ref(false)
const hasCameraSupport = ref(false)
const isStreamActive = ref(false)
const errorMessage = ref('')
const videoElement = ref(null)
let stream = null
let track = null

const checkCameraSupport = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Ваш браузер не поддерживает доступ к камере')
    }

    // Проверяем поддержку фонарика
    const devices = await navigator.mediaDevices.enumerateDevices()
    hasCameraSupport.value = devices.some(device => device.kind === 'videoinput')

    if (!hasCameraSupport.value) {
      throw new Error('Камера не найдена на устройстве')
    }
  } catch (error) {
    errorMessage.value = error.message
    hasCameraSupport.value = false
  }
}

const startCamera = async () => {
  try {
    errorMessage.value = ''

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment'
      }
    })

    track = stream.getVideoTracks()[0]
    isStreamActive.value = true

    if (videoElement.value) {
      videoElement.value.srcObject = stream
    }

    console.log('Камера запущена')
  } catch (error) {
    console.error('Ошибка запуска камеры:', error)
    errorMessage.value = `Ошибка доступа к камере: ${error.message}`
    isStreamActive.value = false
  }
}

const toggleFlashlight = async () => {
  if (!isStreamActive.value) {
    await startCamera()
    if (!isStreamActive.value) return
  }

  try {
    if (isFlashlightOn.value) {
      // Выключаем фонарик
      await track.applyConstraints({
        advanced: [{ fillLightMode: 'off' }]
      })
      isFlashlightOn.value = false
      console.log('Фонарик выключен')
    } else {
      // Включаем фонарик
      await track.applyConstraints({
        advanced: [{ fillLightMode: 'flash' }]
      })
      isFlashlightOn.value = true
      console.log('Фонарик включен')
    }
  } catch (error) {
    console.error('Ошибка управления фонариком:', error)
    errorMessage.value = `Ошибка управления фонариком: ${error.message}`
  }
}

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
    track = null
    isStreamActive.value = false
    isFlashlightOn.value = false

    if (videoElement.value) {
      videoElement.value.srcObject = null
    }

    console.log('Камера остановлена')
  }
}

onMounted(() => {
  checkCameraSupport()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<style lang="scss">
.flashlight {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: $color-white;

  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    max-width: 600px;
    width: 100%;
  }

  &__title {
    font-size: 3.5rem;
    text-align: center;
    margin-bottom: 1rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 2rem;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;

    &--active {
      background-color: rgba(255, 215, 0, 0.2);
      border-color: rgba(255, 215, 0, 0.4);
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    }

    &-indicator {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background-color: #ff4757;
      transition: background-color 0.3s ease;
      box-shadow: 0 0 10px rgba(255, 71, 87, 0.5);
    }

    &--active &-indicator {
      background-color: #ffa502;
      box-shadow: 0 0 15px rgba(255, 165, 2, 0.7);
    }

    &-text {
      font-size: 1.8rem;
      font-weight: 500;
    }
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 300px;
  }

  &__video-container {
    width: 100%;
    max-width: 400px;
    border-radius: 2rem;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  &__video {
    width: 100%;
    height: auto;
    display: block;
    background-color: #000;
  }

  &__info,
  &__error {
    padding: 1.5rem;
    border-radius: 1rem;
    text-align: center;
    font-size: 1.6rem;
    max-width: 400px;
  }

  &__info {
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  &__error {
    background-color: rgba(255, 71, 87, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 71, 87, 0.4);
    color: #ffebee;
  }

  @media (max-width: 768px) {
    padding: 1rem;

    &__title {
      font-size: 2.5rem;
    }

    &__status-text {
      font-size: 1.5rem;
    }

    &__info,
    &__error {
      font-size: 1.4rem;
      padding: 1rem;
    }
  }
}
</style>
