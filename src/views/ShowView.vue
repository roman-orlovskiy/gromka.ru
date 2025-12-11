<template>
  <div class="show-view">
    <!-- Слой мерцания -->
    <div
      v-if="isStarted"
      class="show-view__flicker"
      :class="flickerLayerClasses"
      :style="flickerLayerStyle"
    />

    <Transition name="heart-fade">
      <HeartOverlay
        v-if="showHeartOverlay"
        :message-html="heartMessage"
      />
    </Transition>

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

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import ButtonComp from '@/components/ButtonComp.vue'
import HeartOverlay from '@/components/HeartOverlay.vue'
import { useAudio } from '@/composables/useAudio'
import { useWakeLock } from '@/composables/useWakeLock'
import { useFullscreen } from '@/composables/useFullscreen'
import { useLogging } from '@/composables/useLogging'
import { usePerformanceSequence } from '@/composables/usePerformanceSequence'
import { useMainStore } from '@/stores/main'
import showDemoData from '@/assets/data/show-demo.json'
import showPart1Data from '@/assets/data/show-part-1.json'
import showPart2Data from '@/assets/data/show-part-2.json'

const isStarted = ref(false)
const isInitializing = ref(false) // Флаг начальной инициализации
const mainStore = useMainStore()
const { isLightOn } = storeToRefs(mainStore)

// Реактивные переменные для цвета и яркости экрана
const screenColor = ref('ffffff')
const screenBrightness = ref(100)
const showHeartOverlay = ref(false)
const hasMicrophoneAccess = ref(false)
const showScreenRotationMessage = ref(false)

// Computed для сообщения в сердце
const heartMessage = computed(() => {
  if (!hasMicrophoneAccess.value) {
    return 'Разрешите<br>микрофон<br>для синхронизации'
  }
  if (showScreenRotationMessage.value) {
    return 'Разверните<br>экран<br>ко льду'
  }
  return 'Яркость<br>экрана<br>на максимум'
})

// Используем composable для аудио
const {
  requestMicrophonePermission,
  cleanup
} = useAudio()

// Используем composable для предотвращения засыпания экрана
const {
  requestWakeLock,
  releaseWakeLock
} = useWakeLock()

// Используем composable для полноэкранного режима
const {
  enterFullscreen,
  exitFullscreen
} = useFullscreen()

// Используем composable для последовательности перформанса
const { stopSequence } = usePerformanceSequence('show-demo')

// Универсальная система для работы с последовательностями
const SHOW_DEFAULT_DURATION = 1000
const showDemoSequence = showDemoData['show-demo'] || []
const showPart1Sequence = showPart1Data['show-part-1'] || []
const showPart2Sequence = showPart2Data['show-part-2'] || []

// Состояние текущей активной последовательности
const currentSequenceState = ref({
  sequence: null,
  currentIndex: 0,
  timeoutId: null,
  flickerIntervalId: null,
  isActive: false
})

const signalCount = ref(0)

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


// Универсальная остановка последовательности
const stopShowSequence = () => {
  const state = currentSequenceState.value
  if (state.timeoutId) {
    clearTimeout(state.timeoutId)
    state.timeoutId = null
  }
  if (state.flickerIntervalId) {
    clearInterval(state.flickerIntervalId)
    state.flickerIntervalId = null
  }
  state.isActive = false
  state.currentIndex = 0
  state.sequence = null
}

// Универсальная обработка шага последовательности
const handleStep = (step) => {
  const state = currentSequenceState.value

  if (step.status === 'flash') {
    // Мерцание
    if (state.flickerIntervalId) {
      clearInterval(state.flickerIntervalId)
    }
    const flashInterval = step.flashInterval ?? 150
    state.flickerIntervalId = setInterval(() => {
      const currentIsWhite = mainStore.isLightOn
      mainStore.isLightOn = !currentIsWhite

      if (!currentIsWhite) {
        // Проверяем random при мерцании
        if (step.random !== undefined) {
          const randomValue = Math.random() * 100

          if (randomValue <= step.random) {
            // Применяем цвет и яркость при включении
            screenColor.value = step.color
            screenBrightness.value = step.brightness
            mainStore.isLightOn = true
          } else {
            // Остаемся черными
            mainStore.isLightOn = false
          }
        } else {
          // Применяем цвет и яркость при включении (без random)
          screenColor.value = step.color
          screenBrightness.value = step.brightness
        }
      }
    }, flashInterval)
    return
  }

  // Останавливаем мерцание если было
  if (state.flickerIntervalId) {
    clearInterval(state.flickerIntervalId)
    state.flickerIntervalId = null
  }

  // Устанавливаем состояние экрана
  if (step.status === 'on') {
    // Проверяем наличие параметра random
    if (step.random !== undefined) {
      // Генерируем случайное число от 0 до 100
      const randomValue = Math.random() * 100

      // Если попали в диапазон от 0 до random, загораемся цветом
      if (randomValue <= step.random) {
        mainStore.isLightOn = true
        screenColor.value = step.color
        screenBrightness.value = step.brightness
      } else {
        // Иначе выключаем (черный экран)
        mainStore.isLightOn = false
      }
    } else {
      // Если random нет, работаем как обычно
      mainStore.isLightOn = true
      screenColor.value = step.color
      screenBrightness.value = step.brightness
    }
  } else if (step.status === 'off') {
    mainStore.isLightOn = false
  }
}

