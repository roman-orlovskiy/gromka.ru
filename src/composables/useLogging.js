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

  // Логирование попыток инициализации камеры (детальное)
  const logCameraAttempt = (data) => {
    if (!isLoggingEnabled.value) return

    addLog('camera_attempt', {
      ...data,
      timestamp: Date.now()
    })
  }

  // Логирование информации о платформе
  const logPlatformInfo = (platformData) => {
    if (!isLoggingEnabled.value) return

    addLog('platform_info', {
      ...platformData,
      timestamp: Date.now()
    })
  }

  const getUserAgentHints = async () => {
    const uaData = navigator.userAgentData
    if (!uaData?.getHighEntropyValues) {
      return null
    }

    try {
      const hints = await uaData.getHighEntropyValues(['platform', 'platformVersion', 'model', 'fullVersionList'])
      return {
        hintPlatform: hints.platform || null,
        hintPlatformVersion: hints.platformVersion || null,
        hintModel: hints.model || null,
        hintBrands: hints.fullVersionList?.map(entry => `${entry.brand} ${entry.version}`).join(', ') || null
      }
    } catch (error) {
      console.warn('[Logging] Не удалось получить User-Agent Client Hints:', error)
      return null
    }
  }

  // Логирование информации об устройстве
  const logDeviceInfo = async () => {
    if (!isLoggingEnabled.value) return

    // Парсим User Agent для определения устройства
    const userAgent = navigator.userAgent
    const platform = navigator.platform
    const language = navigator.language
    const languages = navigator.languages?.join(',') || ''

    // Определяем тип устройства
    let deviceType = 'unknown'
    let deviceBrand = 'unknown'
    let deviceModel = 'unknown'
    let osName = 'unknown'
    let osVersion = 'unknown'
    let browserName = 'unknown'
    let browserVersion = 'unknown'

    // Определяем браузер
    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome'
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : 'unknown'
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox'
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : 'unknown'
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari'
      const match = userAgent.match(/Version\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : 'unknown'
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge'
      const match = userAgent.match(/Edge\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : 'unknown'
    }

    // Определяем ОС и устройство
    if (userAgent.includes('Windows')) {
      osName = 'Windows'
      if (userAgent.includes('Windows NT 10.0')) osVersion = '10/11'
      else if (userAgent.includes('Windows NT 6.3')) osVersion = '8.1'
      else if (userAgent.includes('Windows NT 6.1')) osVersion = '7'

      deviceType = 'desktop'
      if (userAgent.includes('Mobile')) deviceType = 'mobile'
    } else if (userAgent.includes('Mac OS X')) {
      osName = 'macOS'
      const match = userAgent.match(/Mac OS X (\d+[._]\d+)/)
      osVersion = match ? match[1].replace('_', '.') : 'unknown'

      deviceType = 'desktop'
      if (userAgent.includes('iPhone')) {
        deviceType = 'mobile'
        deviceBrand = 'Apple'
        deviceModel = 'iPhone'
      } else if (userAgent.includes('iPad')) {
        deviceType = 'tablet'
        deviceBrand = 'Apple'
        deviceModel = 'iPad'
      } else {
        deviceBrand = 'Apple'
        deviceModel = 'Mac'
      }
    } else if (userAgent.includes('Android')) {
      osName = 'Android'
      const match = userAgent.match(/Android (\d+\.\d+)/)
      osVersion = match ? match[1] : 'unknown'

      deviceType = 'mobile'
      if (userAgent.includes('Tablet')) deviceType = 'tablet'

      // Попытка определить производителя Android
      if (userAgent.includes('Samsung')) {
        deviceBrand = 'Samsung'
        const match = userAgent.match(/Samsung[^;]*([A-Z0-9-]+)/)
        deviceModel = match ? match[1] : 'Galaxy'
      } else if (userAgent.includes('Huawei')) {
        deviceBrand = 'Huawei'
        deviceModel = 'Huawei'
      } else if (userAgent.includes('Xiaomi')) {
        deviceBrand = 'Xiaomi'
        deviceModel = 'Xiaomi'
      } else if (userAgent.includes('OnePlus')) {
        deviceBrand = 'OnePlus'
        deviceModel = 'OnePlus'
      } else if (userAgent.includes('Google')) {
        deviceBrand = 'Google'
        deviceModel = 'Pixel'
      }
    } else if (userAgent.includes('Linux')) {
      osName = 'Linux'
      deviceType = 'desktop'
    }

    // Дополнительная информация об устройстве
    const hintData = await getUserAgentHints()

    const deviceInfo = {
      userAgent,
      platform,
      language,
      languages,
      deviceType,
      deviceBrand,
      deviceModel,
      osName,
      osVersion,
      browserName,
      browserVersion,
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenColorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      memory: navigator.deviceMemory || 'unknown',
      timestamp: Date.now(),
      hintPlatform: hintData?.hintPlatform || null,
      hintPlatformVersion: hintData?.hintPlatformVersion || null,
      hintModel: hintData?.hintModel || null,
      hintBrands: hintData?.hintBrands || null
    }

    addLog('device_info', deviceInfo)
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
    logCameraAttempt,
    logPlatformInfo,
    logDeviceInfo,
    sendLogs,
    clearLogs
  }
}
