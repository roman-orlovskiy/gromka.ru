<template>
  <div class="show-view">
    <!-- Слой мерцания -->
    <div
      v-if="isStarted"
      class="show-view__flicker"
      :class="flickerLayerClasses"
      :style="flickerLayerStyle"
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
import showDemoData from '@/assets/data/show-demo.json'

const isStarted = ref(false)
const isInitializing = ref(false) // Флаг начальной инициализации
const mainStore = useMainStore()
const { isLightOn } = storeToRefs(mainStore)

// Реактивные переменные для цвета и яркости экрана
const screenColor = ref('ffffff')
const screenBrightness = ref(100)

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

// Логика для зацикленного проигрывания show-demo
const showDemoSequence = showDemoData['show-demo'] || []
const SHOW_DEMO_DEFAULT_DURATION = 1000
let showDemoTimeoutId = null
let showDemoFlickerIntervalId = null
let showDemoCurrentIndex = 0
const isShowDemoActive = ref(false)

// Используем composable для логирования
const {
  sendLogs,
  enableLogging,
  logMicrophonePermission,
  logAudioSettings,
  logFirstSoundSignal,
  logDeviceInfo,
  trackScreenModeChange,
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

// Computed для динамических стилей слоя мерцания (цвет и яркость)
const flickerLayerStyle = computed(() => {
  if (!isLightOn.value) {
    return {}
  }

  return {
    backgroundColor: `#${screenColor.value}`,
    filter: `brightness(${screenBrightness.value}%)`
  }
})

// Управление цветом экрана по скрипту
const handleColorChange = async (color) => {
  // color: 0 - черный, 1 - белый
  const isWhite = color === 1
  mainStore.isLightOn = isWhite
}

// Обработчик завершения последовательности - оставляем последний цвет последовательности
const handleSequenceComplete = () => {
  // Последний цвет последовательности уже применен, ничего не меняем
  // Готовы ждать нового сигнала включения
}

// Остановка show-demo последовательности
const stopShowDemo = () => {
  if (showDemoTimeoutId) {
    clearTimeout(showDemoTimeoutId)
    showDemoTimeoutId = null
  }
  if (showDemoFlickerIntervalId) {
    clearInterval(showDemoFlickerIntervalId)
    showDemoFlickerIntervalId = null
  }
  isShowDemoActive.value = false
  showDemoCurrentIndex = 0
}

// Обработка значения шага show-demo
const handleShowDemoStep = (step) => {
  if (step.status === 'flash') {
    // Мерцание
    if (showDemoFlickerIntervalId) {
      clearInterval(showDemoFlickerIntervalId)
    }
    showDemoFlickerIntervalId = setInterval(() => {
      const currentIsWhite = mainStore.isLightOn
      mainStore.isLightOn = !currentIsWhite

      if (!currentIsWhite) {
        // Применяем цвет и яркость при включении
        screenColor.value = step.color
        screenBrightness.value = step.brightness
      }
    }, 150)
    return
  }

  // Останавливаем мерцание если было
  if (showDemoFlickerIntervalId) {
    clearInterval(showDemoFlickerIntervalId)
    showDemoFlickerIntervalId = null
  }

  // Устанавливаем состояние экрана
  if (step.status === 'on') {
    mainStore.isLightOn = true
    screenColor.value = step.color
    screenBrightness.value = step.brightness
  } else if (step.status === 'off') {
    mainStore.isLightOn = false
  }
}

// Функция для перехода к следующему шагу
const playNextShowDemoStep = () => {
  if (!isShowDemoActive.value || !showDemoSequence.length) {
    return
  }

  // Переходим к следующему шагу
  showDemoCurrentIndex++

  // Если достигли конца последовательности, начинаем сначала
  if (showDemoCurrentIndex >= showDemoSequence.length) {
    showDemoCurrentIndex = 0
  }

  const currentStep = showDemoSequence[showDemoCurrentIndex]

  // Обрабатываем текущий шаг
  handleShowDemoStep(currentStep)

  // Запускаем таймаут для перехода к следующему шагу через duration текущего шага
  const duration = currentStep.duration ?? SHOW_DEMO_DEFAULT_DURATION
  showDemoTimeoutId = setTimeout(() => {
    playNextShowDemoStep()
  }, duration)
}

// Запуск зацикленного show-demo
const startShowDemo = () => {
  if (isShowDemoActive.value || !showDemoSequence.length) {
    return
  }

  isShowDemoActive.value = true
  showDemoCurrentIndex = 0

  // Обрабатываем первый шаг
  const firstStep = showDemoSequence[0]
  handleShowDemoStep(firstStep)

  // Запускаем таймаут для перехода к следующему шагу через duration первого шага
  const duration = firstStep.duration ?? SHOW_DEMO_DEFAULT_DURATION
  showDemoTimeoutId = setTimeout(() => {
    playNextShowDemoStep()
  }, duration)
}

// Обработчик аудиосигнала - управление последовательностью
const handleAudioSignal = (flag) => {
  // Игнорируем, если не начали или идет инициализация
  if (!isStarted.value || isInitializing.value) return

  if (flag === 1) {
    // Останавливаем show-demo если он активен
    if (isShowDemoActive.value) {
      stopShowDemo()
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
  // Логируем начальное состояние режима экрана
  trackScreenModeChange(true, screenColor.value, screenBrightness.value)

  // Снимаем флаг инициализации после установки начального состояния
  isInitializing.value = false

  // Запускаем зацикленное проигрывание show-demo
  startShowDemo()

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

  // Останавливаем show-demo
  stopShowDemo()

  // Деактивируем Wake Lock при размонтировании
  await releaseWakeLock()

  cleanup()
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
