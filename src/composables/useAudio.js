import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/stores/main'

export function useAudio() {
  const mainStore = useMainStore()
  const { isLightOn } = storeToRefs(mainStore)
  const isListening = ref(false)
  const hasPermission = ref(false)
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

  // Настройки анализатора для лучшего разрешения в ультразвуковом диапазоне
  analyser.fftSize = 4096
  analyser.smoothingTimeConstant = 0.15

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

      // Константы для ультразвукового диапазона
      const MIN_FREQ = 17500
      const MAX_FREQ = 19500

      // Определяем диапазон индексов для ультразвука (17500-19500 Гц)
      const minIndex = Math.floor((MIN_FREQ * analyser.fftSize) / audioContext.sampleRate)
      const maxIndex = Math.ceil((MAX_FREQ * analyser.fftSize) / audioContext.sampleRate)

      // Находим доминирующую частоту ТОЛЬКО в ультразвуковом диапазоне
      let maxValue = 0
      let maxValueIndex = 0

      for (let i = minIndex; i < Math.min(maxIndex, dataArray.length); i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i]
          maxValueIndex = i
        }
      }

      // Конвертируем индекс в частоту
      const frequency = (maxValueIndex * audioContext.sampleRate) / analyser.fftSize

      // Обновляем currentFrequency только если есть значимый сигнал в ультразвуковом диапазоне
      if (maxValue > 0) {
        currentFrequency.value = Math.round(frequency)
        // Определяем сигнал на основе частоты
        detectSignal(frequency, maxValue)
      } else {
        // Если нет сигнала в ультразвуковом диапазоне, сбрасываем частоту
        currentFrequency.value = 0
      }

      animationId = requestAnimationFrame(detectFrequency)
    }

    detectFrequency()
  }

  // Определение сигнала по частоте (упрощенная версия для ультразвукового диапазона)
  const detectSignal = (frequency, amplitude) => {
    // Порог амплитуды для определения сигнала (увеличен для ультразвука)
    const amplitudeThreshold = 80

    if (amplitude < amplitudeThreshold) {
      // Нет сигнала достаточной силы
      return
    }

    // Определяем флаг по частоте (только для ультразвукового диапазона)
    let flag = null

    // Частота ~18000 Гц = флаг 1 (белый)
    if (frequency >= 17500 && frequency <= 18500) {
      flag = 1
      isLightOn.value = true
    }
    // Частота ~19000 Гц = флаг 0 (черный)
    else if (frequency >= 18500 && frequency <= 19500) {
      flag = 0
      isLightOn.value = false
    }
    else {
      // Частота вне целевого диапазона - игнорируем
      return
    }

    // Сохраняем последний сигнал
    lastSignal.value = {
      flag,
      frequency: Math.round(frequency),
      timestamp: new Date()
    }

    console.log(`Обнаружен ультразвуковой сигнал: флаг ${flag}, частота ${Math.round(frequency)} Гц, амплитуда ${amplitude}`)
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

  return {
    // Состояние
    isListening,
    hasPermission,
    currentFrequency,
    lastSignal,

    // Методы
    requestMicrophonePermission,
    cleanup
  }
}
