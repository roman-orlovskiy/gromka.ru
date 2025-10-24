<template>
  <div class="sound-view" :class="soundViewClasses">
    <!-- Кнопка запуска -->
    <div v-if="!isStarted" class="sound-view__start">
      <div class="sound-view__content">
        <div class="sound-view__title">Световой перформанс</div>

        <div class="sound-view__instructions">
          <div class="sound-view__instruction-item">
            <div>
              <div class="sound-view__instruction-number">1</div>
            </div>
            <div class="sound-view__instruction-text">
              Разреши доступ к <b>микрофону и камере</b>
            </div>
          </div>
          <div class="sound-view__instruction-item">
            <div>
              <div class="sound-view__instruction-number">2</div>
            </div>
            <div class="sound-view__instruction-text">
              Нажми "Начать"
            </div>
          </div>
        </div>

        <div class="sound-view__button">
          <ButtonComp mod="spartak" @click="handleStart">Начать</ButtonComp>
        </div>
      </div>
    </div>

    <!-- Сообщение о неподдерживаемом фонарике -->
    <div v-if="isStarted && isFlashlightSupported === false" class="sound-view__flashlight-message">
      <div class="flashlight-message">
        <div class="flashlight-message__icon">📱</div>
        <div class="flashlight-message__title">Фонарик не поддерживается</div>
        <div class="flashlight-message__subtitle">Поверните экран к сцене</div>
      </div>
    </div>

    <!-- Статус панель -->
    <div v-if="isStarted && isFlashlightSupported !== false" class="sound-view__status">
      <div class="status-indicator">
        <div class="status-indicator__light" :class="{
          'status-indicator__light--white': isLightOn,
          'status-indicator__light--black': !isLightOn,
          'status-indicator__light--off': false
        }"></div>
        <div class="status-indicator__text">
          <div v-if="isListening" class="listening-text">Прослушивание...</div>
          <div v-else-if="!hasPermission" class="permission-text">Нет разрешения на микрофон</div>
          <div v-else-if="lastSignal" class="signal-text">
            Последний сигнал: {{ lastSignal.flag }} ({{ lastSignal.frequency }} Гц)
          </div>
          <div v-else class="waiting-text">Ожидание сигнала</div>
        </div>
      </div>

      <div class="frequency-display">
        <div class="frequency-display__label">Текущая частота:</div>
        <div class="frequency-display__value">{{ currentFrequency }} Гц</div>
      </div>

      <div class="flashlight-status">
        <div class="flashlight-status__label">Фонарик:</div>
        <div v-if="isFlashlightSupported === null" class="flashlight-status__value flashlight-status__value--checking">
          Проверка поддержки...
        </div>
        <div v-else-if="isFlashlightSupported === false" class="flashlight-status__value flashlight-status__value--unsupported">
          Не поддерживается
        </div>
        <div v-else class="flashlight-status__value" :class="{
          'flashlight-status__value--on': isFlashlightOn,
          'flashlight-status__value--off': !isFlashlightOn
        }">
          {{ isFlashlightOn ? 'Включен' : 'Выключен' }}
        </div>
        <div v-if="cameraError" class="flashlight-status__error">
          {{ cameraError }}
        </div>
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
const mainStore = useMainStore()
const { isLightOn } = storeToRefs(mainStore)

// Используем composable для аудио
const {
  isListening,
  hasPermission,
  currentFrequency,
  lastSignal,
  requestMicrophonePermission,
  cleanup
} = useAudio()

// Используем composable для камеры/фонарика
const {
  isFlashlightOn,
  isFlashlightSupported,
  error: cameraError,
  devices,
  lastUsedMethod,
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

// Управление фонариком на основе isLightOn
watch(isLightOn, async (newValue) => {
  if (newValue === null) return

  // Логируем изменение звука
  trackSoundChange(newValue)

  // Если фонарик не поддерживается, не пытаемся его включать
  if (isFlashlightSupported.value === false) return

  try {
    if (newValue) {
      // Включаем фонарик при белом свете
      await turnOnFlashlight()
      trackFlashlightChange(true, lastUsedMethod.value)
    } else {
      // Выключаем фонарик при черном свете
      await turnOffFlashlight()
      trackFlashlightChange(false, lastUsedMethod.value)
    }
  } catch (error) {
    console.warn('Ошибка управления фонариком:', error)
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

  // Проверяем поддержку фонарика с логированием
  const hasFlashlight = await checkFlashlightSupport({
    logFlashlightSupport
  })

  if (hasFlashlight) {
    console.log('Фонарик поддерживается')
  } else {
    console.warn('Фонарик не поддерживается на этом устройстве')
  }

  // Логируем информацию о камерах после проверки фонарика
  logCameraInfo(devices.value, lastUsedMethod.value)

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
  background: $color-gray-100;
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
  font-size: 3rem;
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
  gap: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.sound-view__instruction-number {
  width: 3rem;
  height: 3rem;
  background: $color-primary;
  color: $color-white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.sound-view__instruction-text {
  font-size: 1.6rem;
  color: $color-gray-700;
  line-height: 1.4;
  padding-top: 0.5rem;
}

.sound-view__button {
  display: flex;
  justify-content: center;
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
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.sound-view__status {
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 1001;
  background: rgba(0, 0, 0, 0.8);
  color: $color-white;
  padding: 1.5rem;
  border-radius: 1rem;
  min-width: 300px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-indicator__light {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: $color-gray-500;
  transition: background-color 0.3s ease;

  &--white {
    background: $color-white;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  &--black {
    background: $color-black;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  &--off {
    background: $color-gray-500;
  }
}

.status-indicator__text {
  font-size: 1.4rem;
  font-weight: 500;
}

.listening-text {
  color: $color-success;
}

.permission-text {
  color: $color-error;
}

.signal-text {
  color: $color-primary;
}

.waiting-text {
  color: $color-gray-300;
}

.frequency-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.frequency-display__label {
  font-size: 1.2rem;
  color: $color-gray-300;
}

.frequency-display__value {
  font-size: 1.8rem;
  font-weight: 700;
  color: $color-white;
}

.flashlight-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.flashlight-status__label {
  font-size: 1.2rem;
  color: $color-gray-300;
}

.flashlight-status__value {
  font-size: 1.4rem;
  font-weight: 600;

  &--on {
    color: $color-success;
  }

  &--off {
    color: $color-gray-400;
  }

  &--checking {
    color: $color-primary;
  }

  &--unsupported {
    color: $color-error;
  }
}

.flashlight-status__error {
  font-size: 1rem;
  color: $color-error;
  margin-top: 0.5rem;
}

.wake-lock-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.wake-lock-status__label {
  font-size: 1.2rem;
  color: $color-gray-300;
}

.wake-lock-status__value {
  font-size: 1.4rem;
  font-weight: 600;

  &--active {
    color: $color-success;
  }

  &--inactive {
    color: $color-gray-400;
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

  .sound-view__status {
    top: 1rem;
    left: 1rem;
    right: 1rem;
    min-width: auto;
    padding: 1rem;
  }

  .status-indicator {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .frequency-display__value {
    font-size: 1.5rem;
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
  }
}
</style>
