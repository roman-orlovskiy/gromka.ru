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
      isLightOn.value = true
    }
    // Частота ~9700 Гц = флаг 0 (черный)
    else if (frequency >= 18500 && frequency <= 19500) {
      flag = 0
      isLightOn.value = false
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
