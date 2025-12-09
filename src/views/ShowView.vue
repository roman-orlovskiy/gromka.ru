<template>
  <div class="show-view">
    <!-- Слой мерцания -->
    <div
      v-if="isStarted"
      class="show-view__flicker"
      :class="flickerLayerClasses"
    />

    <!-- Кнопка запуска -->
    <div v-if="!isStarted" class="show-view__start">
      <div class="show-view__content">
        <div class="show-view__title">Зажигайте экраны</div>

        <div class="show-view__instructions">
          <div class="show-view__instruction-item">
            <div class="show-view__instruction-text">
              1. Включите &nbsp;<span class="show-view__instruction-highlight">✧ яркость экрана на максимум ✧</span>
            </div>
          </div>

          <div class="show-view__instruction-item">
            <div class="show-view__instruction-text">
              2. Нажмите "Начать"
            </div>
          </div>
        </div>

        <div class="show-view__button">
          <ButtonComp mod="red" @click="handleStart">Начать</ButtonComp>
        </div>

        <div class="show-view__qr">
          <div class="show-view__qr-caption">
            Поделитесь QR с тем,<br>кто не успел отсканировать
          </div>
          <img
            src="/images/show-qr.webp"
            alt="QR-код для перформанса"
            class="show-view__qr-image"
          >
        </div>
      </div>
    </div>

    <!-- Анимация перформанса -->
    <div
      v-if="isStarted"
      class="show-view__performance"
    >
      <div
        class="show-square"
        :class="showSquareClass"
        @click="copyDeviceId"
      >
        <div class="show-square__label">Gromka</div>
        <div
          v-if="displayDeviceId"
          class="show-square__device-id"
        >
          {{ displayDeviceId }}
        </div>
      </div>
    </div>

    <!-- Визуализация частот -->
    <div
      v-if="isStarted && isListening"
      class="show-view__spectrum"
    >
      <FrequencySpectrum
        :frequency-data="frequencyData"
        :frequency-range="frequencyRange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import ButtonComp from '@/components/ButtonComp.vue'
import FrequencySpectrum from '@/components/FrequencySpectrum.vue'
import { useAudio } from '@/composables/useAudio'
import { useWakeLock } from '@/composables/useWakeLock'
import { useLogging } from '@/composables/useLogging'
import { usePerformanceSequence } from '@/composables/usePerformanceSequence'
import { useMainStore } from '@/stores/main'
import staticDemoData from '@/assets/data/static-demo.json'

const isStarted = ref(false)
const isSquareBursting = ref(false)
const isInitializing = ref(false) // Флаг начальной инициализации
let squareBurstTimeout = null
const mainStore = useMainStore()
const { isLightOn } = storeToRefs(mainStore)

// Используем composable для аудио
const {
  requestMicrophonePermission,
  cleanup,
  isListening,
  frequencyData,
  frequencyRange
} = useAudio()

// Используем composable для предотвращения засыпания экрана
const {
  requestWakeLock,
  releaseWakeLock
} = useWakeLock()

// Используем composable для последовательности перформанса
const { startSequence, stopSequence, isActive } = usePerformanceSequence('sound-demo')

// Логика для зацикленного проигрывания static-demo
const staticDemoSequence = staticDemoData['static-demo'] || []
let staticDemoIntervalId = null
let staticDemoFlickerIntervalId = null
let staticDemoCurrentIndex = 0
const isStaticDemoActive = ref(false)

// Используем composable для логирования
const {
  deviceId,
  sendLogs,
  enableLogging,
  logMicrophonePermission,
  logAudioSettings,
  logFirstSoundSignal,
  logDeviceInfo,
  logs
} = useLogging()


// Computed для классов слоя мерцания
const flickerLayerClasses = computed(() => {
  if (isLightOn.value === null) {
    return {}
  }
  return {
    'show-view__flicker--white': isLightOn.value,
    'show-view__flicker--black': !isLightOn.value
  }
})

