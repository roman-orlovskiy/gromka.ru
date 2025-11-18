<template>
  <div class="sound-view" :class="soundViewClasses">
    <!-- Кнопка запуска -->
    <div v-if="!isStarted" class="sound-view__start">
      <div class="sound-view__content">
        <div class="sound-view__title">Gromka перформанс</div>

        <div class="sound-view__instructions">
          <div class="sound-view__instruction-item">
            <div class="sound-view__instruction-text">
              1. Поделитесь QR-кодом с коллегами
            </div>
          </div>

          <div class="sound-view__instruction-item">
            <div class="sound-view__instruction-text">
              2. Нажмите "Начать"
            </div>
          </div>
        </div>

        <div class="sound-view__qr">
          <img
            src="/images/sound-qr.webp"
            alt="QR-код для перформанса"
            class="sound-view__qr-image"
          >
        </div>

        <div class="sound-view__button">
          <ButtonComp mod="outline" @click="handleStart">Начать</ButtonComp>
        </div>
      </div>
    </div>

    <!-- Сообщение о неподдерживаемом фонарике -->
    <div v-if="isStarted && isFlashlightSupported === false" class="sound-view__flashlight-message">
      <div class="flashlight-message">
        <div class="flashlight-message__subtitle">Фонарик не поддерживается<br>Поверните экран к сцене</div>
      </div>
    </div>

    <!-- Анимация перформанса -->
    <div
      v-if="isStarted"
      class="sound-view__performance"
    >
      <div
        class="sound-square"
        :class="soundSquareClass"
      >
        <div class="sound-square__label">Gromka</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ButtonComp from '@/components/ButtonComp.vue'
import { useAudio } from '@/composables/useAudio'
import { useCamera } from '@/composables/useCamera'
import { useWakeLock } from '@/composables/useWakeLock'
import { useLogging } from '@/composables/useLogging'
import { useMainStore } from '@/stores/main'

const isStarted = ref(false)
const isSquareBursting = ref(false)
let squareBurstTimeout = null
const mainStore = useMainStore()
const { isLightOn } = storeToRefs(mainStore)

// Используем composable для аудио
const {
  requestMicrophonePermission,
  cleanup
} = useAudio()

// Используем composable для камеры/фонарика
const {
  cameraMethod,
  isFlashlightSupported,
  devices,
  turnOnFlashlight,
  turnOffFlashlight,
  checkFlashlightSupport
} = useCamera()

// Используем composable для предотвращения засыпания экрана
const {
  requestWakeLock,
  releaseWakeLock
} = useWakeLock()

// Используем composable для логирования
const {
  enableLogging,
  trackSoundChange,
  trackFlashlightChange,
  logCameraInfo,
  logMicrophonePermission,
  logAudioSettings,
  logFirstSoundSignal,
  logFlashlightSupport,
  logDeviceInfo
} = useLogging()


// Computed для классов звукового вида
const soundViewClasses = computed(() => {
  if (isLightOn.value === null) {
    return {
    }
  }
  return {
    'sound-view--white': isLightOn.value,
    'sound-view--black': !isLightOn.value
  }
})

const soundSquareClass = computed(() => {
  if (isLightOn.value === null) {
    return {}
  }

  return {
    'sound-square--dark': isLightOn.value,
    'sound-square--light': !isLightOn.value,
    'sound-square--burst': isSquareBursting.value
  }
})

// Управление фонариком на основе isLightOn
watch(isLightOn, async (newValue) => {
  if (newValue === null) return

  // Логируем изменение звука
  trackSoundChange(newValue)

  if (squareBurstTimeout) {
    clearTimeout(squareBurstTimeout)
  }

  isSquareBursting.value = true
  squareBurstTimeout = setTimeout(() => {
    isSquareBursting.value = false
    squareBurstTimeout = null
  }, 400)

  // Если фонарик не поддерживается, не пытаемся его включать
  if (isFlashlightSupported.value === false) return

  try {
    if (newValue) {
      // Включаем фонарик при белом свете
      await turnOnFlashlight()
      trackFlashlightChange(true, cameraMethod.value)
    } else {
      // Выключаем фонарик при черном свете
      await turnOffFlashlight()
      trackFlashlightChange(false, cameraMethod.value)
    }
  } catch (error) {
    console.warn('Ошибка управления фонариком:', error)
    // Логируем ошибку включения/выключения фонарика
    logFlashlightSupport(false, cameraMethod.value, error)
  }
}, { immediate: false })


