import { ref } from 'vue'
import { UAParser } from 'ua-parser-js'
import { saveGromkaLogs } from '@/services/api'
import { resolveDeviceBrand } from '@/utils/deviceDetection'

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

      if (soundChangeCount.value > 1) {
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

  // Отслеживание изменений режима экрана
  const trackScreenModeChange = (isOn, color = null, brightness = null) => {
    if (!isLoggingEnabled.value) return

    addLog('screen_mode_change', {
      isOn,
      color,
      brightness,
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
      const hints = await uaData.getHighEntropyValues(['platform', 'platformVersion', 'model', 'fullVersionList', 'brands'])
      return {
        hintPlatform: hints.platform || null,
        hintPlatformVersion: hints.platformVersion || null,
        hintModel: hints.model || null,
        hintBrands: hints.fullVersionList?.map(entry => `${entry.brand} ${entry.version}`).join(', ') || null,
        brands: hints.brands || null
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

    // Используем UAParser для более точного определения браузера и ОС
    let parserData = null
    try {
      const parser = new UAParser(userAgent)
      parserData = {
        browser: parser.getBrowser(),
        os: parser.getOS(),
        device: parser.getDevice()
      }

      // Используем данные из UAParser для браузера, если они доступны
      if (parserData.browser.name) {
        browserName = parserData.browser.name
        browserVersion = parserData.browser.version || 'unknown'
      } else {
        // Fallback на ручной парсинг, если UAParser не определил браузер
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
      }

      // Используем данные из UAParser для ОС, если они доступны
      if (parserData.os.name) {
        osName = parserData.os.name
        osVersion = parserData.os.version || 'unknown'
      }
    } catch (error) {
      console.warn('[Logging] Ошибка парсинга через UAParser:', error)
      // Fallback на ручной парсинг браузера
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
    }

    // Определяем ОС и устройство (используем только если UAParser не определил)
    if (osName === 'unknown' || osVersion === 'unknown') {
      if (userAgent.includes('Windows')) {
        if (osName === 'unknown') {
          osName = 'Windows'
          if (userAgent.includes('Windows NT 10.0')) osVersion = '10/11'
          else if (userAgent.includes('Windows NT 6.3')) osVersion = '8.1'
          else if (userAgent.includes('Windows NT 6.1')) osVersion = '7'
        }
        deviceType = 'desktop'
        if (userAgent.includes('Mobile')) deviceType = 'mobile'
      } else if (userAgent.includes('Mac OS X')) {
        if (osName === 'unknown') {
          osName = 'macOS'
          const match = userAgent.match(/Mac OS X (\d+[._]\d+)/)
          osVersion = match ? match[1].replace('_', '.') : 'unknown'
        }
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
        if (osName === 'unknown') {
          osName = 'Android'
          const match = userAgent.match(/Android (\d+(?:\.\d+)?)/)
          osVersion = match ? match[1] : 'unknown'
        }
        deviceType = 'mobile'
        if (userAgent.includes('Tablet')) deviceType = 'tablet'

      // Улучшенный парсинг для Android устройств
      // Samsung
      if (userAgent.includes('Samsung') || userAgent.match(/SM-[A-Z0-9]+/i)) {
        deviceBrand = 'Samsung'
        const modelMatch = userAgent.match(/SM-([A-Z0-9]+)/i) || userAgent.match(/Samsung[^;]*([A-Z0-9-]+)/i)
        if (modelMatch) {
          deviceModel = modelMatch[1]
        } else {
          deviceModel = 'Galaxy'
        }
      }
      // Huawei / Honor - улучшенный парсинг
      else if (userAgent.includes('Huawei') || userAgent.includes('HUAWEI') || userAgent.includes('HONOR') || userAgent.includes('Honor')) {
        deviceBrand = 'Huawei'
        // Пытаемся найти модель в различных форматах Huawei
        // Форматы: HW-XXX, ANA-XXX, DUK-XXX, BLA-XXX, LYA-XXX, etc.
        const huaweiModelMatch = userAgent.match(/(?:Huawei|HUAWEI|HONOR|Honor)[\s-]?([A-Z0-9]+(?:-[A-Z0-9]+)?)/i) ||
          userAgent.match(/([A-Z]{2,3}[A-Z0-9]{2,}(?:-[A-Z0-9]+)?)/) ||
          userAgent.match(/Build\/([A-Z]{2,}\d{2,}[A-Z]?)/i) ||
          userAgent.match(/([A-Z]{2,}\d{2,}[A-Z]?)[\s;]/)
        if (huaweiModelMatch && huaweiModelMatch[1]) {
          const model = huaweiModelMatch[1]
          // Фильтруем слишком короткие или нерелевантные совпадения
          if (model.length >= 3 && !model.match(/^(SM|SM-|Android|Chrome|Linux|Mobile|Safari)/i)) {
            deviceModel = model
          } else {
            deviceModel = 'Huawei'
          }
        } else {
          deviceModel = 'Huawei'
        }
      }
      // Xiaomi / Redmi / POCO
      else if (userAgent.includes('Xiaomi') || userAgent.includes('Redmi') || userAgent.includes('POCO') || userAgent.includes('Mi ')) {
        deviceBrand = 'Xiaomi'
        const xiaomiModelMatch = userAgent.match(/(?:Xiaomi|Redmi|POCO|Mi )([A-Z0-9]+(?:-[A-Z0-9]+)?)/i)
        if (xiaomiModelMatch) {
          deviceModel = xiaomiModelMatch[1]
        } else {
          deviceModel = 'Xiaomi'
        }
      }
      // OnePlus
      else if (userAgent.includes('OnePlus') || userAgent.includes('ONEPLUS')) {
        deviceBrand = 'OnePlus'
        const oneplusModelMatch = userAgent.match(/(?:ONEPLUS|OnePlus)[\s-]?([A-Z0-9]+)/i)
        if (oneplusModelMatch) {
          deviceModel = oneplusModelMatch[1]
        } else {
          deviceModel = 'OnePlus'
        }
      }
      // Google Pixel
      else if (userAgent.includes('Pixel')) {
        deviceBrand = 'Google'
        const pixelModelMatch = userAgent.match(/Pixel[\s-]?([0-9a-z]+)/i)
        if (pixelModelMatch) {
          deviceModel = `Pixel ${pixelModelMatch[1]}`
        } else {
          deviceModel = 'Pixel'
        }
      }
      // Realme
      else if (userAgent.includes('Realme') || userAgent.includes('REALME')) {
        deviceBrand = 'Realme'
        const realmeModelMatch = userAgent.match(/(?:Realme|REALME)[\s-]?([A-Z0-9]+)/i)
        if (realmeModelMatch) {
          deviceModel = realmeModelMatch[1]
        } else {
          deviceModel = 'Realme'
        }
      }
      // Oppo
      else if (userAgent.includes('OPPO') || userAgent.includes('Oppo')) {
        deviceBrand = 'Oppo'
        const oppoModelMatch = userAgent.match(/(?:OPPO|Oppo)[\s-]?([A-Z0-9]+)/i)
        if (oppoModelMatch) {
          deviceModel = oppoModelMatch[1]
        } else {
          deviceModel = 'Oppo'
        }
      }
      // Vivo
      else if (userAgent.includes('VIVO') || userAgent.includes('Vivo')) {
        deviceBrand = 'Vivo'
        const vivoModelMatch = userAgent.match(/(?:VIVO|Vivo)[\s-]?([A-Z0-9]+)/i)
        if (vivoModelMatch) {
          deviceModel = vivoModelMatch[1]
        } else {
          deviceModel = 'Vivo'
        }
      }
      // Motorola
      else if (userAgent.includes('Moto') || userAgent.includes('MOTOROLA')) {
        deviceBrand = 'Motorola'
        const motoModelMatch = userAgent.match(/(?:Moto|MOTOROLA)[\s-]?([A-Z0-9]+)/i)
        if (motoModelMatch) {
          deviceModel = motoModelMatch[1]
        } else {
          deviceModel = 'Motorola'
        }
      }
      // Sony
      else if (userAgent.includes('Xperia') || userAgent.includes('Sony')) {
        deviceBrand = 'Sony'
        const sonyModelMatch = userAgent.match(/(?:Xperia|Sony)[\s-]?([A-Z0-9]+)/i)
        if (sonyModelMatch) {
          deviceModel = sonyModelMatch[1]
        } else {
          deviceModel = 'Xperia'
        }
      }
      } else if (userAgent.includes('Linux')) {
        if (osName === 'unknown') {
          osName = 'Linux'
        }
        deviceType = 'desktop'
      }
    }

    // Дополнительная информация об устройстве через User-Agent Client Hints API
    // Это более точный способ определения устройства, если браузер поддерживает
    let hintBrandCandidate = null
    const hintData = await getUserAgentHints()

    // Используем данные из User-Agent Client Hints, если они доступны
    // Это более точный способ определения устройства
    if (hintData) {
      // Используем модель из Client Hints, если она доступна и более точная
      if (hintData.hintModel) {
        // Если модель из парсинга не определена или слишком общая, используем из hints
        if (deviceModel === 'unknown' ||
            deviceModel === 'Huawei' ||
            deviceModel === 'Xiaomi' ||
            deviceModel === 'Samsung' ||
            deviceModel === 'OnePlus') {
          deviceModel = hintData.hintModel
        }
      }

      // Определяем бренд из brands в Client Hints
      if (hintData.brands && Array.isArray(hintData.brands) && hintData.brands.length > 0) {
        // Ищем бренд устройства, исключая бренды браузеров
        const browserBrands = ['chrome', 'chromium', 'google chrome', 'safari', 'firefox', 'edge', 'opera', 'yandex', 'microsoft edge']
        const deviceBrandHint = hintData.brands.find(brand => {
          const brandName = brand.brand.toLowerCase()
          return !browserBrands.includes(brandName)
        })

        if (deviceBrandHint) {
          hintBrandCandidate = deviceBrandHint.brand
          // Если бренд не определен или слишком общий, используем из hints
          if (deviceBrand === 'unknown') {
            deviceBrand = deviceBrandHint.brand
          }
        }
      }

      // Если есть hintModel, но нет бренда, пытаемся определить из модели
      if (hintData.hintModel && (deviceBrand === 'unknown' || deviceModel === hintData.hintModel)) {
        const modelLower = hintData.hintModel.toLowerCase()
        if (modelLower.includes('huawei') || modelLower.includes('honor')) {
          deviceBrand = 'Huawei'
        } else if (modelLower.includes('xiaomi') || modelLower.includes('redmi') || modelLower.includes('poco')) {
          deviceBrand = 'Xiaomi'
        } else if (modelLower.includes('samsung') || modelLower.includes('galaxy') || modelLower.startsWith('sm-')) {
          deviceBrand = 'Samsung'
        } else if (modelLower.includes('pixel')) {
          deviceBrand = 'Google'
        } else if (modelLower.includes('oneplus')) {
          deviceBrand = 'OnePlus'
        } else if (modelLower.includes('realme')) {
          deviceBrand = 'Realme'
        } else if (modelLower.includes('oppo')) {
          deviceBrand = 'Oppo'
        } else if (modelLower.includes('vivo')) {
          deviceBrand = 'Vivo'
        }
      }
    }

    const resolvedBrand = resolveDeviceBrand({
      brandCandidates: [
        deviceBrand,
        parserData?.device?.vendor,
        hintBrandCandidate
      ],
      modelCandidates: [
        deviceModel,
        parserData?.device?.model,
        hintData?.hintModel
      ]
    })

    if (resolvedBrand) {
      deviceBrand = resolvedBrand
    } else {
      deviceBrand = 'unknown'
    }

    const sanitizedModelCandidates = [
      deviceModel,
      parserData?.device?.model,
      hintData?.hintModel
    ]
      .map((candidate) => {
        if (candidate === null || candidate === undefined) {
          return ''
        }
        return String(candidate).trim()
      })
      .filter(Boolean)

    const resolvedModel = sanitizedModelCandidates.find((modelCandidate) => {
      if (!resolvedBrand) return true
      return modelCandidate.toLowerCase() !== resolvedBrand.toLowerCase()
    })

    if (resolvedModel) {
      deviceModel = resolvedModel
    } else if (sanitizedModelCandidates.length > 0) {
      deviceModel = sanitizedModelCandidates[0]
    } else {
      deviceModel = 'unknown'
    }

    // Используем данные из UAParser для устройства, если они доступны и более точные
    // Это особенно полезно для Android устройств, где парсинг User-Agent сложный
    if (parserData?.device && (deviceBrand === 'unknown' || deviceModel === 'unknown' || deviceModel === deviceBrand)) {
      const device = parserData.device

      // Используем модель из UAParser, если она более точная
      if (device.model && (deviceModel === 'unknown' || deviceModel === deviceBrand)) {
        deviceModel = device.model
      }

      // Используем vendor из UAParser, если он более точный
      if (device.vendor && (deviceBrand === 'unknown' || deviceModel === deviceBrand)) {
        deviceBrand = device.vendor
      }

      // Если модель определена через парсер, но бренд нет, пытаемся определить по модели
      if (device.model && !device.vendor && deviceBrand === 'unknown') {
        const modelLower = device.model.toLowerCase()
        if (modelLower.includes('huawei') || modelLower.includes('honor')) {
          deviceBrand = 'Huawei'
        } else if (modelLower.includes('xiaomi') || modelLower.includes('redmi') || modelLower.includes('poco')) {
          deviceBrand = 'Xiaomi'
        } else if (modelLower.includes('samsung') || modelLower.includes('galaxy') || modelLower.startsWith('sm-')) {
          deviceBrand = 'Samsung'
        } else if (modelLower.includes('pixel')) {
          deviceBrand = 'Google'
        } else if (modelLower.includes('oneplus')) {
          deviceBrand = 'OnePlus'
        } else if (modelLower.includes('realme')) {
          deviceBrand = 'Realme'
        } else if (modelLower.includes('oppo')) {
          deviceBrand = 'Oppo'
        } else if (modelLower.includes('vivo')) {
          deviceBrand = 'Vivo'
        }
      }

      // Используем тип устройства из UAParser, если он определен
      if (device.type && (deviceType === 'unknown' || (deviceType === 'desktop' && device.type !== 'mobile'))) {
        if (device.type === 'mobile') {
          deviceType = 'mobile'
        } else if (device.type === 'tablet') {
          deviceType = 'tablet'
        }
      }
    }

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
    trackScreenModeChange,
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
