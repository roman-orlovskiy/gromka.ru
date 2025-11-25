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

  const SIGNAL_CONSTANTS = {
    PREAMBLE_FREQ: 19500,
    PAYLOAD_FREQ_ON: 19000,
    PAYLOAD_FREQ_OFF: 18000,
    PREAMBLE_TOLERANCE: 150,
    PAYLOAD_TOLERANCE: 160,
    PREAMBLE_THRESHOLD: 110,
    BIT_LOW_THRESHOLD: 55,
    PAYLOAD_MIN_RATIO: 0.25,
    PAYLOAD_WINDOW_MS: 280,
    STABLE_SAMPLE_COUNT: 5,
    BAND_CONFIDENCE_THRESHOLD: 0.7
  }

  const payloadWindow = {
    isOpen: false,
    samples: [],
    deadline: 0,
    referenceAmplitude: 0
  }

  const getNowMs = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now())

  const resetPayloadWindow = () => {
    payloadWindow.isOpen = false
    payloadWindow.samples = []
    payloadWindow.deadline = 0
    payloadWindow.referenceAmplitude = 0
  }

  const openPayloadWindow = (currentTimestamp, referenceAmplitude) => {
    payloadWindow.isOpen = true
    payloadWindow.samples = []
    payloadWindow.deadline = currentTimestamp + SIGNAL_CONSTANTS.PAYLOAD_WINDOW_MS
    payloadWindow.referenceAmplitude = referenceAmplitude
  }

  const isWithinRange = (value, target, tolerance) => Math.abs(value - target) <= tolerance

  const isPreambleHit = (frequency, amplitude) =>
    isWithinRange(frequency, SIGNAL_CONSTANTS.PREAMBLE_FREQ, SIGNAL_CONSTANTS.PREAMBLE_TOLERANCE) &&
    amplitude >= SIGNAL_CONSTANTS.PREAMBLE_THRESHOLD

  const getPayloadBand = (frequency) => {
    if (isWithinRange(frequency, SIGNAL_CONSTANTS.PAYLOAD_FREQ_ON, SIGNAL_CONSTANTS.PAYLOAD_TOLERANCE)) {
      return 'on'
    }

    if (isWithinRange(frequency, SIGNAL_CONSTANTS.PAYLOAD_FREQ_OFF, SIGNAL_CONSTANTS.PAYLOAD_TOLERANCE)) {
      return 'off'
    }

    return null
  }

  const isPayloadAmplitudeValid = (amplitude) => {
    if (amplitude < SIGNAL_CONSTANTS.BIT_LOW_THRESHOLD) return false
    if (!payloadWindow.referenceAmplitude) return true

    const ratio = amplitude / payloadWindow.referenceAmplitude
    return ratio >= SIGNAL_CONSTANTS.PAYLOAD_MIN_RATIO
  }

  const classifyFlagByBand = () => {
    const totalSamples = payloadWindow.samples.length
    if (totalSamples === 0) return null

    const stats = payloadWindow.samples.reduce(
      (acc, sample) => {
        acc[sample.band] = (acc[sample.band] || 0) + 1
        return acc
      },
      { on: 0, off: 0 }
    )

    const onShare = stats.on / totalSamples
    const offShare = stats.off / totalSamples

    if (onShare >= SIGNAL_CONSTANTS.BAND_CONFIDENCE_THRESHOLD) {
      return 1
    }

    if (offShare >= SIGNAL_CONSTANTS.BAND_CONFIDENCE_THRESHOLD) {
      return 0
    }

    return null
  }

  const getAverageFromSamples = (selector) => {
    if (!payloadWindow.samples.length) return 0
    const sum = payloadWindow.samples.reduce((acc, sample) => acc + selector(sample), 0)
    return sum / payloadWindow.samples.length
  }

  // Настройка аудио анализа с уже полученным stream (для объединённого запроса камера+микрофон)
  const setupWithExistingStream = (audioStream, loggingCallback = null, signalCallback = null) => {
    // Если уже слушаем — не создаём новый AudioContext
    if (isListening.value) {
      console.log('setupWithExistingStream: уже слушаем, пропускаем')
      return true
    }

    if (!audioStream || audioStream.getAudioTracks().length === 0) {
      console.warn('setupWithExistingStream: нет audio tracks в stream')
      return false
    }

    hasPermission.value = true

    const audioSettings = {
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    }

    // Логируем успешное получение разрешения (через объединённый запрос)
    if (loggingCallback) {
      loggingCallback.logMicrophonePermission(true, null, 'combined_request')
      loggingCallback.logAudioSettings(audioSettings)
    }

    setupAudioAnalysis(audioStream, loggingCallback, signalCallback)
    return true
  }

  // Функция для запроса разрешения на микрофон
  // existingStream — если передан, используем его вместо нового запроса
  const requestMicrophonePermission = async (loggingCallback = null, signalCallback = null, existingStream = null) => {
    // Если уже слушаем — не создаём новый AudioContext
    if (isListening.value) {
      console.log('requestMicrophonePermission: уже слушаем, пропускаем')
      return existingStream || true
    }

    // Если уже есть stream с audio — используем его
    if (existingStream && existingStream.getAudioTracks().length > 0) {
      return setupWithExistingStream(existingStream, loggingCallback, signalCallback)
        ? existingStream
        : null
    }

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

      setupAudioAnalysis(stream, loggingCallback, signalCallback)
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
  const setupAudioAnalysis = (stream, loggingCallback = null, signalCallback = null) => {
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

    isListening.value = true
    startListening(minIndex, maxIndex, frequencyResolution, loggingCallback, signalCallback)
  }

  // Начало прослушивания с предвычисленными константами
  const startListening = (minIndex, maxIndex, frequencyResolution, loggingCallback = null, signalCallback = null) => {
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

      const nowTimestamp = getNowMs()

      if (payloadWindow.isOpen && nowTimestamp > payloadWindow.deadline) {
        resetPayloadWindow()
      }

      if (maxValue === 0) {
        currentFrequency.value = 0
        animationId = requestAnimationFrame(detectFrequency)
        return
      }

      // Быстрое вычисление частоты с предвычисленным разрешением
      const frequency = maxValueIndex * frequencyResolution

      currentFrequency.value = frequency | 0 // быстрое целочисленное округление

      if (!payloadWindow.isOpen && isPreambleHit(frequency, maxValue)) {
        openPayloadWindow(nowTimestamp, maxValue)
      } else if (payloadWindow.isOpen) {
        const payloadBand = getPayloadBand(frequency)

        if (payloadBand && isPayloadAmplitudeValid(maxValue)) {
          payloadWindow.samples.push({
            band: payloadBand,
            frequency,
            amplitude: maxValue
          })

          if (payloadWindow.samples.length >= SIGNAL_CONSTANTS.STABLE_SAMPLE_COUNT) {
            const flag = classifyFlagByBand()

            if (flag !== null) {
              const avgFrequency = getAverageFromSamples((sample) => sample.frequency)
              const avgAmplitude = getAverageFromSamples((sample) => sample.amplitude)

              commitSignal(flag, avgFrequency, avgAmplitude, loggingCallback, signalCallback)
            } else {
              console.warn('Частота полезного сигнала не распознана, кадр отброшен', {
                samples: payloadWindow.samples
              })
            }

            resetPayloadWindow()
          }
        }
      }

      animationId = requestAnimationFrame(detectFrequency)
    }

    detectFrequency()
  }

  // Фиксируем декодированный сигнал после успешной проверки амплитуды
  const commitSignal = (flag, frequency, amplitude, loggingCallback = null, signalCallback = null) => {
    signalHistory.push(flag)
    signalHistory = signalHistory.slice(-5)

    isLightOn.value = flag === 1

    if (signalCallback) {
      signalCallback(flag)
    }

    const roundedFreq = frequency | 0
    const roundedAmplitude = Math.round(amplitude)

    lastSignal.value = {
      flag,
      frequency: roundedFreq,
      amplitude: roundedAmplitude,
      timestamp: Date.now()
    }

    if (isFirstSignal.value && loggingCallback) {
      loggingCallback.logFirstSoundSignal({
        frequency: roundedFreq,
        amplitude: roundedAmplitude,
        flag
      })
      isFirstSignal.value = false
    }

    console.log(
      `Сигнал подтвержден: флаг ${flag}, ${roundedFreq} Гц, амплитуда ${roundedAmplitude}, история: [${signalHistory.join(',')}]`
    )
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
    resetPayloadWindow()

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
    setupWithExistingStream, // Для использования audio stream из объединённого запроса
    cleanup
  }
}
