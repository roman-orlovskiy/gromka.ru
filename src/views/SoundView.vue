<template>
  <div class="sound-view" :class="{ 'sound-view--white': isWhite, 'sound-view--red': isRed }">
    <!-- Кнопка запуска -->
    <div v-if="!isStarted" class="sound-view__start">
      <div class="sound-view__content">
        <div class="sound-view__title">Приемник ультразвуковых сигналов</div>

        <div class="sound-view__instructions">
          <div class="sound-view__instruction-item">
            <div>
              <div class="sound-view__instruction-number">1</div>
            </div>
            <div class="sound-view__instruction-text">
              Разреши доступ к <b>микрофону</b>
            </div>
          </div>
          <div class="sound-view__instruction-item">
            <div>
              <div class="sound-view__instruction-number">2</div>
            </div>
            <div class="sound-view__instruction-text">
              Нажми "Начать" для <b>прослушивания сигналов</b>
            </div>
          </div>
        </div>

        <div class="sound-view__button">
          <ButtonComp mod="spartak" @click="handleStart">Начать</ButtonComp>
        </div>
      </div>
    </div>

    <!-- Статус панель -->
    <div v-if="isStarted" class="sound-view__status">
      <div class="status-indicator">
        <div class="status-indicator__light" :class="{
          'status-indicator__light--white': isWhite,
          'status-indicator__light--red': isRed,
          'status-indicator__light--off': !isWhite && !isRed
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'

const isStarted = ref(false)
const isListening = ref(false)
const hasPermission = ref(false)
const isWhite = ref(false)
const isRed = ref(false)
const currentFrequency = ref(0)
const lastSignal = ref(null)

let audioContext = null
let analyser = null
let microphone = null
let dataArray = null
let animationId = null

// Функция для запроса разрешения на микрофон
const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 44100,
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    })

    hasPermission.value = true
    setupAudioAnalysis(stream)
    return stream
  } catch (error) {
    console.error('Ошибка доступа к микрофону:', error)
    hasPermission.value = false
  }
}

// Настройка анализа аудио
const setupAudioAnalysis = (stream) => {
  audioContext = new (window.AudioContext || window.webkitAudioContext)()
  analyser = audioContext.createAnalyser()
  microphone = audioContext.createMediaStreamSource(stream)

  // Настройки анализатора
  analyser.fftSize = 2048
  analyser.smoothingTimeConstant = 0.3

  microphone.connect(analyser)

  const bufferLength = analyser.frequencyBinCount
  dataArray = new Uint8Array(bufferLength)

  isListening.value = true
  startListening()
}

// Начало прослушивания
const startListening = () => {
  const detectFrequency = () => {
    if (!analyser) return

    analyser.getByteFrequencyData(dataArray)

    // Находим доминирующую частоту
    let maxValue = 0
    let maxIndex = 0

    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i]
        maxIndex = i
      }
    }

    // Конвертируем индекс в частоту
    const frequency = (maxIndex * audioContext.sampleRate) / (analyser.fftSize)
    currentFrequency.value = Math.round(frequency)

    // Определяем сигнал на основе частоты
    detectSignal(frequency, maxValue)

    animationId = requestAnimationFrame(detectFrequency)
  }

  detectFrequency()
}

// Определение сигнала по частоте
const detectSignal = (frequency, amplitude) => {
  // Порог амплитуды для определения сигнала
  const amplitudeThreshold = 50

  // Проверяем, что частота выше 8000 Гц
  if (frequency < 8000) {
    return
  }

  if (amplitude < amplitudeThreshold) {
    // Нет сигнала достаточной силы, но флаг остается активным
    return
  }

  // Определяем флаг по частоте
  let flag = null

  // Частота ~9000 Гц = флаг 1 (белый)
  if (frequency >= 17500 && frequency <= 18500) {
    flag = 1
    isWhite.value = true
    isRed.value = false
  }
  // Частота ~9700 Гц = флаг 0 (красный)
  else if (frequency >= 18500 && frequency <= 19500) {
    flag = 0
    isWhite.value = false
    isRed.value = true
  }
  else {
    // Неизвестная частота - флаг остается прежним
    return
  }

  // Сохраняем последний сигнал
  lastSignal.value = {
    flag,
    frequency: Math.round(frequency),
    timestamp: new Date()
  }

  console.log(`Обнаружен сигнал: флаг ${flag}, частота ${Math.round(frequency)} Гц`)
}

// Очистка ресурсов
const cleanup = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  if (microphone) {
    microphone.disconnect()
    microphone = null
  }

  if (audioContext) {
    audioContext.close()
    audioContext = null
  }

  isListening.value = false
}

// Обработчик нажатия кнопки "Начать"
const handleStart = async () => {
  isStarted.value = true
  await requestMicrophonePermission()
}

onMounted(() => {
  // Не запускаем автоматически, ждем нажатия кнопки
})

onUnmounted(() => {
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

  &--red {
    background: $color-error !important;
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

  &--red {
    background: $color-error;
    box-shadow: 0 0 10px rgba($color-error, 0.5);
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
}
</style>
