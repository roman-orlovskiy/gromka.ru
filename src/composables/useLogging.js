import { ref } from 'vue'
import { saveGromkaLogs } from '@/services/api'

export function useLogging() {
  const deviceId = ref(null)
  const logs = ref([])
  const soundChangeCount = ref(0)
  const lastSoundState = ref(null)
  const isLoggingEnabled = ref(false)

  // Генерация стабильного идентификатора устройства
  const generateDeviceId = () => {
    if (deviceId.value) return deviceId.value

    // Создаем стабильный fingerprint на основе системных характеристик
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)

    // Собираем стабильные характеристики системы
    const systemFingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      navigator.hardwareConcurrency || 'unknown',
      navigator.maxTouchPoints || 0,
      canvas.toDataURL()
    ].join('|')

    // Создаем стабильный хэш (без timestamp)
    let hash = 0
    for (let i = 0; i < systemFingerprint.length; i++) {
      const char = systemFingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Конвертируем в 32-битное число
    }

    // Используем только системные характеристики, без timestamp
    deviceId.value = `device_${Math.abs(hash).toString(36)}`
    return deviceId.value
  }

  // Добавление лога
  const addLog = (type, data) => {
    if (!isLoggingEnabled.value) return

    const logEntry = {
      timestamp: Date.now(),
      type,
      data
    }

    logs.value.push(logEntry)
    console.log(`[Logging] ${type}:`, data)
  }

  // Отслеживание изменений звука
  const trackSoundChange = (newSoundState) => {
    if (!isLoggingEnabled.value) return

    // Проверяем, изменилось ли состояние звука
    if (lastSoundState.value !== newSoundState) {
      const previousState = lastSoundState.value
      soundChangeCount.value++
      lastSoundState.value = newSoundState

      addLog('sound_change', {
        state: newSoundState,
        changeCount: soundChangeCount.value,
        previousState: previousState
      })

      // Отправляем логи после третьей смены звука
      if (soundChangeCount.value === 3) {
        sendLogs()
      }
    }
  }

  // Отслеживание изменений фонарика
  const trackFlashlightChange = (isOn, method = null) => {
    if (!isLoggingEnabled.value) return

    addLog('flashlight_change', {
      isOn,
      method,
      timestamp: Date.now()
    })
  }

  // Логирование информации о камерах
  const logCameraInfo = (cameras, selectedMethod) => {
    if (!isLoggingEnabled.value) return

    addLog('camera_info', {
      availableCameras: cameras.map(camera => ({
        deviceId: camera.deviceId,
        label: camera.label,
        kind: camera.kind
      })),
      selectedMethod,
      timestamp: Date.now()
    })
  }

  // Логирование разрешения на микрофон
  const logMicrophonePermission = (success, error = null) => {
    if (!isLoggingEnabled.value) return

    addLog('microphone_permission', {
      success,
      error: error?.message || null,
      timestamp: Date.now()
    })
  }

  // Логирование параметров аудио
  const logAudioSettings = (audioSettings) => {
    if (!isLoggingEnabled.value) return

    addLog('audio_settings', {
      sampleRate: audioSettings.sampleRate,
      channelCount: audioSettings.channelCount,
      echoCancellation: audioSettings.echoCancellation,
      noiseSuppression: audioSettings.noiseSuppression,
      autoGainControl: audioSettings.autoGainControl,
      timestamp: Date.now()
    })
  }

  // Логирование первого звукового сигнала
  const logFirstSoundSignal = (signalData) => {
    if (!isLoggingEnabled.value) return

    addLog('first_sound_signal', {
      frequency: signalData.frequency,
      amplitude: signalData.amplitude,
      flag: signalData.flag,
      timestamp: Date.now()
    })
  }

  // Логирование результата проверки фонарика
  const logFlashlightSupport = (isSupported, method = null, error = null) => {
    if (!isLoggingEnabled.value) return

    addLog('flashlight_support', {
      isSupported,
      method,
      error: error?.message || null,
      timestamp: Date.now()
    })
  }

  // Отправка логов на сервер
  const sendLogs = async () => {
    if (!deviceId.value || logs.value.length === 0) return

    try {
      // Создаем финальный объект для отправки
      const finalLogsData = {
        deviceId: deviceId.value,
        timestamp: Date.now(),
        soundChangeCount: soundChangeCount.value,
        logs: logs.value // массив логов без deviceId в каждом элементе
      }

      // Отправляем как JSON строку
      await saveGromkaLogs(deviceId.value, JSON.stringify(finalLogsData))
      console.log('[Logging] Логи успешно отправлены:', finalLogsData)

      // Очищаем логи после отправки
      logs.value = []
      soundChangeCount.value = 0
    } catch (error) {
      console.error('[Logging] Ошибка отправки логов:', error)
    }
  }

  // Включение логирования
  const enableLogging = () => {
    if (!isLoggingEnabled.value) {
      generateDeviceId()
      isLoggingEnabled.value = true
      console.log('[Logging] Логирование включено для устройства:', deviceId.value)
    }
  }

  // Отключение логирования
  const disableLogging = () => {
    isLoggingEnabled.value = false
    console.log('[Logging] Логирование отключено')
  }

  // Очистка логов
  const clearLogs = () => {
    logs.value = []
    soundChangeCount.value = 0
    lastSoundState.value = null
  }

  return {
    // Состояние
    deviceId,
    logs,
    soundChangeCount,
    isLoggingEnabled,

    // Методы
    enableLogging,
    disableLogging,
    trackSoundChange,
    trackFlashlightChange,
    logCameraInfo,
    logMicrophonePermission,
    logAudioSettings,
    logFirstSoundSignal,
    logFlashlightSupport,
    sendLogs,
    clearLogs
  }
}