// Универсальная функция для перехода к следующему шагу
const playNextStep = () => {
  const state = currentSequenceState.value

  if (!state.isActive || !state.sequence || !state.sequence.length) {
    return
  }

  // Переходим к следующему шагу
  state.currentIndex++

  // Если достигли конца последовательности, начинаем сначала
  if (state.currentIndex >= state.sequence.length) {
    state.currentIndex = 0
  }

  const currentStep = state.sequence[state.currentIndex]

  // Обрабатываем текущий шаг
  handleStep(currentStep)

  // Запускаем таймаут для перехода к следующему шагу через duration текущего шага
  const duration = currentStep.duration ?? SHOW_DEFAULT_DURATION
  state.timeoutId = setTimeout(() => {
    playNextStep()
  }, duration)
}

// Универсальная функция запуска последовательности
const startShowSequence = (sequence) => {
  if (!sequence || !sequence.length) {
    return
  }

  // Останавливаем текущую последовательность если активна
  if (currentSequenceState.value.isActive) {
    stopShowSequence()
  }

  const state = currentSequenceState.value
  state.sequence = sequence
  state.isActive = true
  state.currentIndex = 0

  // Обрабатываем первый шаг
  const firstStep = sequence[0]
  handleStep(firstStep)

  // Запускаем таймаут для перехода к следующему шагу через duration первого шага
  const duration = firstStep.duration ?? SHOW_DEFAULT_DURATION
  state.timeoutId = setTimeout(() => {
    playNextStep()
  }, duration)
}

// Обработчик аудиосигнала - управление последовательностью
const handleAudioSignal = async (flag) => {
  // Игнорируем, если не начали или идет инициализация
  if (!isStarted.value || isInitializing.value) return

  if (flag === 1) {
    // Останавливаем текущую последовательность если активна
    if (currentSequenceState.value.isActive) {
      stopShowSequence()
    }

    // При первом сигнале запускаем show-part-1 зацикленно
    if (signalCount.value === 0) {
      signalCount.value = 1
      startShowSequence(showPart1Sequence)
      return
    }

    // При втором сигнале переходим на show-part-2 зацикленно
    if (signalCount.value === 1) {
      signalCount.value = 2
      startShowSequence(showPart2Sequence)
      return
    }

    // При последующих сигналах остаемся на show-part-2 (не переходим дальше)
    // Если последовательность уже запущена, повторный запуск не нужен
    if (currentSequenceState.value.isActive) return

    // Если show-part-2 не активна, запускаем её
    startShowSequence(showPart2Sequence)
    return
  }

  if (flag === 0) {
    stopSequence()
    stopShowSequence()
    handleColorChange(0)
    // Освобождаем Wake Lock при остановке
    releaseWakeLock()
    // Выходим из полноэкранного режима при остановке
    exitFullscreen()
    showHeartOverlay.value = false
    // Сбрасываем статус доступа к микрофону
    hasMicrophoneAccess.value = false
    showScreenRotationMessage.value = false
  }
}


// Обработчик нажатия кнопки "Начать"
const handleStart = async () => {
  isStarted.value = true

  // Включаем логирование
  enableLogging()

  // Показываем подсказку с сердцем
  showHeartOverlay.value = true

  // Входим в полноэкранный режим
  enterFullscreen()

  // Активируем Wake Lock для предотвращения засыпания экрана
  requestWakeLock()

  // Устанавливаем начальное состояние - белый экран
  // Используем флаг, чтобы не запустить последовательность при начальной установке
  isInitializing.value = true
  mainStore.isLightOn = true
  // Логируем начальное состояние режима экрана
  trackScreenModeChange(true, screenColor.value, screenBrightness.value)

  // Снимаем флаг инициализации после установки начального состояния
  isInitializing.value = false

  // Запускаем зацикленное проигрывание show-demo
  startShowSequence(showDemoSequence)

  // Создаем объект с функциями логирования для передачи в useAudio
  const loggingCallbacks = {
    logMicrophonePermission,
    logAudioSettings,
    logFirstSoundSignal
  }

  // Запрашиваем доступ к микрофону
  try {
    await requestMicrophonePermission(loggingCallbacks, handleAudioSignal)
    // Доступ к микрофону получен, обновляем статус
    hasMicrophoneAccess.value = true

    // Через 5 секунд меняем текст на "Разверните экран ко льду"
    setTimeout(() => {
      showScreenRotationMessage.value = true
    }, 5000)
  } catch (err) {
    console.error('Ошибка при получении доступа к микрофону:', err)
    // Доступ не получен, оставляем hasMicrophoneAccess = false
  }

  // Скрываем подсказку через 10 секунд
  setTimeout(() => {
    showHeartOverlay.value = false
  }, 10000)

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

  // Останавливаем show-последовательность
  stopShowSequence()

  // Выходим из полноэкранного режима
  exitFullscreen()

  // Деактивируем Wake Lock при размонтировании
  releaseWakeLock()

  showHeartOverlay.value = false
  hasMicrophoneAccess.value = false
  showScreenRotationMessage.value = false
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

.heart-fade-enter-active,
.heart-fade-leave-active {
  transition: opacity 0.35s ease;
}

.heart-fade-enter-from,
.heart-fade-leave-to {
  opacity: 0;
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