// Обработчик нажатия кнопки "Начать"
const handleStart = async () => {
  isStarted.value = true

  // Включаем логирование
  enableLogging()

  // Логируем информацию об устройстве
  logDeviceInfo()

  // Активируем Wake Lock для предотвращения засыпания экрана
  await requestWakeLock()

  // Включаем фонарик и проверяем поддержку
  let hasFlashlight = false

  try {
    hasFlashlight = await checkFlashlightSupport()
    if (hasFlashlight) {
      logFlashlightSupport(true, cameraMethod.value)
    } else {
      logFlashlightSupport(false, null)
    }
  } catch (error) {
    logFlashlightSupport(false, null, error)
  }

  // Логируем информацию о камерах
  logCameraInfo(devices.value, cameraMethod.value)

  // Создаем объект с функциями логирования для передачи в useAudio
  const loggingCallbacks = {
    logMicrophonePermission,
    logAudioSettings,
    logFirstSoundSignal
  }

  await requestMicrophonePermission(loggingCallbacks)
}

onMounted(() => {
  // Не запускаем автоматически, ждем нажатия кнопки
})

onUnmounted(async () => {
  // Выключаем фонарик при размонтировании
  try {
    await turnOffFlashlight()
  } catch (error) {
    console.warn('Ошибка выключения фонарика при размонтировании:', error)
  }

  // Деактивируем Wake Lock при размонтировании
  await releaseWakeLock()

  cleanup()

  if (squareBurstTimeout) {
    clearTimeout(squareBurstTimeout)
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

.sound-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: $color-white;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  &--white {
    background: $color-white !important;
  }

  &--black {
    background: $color-black !important;
  }
}

.sound-view__start {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.sound-view__content {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
}

.sound-view__title {
  font-size: 3.6rem;
  font-weight: 700;
  color: $color-gray-700;
  margin-bottom: 3rem;
  line-height: 1.2;
}

.sound-view__instructions {
  margin-bottom: 3rem;
}

.sound-view__instruction-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  text-align: left;
}

.sound-view__instruction-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: $color-black;
  flex-shrink: 0;
}

.sound-view__instruction-text {
  font-size: 1.6rem;
  color: $color-gray-700;
  line-height: 1.4;
  padding-top: 0;
}

.sound-view__button {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.sound-view__qr {
  margin-bottom: 3rem;
  display: flex;
  justify-content: center;
}

.sound-view__qr-image {
  width: 25rem;
  max-width: 60vw;
  border-radius: 1.2rem;
  box-shadow: 0 1.2rem 3rem rgba($color-black, 0.1);
}

.sound-view__flashlight-message {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.flashlight-message {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
}

.flashlight-message__icon {
  font-size: 8rem;
  margin-bottom: 2rem;
  animation: pulse 2s infinite;
}

.flashlight-message__title {
  font-size: 2.6rem;
  font-weight: 700;
  color: $color-gray-700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.flashlight-message__subtitle {
  font-size: 3rem;
  color: $color-gray-600;
  line-height: 1.4;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.sound-view__performance {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.sound-square {
  width: min(40vw, 240px);
  aspect-ratio: 1 / 1;
  border-radius: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: square-pulse 1.4s ease-in-out infinite;
  background: rgba($color-black, 0.85);
  color: $color-white;

  &--dark {
    background: rgba($color-black, 0.85);
  }

  &--light {
    background: rgba($color-white, 0.9);
    box-shadow: inset 0 0 15px rgba($color-black, 0.2);
  }

  &--burst {
    animation: square-burst 0.4s linear;
    background: rgba($color-pink-stylish, 0.85);
  }
}

.sound-square__label {
  font-size: clamp(2rem, 6vw, 2.6rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2rem;
}

.sound-square--dark .sound-square__label {
  color: $color-white;
}

.sound-square--light .sound-square__label {
  color: $color-black;
}

@keyframes square-pulse {
  0% {
    transform: scale(0.9);
  }

  85% {
    transform: scale(1);
  }

  100% {
    transform: scale(0.9);
  }
}

@keyframes square-burst {
  0% {
    transform: scale(1);
  }

  60% {
    transform: scale(1.65);
  }

  100% {
    transform: scale(1);
  }
}

// Адаптивность для мобильных устройств
@include layout-mobile {
  .sound-view__content {
    padding: 1rem;
    max-width: 100%;
  }

  .sound-view__title {
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }

  .sound-view__instruction-text {
    font-size: 1.4rem;
  }

  .sound-view__instruction-number {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.3rem;
  }

  .flashlight-message {
    padding: 1rem;
    max-width: 100%;
  }

  .flashlight-message__icon {
    font-size: 6rem;
    margin-bottom: 1.5rem;
  }

  .flashlight-message__title {
    font-size: 2.5rem;
    margin-bottom: 0.8rem;
  }

  .flashlight-message__subtitle {
    font-size: 1.4rem;
    position: relative;
    top: -12rem;
  }
}
</style>
