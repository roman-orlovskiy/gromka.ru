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
  const isFirstSignal = ref(true)

  let audioContext = null
  let analyser = null
  let microphone = null
  let dataArray = null
  let animationId = null
  let signalHistory = [] // История последних сигналов для проверки кода

  // Функция для запроса разрешения на микрофон
  const requestMicrophonePermission = async (loggingCallback = null) => {
    const audioSettings = {
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioSettings
      })

      hasPermission.value = true

      // Логируем успешное получение разрешения
      if (loggingCallback) {
        loggingCallback.logMicrophonePermission(true)
        loggingCallback.logAudioSettings(audioSettings)
      }

      setupAudioAnalysis(stream, loggingCallback)
      return stream
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error)
      hasPermission.value = false

      // Логируем ошибку получения разрешения
      if (loggingCallback) {
        loggingCallback.logMicrophonePermission(false, error)
      }
    }
  }

  // Настройка анализа аудио
  const setupAudioAnalysis = (stream, loggingCallback = null) => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    microphone = audioContext.createMediaStreamSource(stream)

    // Настройки анализатора для мгновенной реакции на импульсы
    analyser.fftSize = 8192 // увеличенный размер для лучшей точности
    analyser.smoothingTimeConstant = 0 // мгновенная реакция на импульсы

    // Добавляем усиление микрофона для лучшей чувствительности
    const micGain = audioContext.createGain()
    micGain.gain.value = 3.0 // усиливаем в 3 раза

    microphone.connect(micGain)
    micGain.connect(analyser)

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
    const AMPLITUDE_THRESHOLD = 50 // более чувствительный порог

    isListening.value = true
    startListening(minIndex, maxIndex, frequencyResolution, AMPLITUDE_THRESHOLD, loggingCallback)
  }

  // Начало прослушивания с предвычисленными константами
  const startListening = (minIndex, maxIndex, frequencyResolution, amplitudeThreshold, loggingCallback = null) => {
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
        detectSignal(frequency, maxValue, amplitudeThreshold, loggingCallback)
      } else {
        // Если нет сигнала в ультразвуковом диапазоне, сбрасываем частоту
        currentFrequency.value = 0
      }

      animationId = requestAnimationFrame(detectFrequency)
    }

    detectFrequency()
  }

  // Оптимизированное определение сигнала по частоте
  const detectSignal = (frequency, amplitude, amplitudeThreshold, loggingCallback = null) => {
    if (amplitude < amplitudeThreshold) return

    // Упрощенная логика определения флага
    let flag
    if (frequency >= 18800 && frequency <= 19200) {
      flag = 1  // 19000 Гц = флаг 1 (белый)
    } else if (frequency >= 17800 && frequency <= 18200) {
      flag = 0  // 18000 Гц = флаг 0 (черный)
    } else {
      return // Не распознан как валидный сигнал
    }

    // Добавляем сигнал в историю и ограничиваем до 3 элементов
    signalHistory.push(flag)
    signalHistory = signalHistory.slice(-3)

    // Проверяем, все ли последние 3 сигнала одинаковые
    if (signalHistory.length === 3 && 
        signalHistory[0] === signalHistory[1] && 
        signalHistory[1] === signalHistory[2]) {
      // Все 3 бита совпадают - меняем состояние
      isLightOn.value = flag === 1
    }

    // Быстрое округление частоты один раз
    const roundedFreq = frequency | 0

    // Сохраняем последний сигнал с оптимизированным timestamp
    lastSignal.value = {
      flag,
      frequency: roundedFreq,
      timestamp: Date.now() // быстрее чем new Date()
    }

    // Логируем первый звуковой сигнал
    if (isFirstSignal.value && loggingCallback) {
      loggingCallback.logFirstSoundSignal({
        frequency: roundedFreq,
        amplitude,
        flag
      })
      isFirstSignal.value = false
    }

    console.log(`Сигнал: флаг ${flag}, ${roundedFreq} Гц, ${amplitude}, история: [${signalHistory.join(',')}]`)
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

    // Очищаем историю сигналов
    signalHistory = []

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
