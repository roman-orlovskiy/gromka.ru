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

    // Настройки анализатора для мгновенной реакции на импульсы
    analyser.fftSize = 4096
    analyser.smoothingTimeConstant = 0 // мгновенная реакция на импульсы

    microphone.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    dataArray = new Uint8Array(bufferLength)

    // Предвычисляем константы для ультразвукового диапазона
    const MIN_FREQ = 17500
    const MAX_FREQ = 19500
    const minIndex = Math.floor((MIN_FREQ * analyser.fftSize) / audioContext.sampleRate)
    const maxIndex = Math.min(
      Math.ceil((MAX_FREQ * analyser.fftSize) / audioContext.sampleRate),
      bufferLength
    )
    const frequencyResolution = audioContext.sampleRate / analyser.fftSize
    const AMPLITUDE_THRESHOLD = 80

    isListening.value = true
    startListening(minIndex, maxIndex, frequencyResolution, AMPLITUDE_THRESHOLD)
  }

  // Начало прослушивания с предвычисленными константами
  const startListening = (minIndex, maxIndex, frequencyResolution, amplitudeThreshold) => {
    const detectFrequency = () => {
      if (!analyser) return

      analyser.getByteFrequencyData(dataArray)

      // Находим доминирующую частоту ТОЛЬКО в ультразвуковом диапазоне
      let maxValue = 0
      let maxValueIndex = 0

      // Оптимизированный цикл без Math.min
      for (let i = minIndex; i < maxIndex; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i]
          maxValueIndex = i
        }
      }

      // Быстрое вычисление частоты с предвычисленным разрешением
      const frequency = maxValueIndex * frequencyResolution

      // Обновляем currentFrequency только если есть значимый сигнал
      if (maxValue > 0) {
        currentFrequency.value = frequency | 0 // быстрое целочисленное округление
        // Определяем сигнал на основе частоты
        detectSignal(frequency, maxValue, amplitudeThreshold)
      } else {
        // Если нет сигнала в ультразвуковом диапазоне, сбрасываем частоту
        currentFrequency.value = 0
      }

      animationId = requestAnimationFrame(detectFrequency)
    }

    detectFrequency()
  }

  // Оптимизированное определение сигнала по частоте
  const detectSignal = (frequency, amplitude, amplitudeThreshold) => {
    if (amplitude < amplitudeThreshold) return

    // Упрощенная логика определения флага
    let flag
    if (frequency >= 18500) {
      flag = 1  // 19000 Гц = флаг 1 (белый)
      isLightOn.value = true
    } else {
      flag = 0  // 18000 Гц = флаг 0 (черный)
      isLightOn.value = false
    }

    // Быстрое округление частоты один раз
    const roundedFreq = frequency | 0

    // Сохраняем последний сигнал с оптимизированным timestamp
    lastSignal.value = {
      flag,
      frequency: roundedFreq,
      timestamp: Date.now() // быстрее чем new Date()
    }

    console.log(`Сигнал: флаг ${flag}, ${roundedFreq} Гц, ${amplitude}`)
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