const showSquareClass = computed(() => {
  if (isLightOn.value === null) {
    return {}
  }

  return {
    'show-square--dark': isLightOn.value,
    'show-square--light': !isLightOn.value,
    'show-square--burst': isSquareBursting.value
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
    console.log('[ShowView] Device ID скопирован:', deviceId.value)
  } catch (error) {
    console.error('[ShowView] Ошибка копирования Device ID:', error)
  }
}

// Управление цветом экрана по скрипту
const handleColorChange = async (color) => {
  // color: 0 - черный, 1 - белый
  const isWhite = color === 1
  mainStore.isLightOn = isWhite

  // Анимация квадрата
  if (squareBurstTimeout) {
    clearTimeout(squareBurstTimeout)
  }
  isSquareBursting.value = true
  squareBurstTimeout = setTimeout(() => {
    isSquareBursting.value = false
    squareBurstTimeout = null
  }, 150)
}

// Обработчик завершения последовательности - оставляем последний цвет последовательности
const handleSequenceComplete = () => {
  // Последний цвет последовательности уже применен, ничего не меняем
  // Готовы ждать нового сигнала включения
}

// Остановка static-demo последовательности
const stopStaticDemo = () => {
  if (staticDemoIntervalId) {
    clearInterval(staticDemoIntervalId)
    staticDemoIntervalId = null
  }
  if (staticDemoFlickerIntervalId) {
    clearInterval(staticDemoFlickerIntervalId)
    staticDemoFlickerIntervalId = null
  }
  isStaticDemoActive.value = false
  staticDemoCurrentIndex = 0
}

// Обработка значения шага static-demo
const handleStaticDemoStepValue = (value) => {
  if (value === -1) {
    // Мерцание
    if (staticDemoFlickerIntervalId) {
      clearInterval(staticDemoFlickerIntervalId)
    }
    staticDemoFlickerIntervalId = setInterval(() => {
      const currentIsWhite = mainStore.isLightOn
      handleColorChange(currentIsWhite ? 0 : 1)
    }, 150)
    return
  }

  // Останавливаем мерцание если было
  if (staticDemoFlickerIntervalId) {
    clearInterval(staticDemoFlickerIntervalId)
    staticDemoFlickerIntervalId = null
  }

  // Устанавливаем цвет
  handleColorChange(value)
}

// Запуск зацикленного static-demo
const startStaticDemo = () => {
  if (isStaticDemoActive.value || !staticDemoSequence.length) {
    return
  }

  isStaticDemoActive.value = true
  staticDemoCurrentIndex = 0

  // Обрабатываем первый шаг
  handleStaticDemoStepValue(staticDemoSequence[0])

  // Запускаем интервал для зацикленного проигрывания
  staticDemoIntervalId = setInterval(() => {
    staticDemoCurrentIndex++

    // Если достигли конца последовательности, начинаем сначала
    if (staticDemoCurrentIndex >= staticDemoSequence.length) {
      staticDemoCurrentIndex = 0
    }

    handleStaticDemoStepValue(staticDemoSequence[staticDemoCurrentIndex])
  }, 2000) // Тот же таймаут, что и в usePerformanceSequence
}

// Обработчик аудиосигнала - управление последовательностью
const handleAudioSignal = (flag) => {
  // Игнорируем, если не начали или идет инициализация
  if (!isStarted.value || isInitializing.value) return

  if (flag === 1) {
    // Останавливаем static-demo если он активен
    if (isStaticDemoActive.value) {
      stopStaticDemo()
    }

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

  // Устанавливаем начальное состояние - белый экран
  // Используем флаг, чтобы не запустить последовательность при начальной установке
  isInitializing.value = true
  mainStore.isLightOn = true

  // Снимаем флаг инициализации после установки начального состояния
  isInitializing.value = false

  // Запускаем зацикленное проигрывание static-demo
  startStaticDemo()

  // Создаем объект с функциями логирования для передачи в useAudio
  const loggingCallbacks = {
    logMicrophonePermission,
    logAudioSettings,
    logFirstSoundSignal
  }

  // Запрашиваем доступ к микрофону
  await requestMicrophonePermission(loggingCallbacks, handleAudioSignal)

  // Отправляем логи инициализации через 3 секунды как fallback
  setTimeout(() => {
    if (logs.value.length > 0) {
      sendLogs()
    }
  }, 3000)
}

onMounted(async () => {
  // Включаем логирование ПЕРВЫМ делом
  enableLogging()

  // Логируем информацию об устройстве
  await logDeviceInfo()
})

onUnmounted(async () => {
  // Останавливаем последовательность
  stopSequence()

  // Останавливаем static-demo
  stopStaticDemo()

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

.show-view {
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

.show-view__flicker {
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

.show-view__start {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.show-view__content {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
}

.show-view__title {
  font-size: 3.6rem;
  font-weight: 700;
  color: $color-show-red;
  margin-bottom: 3rem;
  line-height: 1.2;
}

.show-view__instructions {
  margin-bottom: 3rem;
}

.show-view__instruction-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  text-align: left;
}

.show-view__instruction-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: $color-black;
  flex-shrink: 0;
}

.show-view__instruction-text {
  font-size: 1.6rem;
  color: $color-gray-700;
  line-height: 1.4;
  padding-top: 0;
}

.show-view__instruction-highlight {
  display: inline-block;
  animation: brightness-pulse 2s ease-in-out infinite;
}

.show-view__button {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.show-view__qr {
  margin-top: 5rem;
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.show-view__qr-image {
  width: 25rem;
  max-width: 60vw;
  border-radius: 1.2rem;
  box-shadow: 0 1.2rem 3rem rgba($color-black, 0.1);
}

.show-view__qr-caption {
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  color: $color-gray-600;
  text-align: center;
  line-height: 1.4;
}

@keyframes brightness-pulse {
  0%, 100% {
    transform: scale(1);
    color: $color-black;
  }
  50% {
    transform: scale(1.1);
    color: $color-show-red;
  }
}

.show-view__performance {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1200;
}

.show-view__spectrum {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(90vw, 60rem);
  height: 12rem;
  z-index: 1300;
  pointer-events: none;
}

.show-square {
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

.show-square__label {
  font-size: clamp(2rem, 6vw, 2.6rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2rem;
}

.show-square--dark .show-square__label {
  color: $color-white;
}

.show-square--light .show-square__label {
  color: $color-black;
}

.show-square__device-id {
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

.show-square--dark .show-square__device-id {
  color: $color-white;
}

.show-square--light .show-square__device-id {
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
  .show-view__content {
    padding: 1rem;
    max-width: 100%;
  }

  .show-view__title {
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }

  .show-view__instruction-text {
    font-size: 1.4rem;
  }

  .show-view__instruction-number {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.3rem;
  }

  .show-view__spectrum {
    width: min(95vw, 50rem);
    height: 10rem;
    bottom: 1rem;
  }
}
</style>
