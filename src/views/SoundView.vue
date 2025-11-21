<template>
  <div class="sound-view">
    <!-- Слой мерцания -->
    <div
      v-if="isStarted"
      class="sound-view__flicker"
      :class="flickerLayerClasses"
    />

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
        @click="copyDeviceId"
      >
        <div class="sound-square__label">Gromka</div>
        <div
          v-if="displayDeviceId"
          class="sound-square__device-id"
        >
          {{ displayDeviceId }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import ButtonComp from '@/components/ButtonComp.vue'
import { useAudio } from '@/composables/useAudio'
import { useCamera } from '@/composables/useCamera'
import { useWakeLock } from '@/composables/useWakeLock'
import { useLogging } from '@/composables/useLogging'
import { usePerformanceSequence } from '@/composables/usePerformanceSequence'
import { useMainStore } from '@/stores/main'

const isStarted = ref(false)
const isSquareBursting = ref(false)
const isInitializing = ref(false) // Флаг начальной инициализации
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

// Используем composable для последовательности перформанса
const { startSequence, stopSequence, isActive } = usePerformanceSequence('sound-demo')

// Используем composable для логирования
const {
  deviceId,
  sendLogs,
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


// Computed для классов слоя мерцания
const flickerLayerClasses = computed(() => {
  if (isLightOn.value === null) {
    return {}
  }
  return {
    'sound-view__flicker--white': isLightOn.value,
    'sound-view__flicker--black': !isLightOn.value
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

const displayDeviceId = computed(() => {
  if (!deviceId.value) return null
  return deviceId.value.replace(/^device_/, '')
})

const copyDeviceId = async () => {
  if (!deviceId.value) return

  try {
    await navigator.clipboard.writeText(deviceId.value)
    console.log('[SoundView] Device ID скопирован:', deviceId.value)
  } catch (error) {
    console.error('[SoundView] Ошибка копирования Device ID:', error)
  }
}

// Управление цветом экрана и фонариком по скрипту
const handleColorChange = async (color) => {
  // color: 0 - черный, 1 - белый
  const isWhite = color === 1
  mainStore.isLightOn = isWhite

  // Логируем изменение звука
  trackSoundChange(isWhite)

  // Анимация квадрата
  if (squareBurstTimeout) {
    clearTimeout(squareBurstTimeout)
  }
  isSquareBursting.value = true
  squareBurstTimeout = setTimeout(() => {
    isSquareBursting.value = false
    squareBurstTimeout = null
  }, 150)

  // Если фонарик не поддерживается, просто выходим без управления им
  if (isFlashlightSupported.value === false) {
    return
  }

  // Управление фонариком
  try {
    if (isWhite) {
      await turnOnFlashlight(trackFlashlightChange)
    } else {
      await turnOffFlashlight(trackFlashlightChange)
    }
  } catch (error) {
    console.warn('Ошибка управления фонариком:', error)
    logFlashlightSupport(false, cameraMethod.value, error)
  }
}

// Обработчик завершения последовательности - оставляем последний цвет последовательности
const handleSequenceComplete = () => {
  // Последний цвет последовательности уже применен, ничего не меняем
  // Готовы ждать нового сигнала включения
}

// Обработчик аудиосигнала - управление последовательностью
const handleAudioSignal = (flag) => {
  // Игнорируем, если не начали или идет инициализация
  if (!isStarted.value || isInitializing.value) return

  if (flag === 1) {
    // Если последовательность уже запущена, повторный запуск не нужен
    if (isActive.value) return
    startSequence(handleColorChange, handleSequenceComplete)
    return
  }

  if (flag === 0) {
    stopSequence()
    handleColorChange(0)
  }
}


// Обработчик нажатия кнопки "Начать"
const handleStart = async () => {
  isStarted.value = true

  // Включаем логирование
  enableLogging()

  // Активируем Wake Lock для предотвращения засыпания экрана
  await requestWakeLock()

  // Устанавливаем начальное состояние - белый экран и включенный фонарик
  // Используем флаг, чтобы не запустить последовательность при начальной установке
  isInitializing.value = true
  mainStore.isLightOn = true

  // Включаем фонарик и проверяем поддержку
  let hasFlashlight = false

  try {
    // Передаем callback для логирования включения фонарика
    hasFlashlight = await checkFlashlightSupport(trackFlashlightChange)
    if (hasFlashlight) {
      logFlashlightSupport(true, cameraMethod.value)
    } else {
      logFlashlightSupport(false, null)
    }
  } catch (error) {
    logFlashlightSupport(false, null, error)
  }

  // Снимаем флаг инициализации после установки начального состояния
  isInitializing.value = false

  // Логируем информацию о камерах
  logCameraInfo(devices.value, cameraMethod.value)

  // Создаем объект с функциями логирования для передачи в useAudio
  const loggingCallbacks = {
    logMicrophonePermission,
    logAudioSettings,
    logFirstSoundSignal
  }

  await requestMicrophonePermission(loggingCallbacks, handleAudioSignal)

  setTimeout(() => {
    sendLogs()
  }, 3000)
}

onMounted(() => {
  enableLogging()
  logDeviceInfo()
})

onUnmounted(async () => {
  // Останавливаем последовательность
  stopSequence()

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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.sound-view__flicker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  pointer-events: none;

  &--white {
    background: $color-white;
  }

  &--black {
    background: $color-black;
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
  z-index: 1002;
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
  top: -26rem;
  position: relative;
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
  z-index: 1200;
}

.sound-square {
  width: min(40vw, 240px);
  aspect-ratio: 1 / 1;
  border-radius: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: $color-black;
  transition: transform 0.2s ease-in-out;
  transform: scale(1);
  color: $color-white;
  pointer-events: auto;

  &--dark {
    background: $color-black;
  }

  &--light {
    background: $color-white;
  }

  &--burst {
    transform: scale(1.2);
    background: $color-pink-stylish;
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

.sound-square__device-id {
  font-size: 2rem;
  font-weight: 400;
  margin-top: 0.8rem;
  opacity: 0.7;
  cursor: pointer;
  user-select: none;
  pointer-events: auto;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
}

.sound-square--dark .sound-square__device-id {
  color: $color-white;
}

.sound-square--light .sound-square__device-id {
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
