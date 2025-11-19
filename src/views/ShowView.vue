<template>
  <div class="show-view">
    <!-- Слой мерцания -->
    <div
      v-if="isStarted"
      class="show-view__flicker"
      :class="flickerLayerClasses"
    />

    <!-- Кнопка запуска -->
    <div v-if="!isActive" class="show-view__start">
      <div class="show-view__content">
        <div class="show-view__title">ТЧК + GROMKA</div>

        <div class="show-view__instructions">
          <div class="show-view__instruction-item">
            <div class="show-view__instruction-text">
              1. Введите ряд и место
            </div>
          </div>

          <div class="show-view__instruction-item">
            <div class="show-view__instruction-text">
              2. Нажмите "Начать"
            </div>
          </div>
        </div>

        <div class="show-view__inputs-row">
        <InputComp
          placeholder="Ряд"
            :value="rowValue"
            @handleInput="handleRowInput"
          :error="errors.row"
          :show-shake="shakeFields.row"
          type="number"
            mod="black"
        />
        <InputComp
          placeholder="Место"
            :value="seatValue"
            @handleInput="handleSeatInput"
          :error="errors.seat"
          :show-shake="shakeFields.seat"
          type="number"
            mod="black"
          />
        </div>

        <div class="show-view__button">
          <ButtonComp mod="outline" @click="handleStart">Начать</ButtonComp>
        </div>

        <div class="show-view__qr">
            <img
              src="/images/show-qr.webp"
              alt="QR-код для перформанса"
              class="show-view__qr-image"
            >
        </div>
        </div>
      </div>

    <!-- Сообщение о неподдерживаемом фонарике -->
    <div v-if="isStarted && isFlashlightSupported === false" class="show-view__flashlight-message">
      <div class="flashlight-message">
        <div class="flashlight-message__subtitle">
          Фонарик не поддерживается<br>
          <span class="flashlight-message__action">Поверните экран к сцене</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import ButtonComp from '@/components/ButtonComp.vue'
import InputComp from '@/components/InputComp.vue'
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

const rowValue = ref('')
const seatValue = ref('')
const shakeFields = ref({
  row: false,
  seat: false,
})
const errors = ref({
  row: '',
  seat: '',
})

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
const { startSequence, stopSequence, isActive, setSequenceBySeat } = usePerformanceSequence('tchk-show')

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

const validateFields = () => {
  let isValid = true
  errors.value = {
    row: '',
    seat: '',
  }
  shakeFields.value = {
    row: false,
    seat: false,
  }

  if (!rowValue.value.trim()) {
    errors.value.row = 'Укажите ряд'
    shakeFields.value.row = true
    isValid = false
  }

  if (!seatValue.value.trim()) {
    errors.value.seat = 'Укажите место'
    shakeFields.value.seat = true
    isValid = false
  }

  if (!isValid) {
    setTimeout(() => {
      shakeFields.value = {
        row: false,
        seat: false,
      }
    }, 500)
  }

  return isValid
}

const handleRowInput = (event) => {
  rowValue.value = event.target.value
  errors.value.row = ''
}

const handleSeatInput = (event) => {
  seatValue.value = event.target.value
  errors.value.seat = ''
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
      await turnOnFlashlight()
      trackFlashlightChange(true, cameraMethod.value)
    } else {
      await turnOffFlashlight()
      trackFlashlightChange(false, cameraMethod.value)
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
  if (!validateFields()) {
    return
  }

  isStarted.value = true

  // Устанавливаем последовательность по ряду и месту
  setSequenceBySeat(rowValue.value.trim(), seatValue.value.trim())

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

  // Устанавливаем начальное состояние - белый экран и включенный фонарик
  // Используем флаг, чтобы не запустить последовательность при начальной установке
  isInitializing.value = true
  mainStore.isLightOn = true

  // Включаем фонарик, если поддерживается
  if (hasFlashlight && isFlashlightSupported.value !== false) {
    try {
      await turnOnFlashlight()
      trackFlashlightChange(true, cameraMethod.value)
    } catch (error) {
      console.warn('Ошибка включения фонарика при старте:', error)
    }
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
}

onMounted(() => {
  // Не запускаем автоматически, ждем нажатия кнопки
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
  min-height: 100vh;
  padding: 2rem 0;
  overflow-y: auto;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
}

.show-view__content {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
  width: 100%;
}

.show-view__title {
  font-size: 3.6rem;
  font-weight: 700;
  color: $color-gray-700;
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
  font-size: 2rem;
  color: $color-gray-700;
  line-height: 1.4;
  padding-top: 0;
}

.show-view__button {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.show-view__qr {
  margin-bottom: 3rem;
    display: flex;
  justify-content: center;
}

.show-view__qr-image {
  width: 25rem;
  max-width: 60vw;
  border-radius: 1.2rem;
  box-shadow: 0 1.2rem 3rem rgba($color-black, 0.1);
}

.show-view__inputs-row {
    display: flex;
    gap: 1.5rem;
    width: 100%;
  margin-bottom: 3rem;
}

.show-view__flashlight-message {
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
  color: $color-black;
  line-height: 1.4;
  position: relative;
}

.flashlight-message__action {
  display: inline-block;
  padding: 0.8rem 1.6rem;
  background: $color-black;
  color: $color-white;
  border: 0.2rem solid $color-black;
  border-radius: 0.5rem;
  margin-top: 2rem;
  font-size: 3.2rem;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.show-view__performance {
  position: absolute;
  inset: 0;
    display: flex;
    align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1001;
  }

.show-square {
  width: min(40vw, 240px);
  aspect-ratio: 1 / 1;
  border-radius: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  background: $color-black;
  transition: transform 0.2s ease-in-out;
  transform: scale(1);
    color: $color-white;

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
    font-size: 1.8rem;
  }

  .show-view__instruction-number {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.3rem;
  }

  .show-view__inputs-row {
    gap: 1rem;
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
    font-size: 2.1rem;
  }

  .flashlight-message__action {
    padding: 0.6rem 1.2rem;
    font-size: 2.4rem;
    margin-top: 1.6rem;
  }
}
</style>
