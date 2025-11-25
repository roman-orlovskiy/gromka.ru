import { computed, ref } from 'vue'

export const useCamera = () => {
  const cameraMethod = ref('environment')
  const camera = ref(null)
  const devices = ref([])
  const isFlashlightOn = ref(false)
  const isFlashlightSupported = ref(null)
  const cachedStream = ref(null)
  const lastUsedMethod = ref(null) // Сохраняем метод, который использовался для включения
  const preferredRearLabels = /(main|primary|rear|back|environment|wide|tele|задн|основн)/i
  const labelPriority = ['main', 'primary', 'rear', 'back', 'environment', 'wide', 'tele', 'camera 0', '0']

  // Определение платформы и устройства
  const userAgent = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /Android/i.test(userAgent)
  const isSamsung = /Samsung|SM-|Galaxy/i.test(userAgent)
  const isHuawei = /Huawei|Honor|HUAWEI/i.test(userAgent)
  const isXiaomi = /Xiaomi|Mi |Redmi|POCO/i.test(userAgent)
  const isOnePlus = /OnePlus/i.test(userAgent)
  const isOppo = /OPPO/i.test(userAgent)
  const isVivo = /vivo/i.test(userAgent)
  const isGoogle = /Pixel/i.test(userAgent)
  const isRealme = /Realme/i.test(userAgent)

  // Определение браузера
  const isChrome = /Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)
  const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)
  const isFirefox = /Firefox/i.test(userAgent)
  const isYandex = /YaBrowser/i.test(userAgent)

  // Получение информации о платформе
  const getPlatformInfo = () => {
    let deviceBrand = 'unknown'
    let deviceType = 'unknown'
    let osName = 'unknown'
    let osVersion = 'unknown'
    let browserName = 'unknown'

    // Определяем бренд устройства
    if (isIOS) {
      deviceBrand = 'Apple'
      deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile'
      osName = 'iOS'
      const match = userAgent.match(/OS (\d+[_.]\d+)/)
      osVersion = match ? match[1].replace('_', '.') : 'unknown'
    } else if (isAndroid) {
      deviceType = /Mobile/.test(userAgent) ? 'mobile' : 'tablet'
      osName = 'Android'
      const match = userAgent.match(/Android (\d+\.?\d*)/)
      osVersion = match ? match[1] : 'unknown'

      if (isSamsung) deviceBrand = 'Samsung'
      else if (isHuawei) deviceBrand = 'Huawei'
      else if (isXiaomi) deviceBrand = 'Xiaomi'
      else if (isOnePlus) deviceBrand = 'OnePlus'
      else if (isOppo) deviceBrand = 'OPPO'
      else if (isVivo) deviceBrand = 'Vivo'
      else if (isGoogle) deviceBrand = 'Google'
      else if (isRealme) deviceBrand = 'Realme'
      else deviceBrand = 'Android (other)'
    } else {
      deviceType = 'desktop'
      if (/Windows/i.test(userAgent)) osName = 'Windows'
      else if (/Mac/i.test(userAgent)) osName = 'macOS'
      else if (/Linux/i.test(userAgent)) osName = 'Linux'
    }

    // Определяем браузер
    if (isYandex) browserName = 'Yandex'
    else if (isChrome) browserName = 'Chrome'
    else if (isSafari) browserName = 'Safari'
    else if (isFirefox) browserName = 'Firefox'
    else if (/Edge|Edg/i.test(userAgent)) browserName = 'Edge'

    return {
      deviceBrand,
      deviceType,
      osName,
      osVersion,
      browserName,
      isIOS,
      isAndroid,
      isSamsung,
      isHuawei,
      isXiaomi,
      userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints || 0
    }
  }

  // Базовые constraints без torch (torch применяем отдельно для совместимости)
  const baseVideoConstraints = computed(() => ({
    width: { ideal: 640, max: 1280 },
    height: { ideal: 480, max: 720 },
    frameRate: { ideal: 15, max: 30 }
  }))

  // Задержка для ожидания готовности torch (особенно на iOS)
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  // Утилита: остановка стрима
  const stopStream = (stream) => {
    if (stream && stream.getTracks) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const refreshDevices = async () => {
    const availableDevices = await navigator.mediaDevices.enumerateDevices()
    devices.value = availableDevices
    return availableDevices
  }

  const labelScore = (label = '') => {
    const normalized = label.toLowerCase()
    const index = labelPriority.findIndex(priority => normalized.includes(priority))
    return index === -1 ? labelPriority.length : index
  }

  // Метод 1: facingMode ideal (работает на большинстве устройств)
  const requestStreamWithFacingModeIdeal = () => {
    return navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        ...baseVideoConstraints.value
      }
    })
  }

  // Метод 2: facingMode exact (лучше работает на iOS)
  const requestStreamWithFacingModeExact = () => {
    return navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { exact: 'environment' },
        ...baseVideoConstraints.value
      }
    })
  }

  // Метод 3: facingMode simple (для старых браузеров)
  const requestStreamWithFacingModeSimple = () => {
    return navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        ...baseVideoConstraints.value
      }
    })
  }

  // Метод 4: по deviceId конкретной камеры
  const requestStreamByDeviceId = async (deviceId) => {
    return navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        ...baseVideoConstraints.value
      }
    })
  }

  // Метод 5: простой запрос видео без ограничений (fallback)
  const requestStreamSimple = () => {
    return navigator.mediaDevices.getUserMedia({
      video: true
    })
  }

  // Получение всех задних камер, отсортированных по приоритету
  const getRearCameras = async () => {
    const availableDevices = devices.value.length ? devices.value : await refreshDevices()
    const videoCameras = availableDevices.filter(d => d.kind === 'videoinput')

    // Сортируем камеры: сначала с labels, потом по приоритету
    const rearCameras = videoCameras
      .filter(d => {
        const label = (d.label || '').toLowerCase()
        // Исключаем фронтальные камеры
        if (/front|передн|selfie|face/i.test(label)) return false
        // Включаем камеры с метками задней камеры или без метки (попробуем)
        return preferredRearLabels.test(label) || !label
      })
      .sort((a, b) => labelScore(a.label) - labelScore(b.label))

    return rearCameras
  }

  // Проверка наличия torch в стриме с задержкой для iOS
  const checkTorchSupport = async (stream) => {
    const track = stream.getVideoTracks()[0]
    if (!track) return false

    // На iOS нужна небольшая задержка перед проверкой capabilities
    if (isIOS) {
      await delay(100)
    }

    const capabilities = track.getCapabilities?.()
    return capabilities?.torch === true
  }

  // Попытка включить torch с retry для надежности
  const tryEnableTorch = async (track, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await track.applyConstraints({ advanced: [{ torch: true }] })
        return true
      } catch {
        if (i < retries - 1) {
          // Ждем перед повторной попыткой
          await delay(100 * (i + 1))
        }
      }
    }
    return false
  }

  // Универсальный метод получения стрима с torch
  // Пробует несколько методов в порядке приоритета для максимальной совместимости
  // logCallbacks: { trackFlashlightChange, logCameraAttempt, logPlatformInfo }
  const ensureRearCameraStream = async (logCallbacks = null) => {
    const { trackFlashlightChange, logCameraAttempt, logPlatformInfo } = logCallbacks || {}

    // Логируем детальную информацию о платформе и устройстве
    if (logPlatformInfo) {
      logPlatformInfo(getPlatformInfo())
    }

    const methods = []

    // Определяем порядок методов в зависимости от платформы
    if (isIOS) {
      // Для iOS: exact лучше работает
      methods.push(
        { name: 'facingMode-exact', fn: requestStreamWithFacingModeExact },
        { name: 'facingMode-ideal', fn: requestStreamWithFacingModeIdeal },
        { name: 'facingMode-simple', fn: requestStreamWithFacingModeSimple }
      )
    } else if (isSamsung) {
      // Для Samsung: сначала пробуем facingMode, потом deviceId
      methods.push(
        { name: 'facingMode-ideal', fn: requestStreamWithFacingModeIdeal },
        { name: 'facingMode-exact', fn: requestStreamWithFacingModeExact }
      )
    } else {
      // Для остальных Android и других платформ
      methods.push(
        { name: 'facingMode-ideal', fn: requestStreamWithFacingModeIdeal },
        { name: 'facingMode-exact', fn: requestStreamWithFacingModeExact },
        { name: 'facingMode-simple', fn: requestStreamWithFacingModeSimple }
      )
    }

    // Логируем начало поиска камеры
    if (logCameraAttempt) {
      logCameraAttempt({
        stage: 'start',
        methodsToTry: methods.map(m => m.name),
        platform: isIOS ? 'iOS' : isSamsung ? 'Samsung' : 'other'
      })
    }

    let lastError = null
    let bestStream = null
    let bestMethod = null
    let attemptNumber = 0

    // Пробуем каждый метод facingMode
    for (const method of methods) {
      attemptNumber++
      try {
        // Логируем попытку
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'trying',
            attempt: attemptNumber,
            method: method.name,
            type: 'facingMode'
          })
        }

        const stream = await method.fn()

        // Логируем успешное получение стрима
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'stream_obtained',
            attempt: attemptNumber,
            method: method.name,
            success: true
          })
        }

        // Логируем попытку включения (для trackFlashlightChange)
        if (trackFlashlightChange) {
          trackFlashlightChange(false, method.name)
        }

        // Проверяем поддержку torch
        const hasTorch = await checkTorchSupport(stream)

        // Логируем результат проверки torch
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'torch_check',
            attempt: attemptNumber,
            method: method.name,
            hasTorch
          })
        }

        if (hasTorch) {
          // Нашли камеру с torch
          if (logCameraAttempt) {
            logCameraAttempt({
              stage: 'success',
              attempt: attemptNumber,
              method: method.name,
              hasTorch: true
            })
          }
          await refreshDevices()
          return { stream, method: method.name }
        }

        // Камера без torch - сохраняем как запасной вариант
        if (!bestStream) {
          bestStream = stream
          bestMethod = method.name
        } else {
          stopStream(stream)
        }
      } catch (error) {
        // Логируем неудачную попытку
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'error',
            attempt: attemptNumber,
            method: method.name,
            error: error.message
          })
        }
        if (trackFlashlightChange) {
          trackFlashlightChange(false, method.name)
        }
        lastError = error
      }
    }

    // Пробуем получить камеры по deviceId
    try {
      const rearCameras = await getRearCameras()

      // Логируем найденные камеры
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'deviceId_cameras_found',
          cameras: rearCameras.map(c => ({
            deviceId: c.deviceId?.slice(0, 8),
            label: c.label
          }))
        })
      }

      for (const camera of rearCameras) {
        if (!camera.deviceId) continue
        attemptNumber++

        try {
          const cameraLabel = camera.label || 'unknown'

          // Логируем попытку
          if (logCameraAttempt) {
            logCameraAttempt({
              stage: 'trying',
              attempt: attemptNumber,
              method: `deviceId:${cameraLabel}`,
              type: 'deviceId',
              deviceId: camera.deviceId.slice(0, 8)
            })
          }

          const stream = await requestStreamByDeviceId(camera.deviceId)

          // Логируем успешное получение стрима
          if (logCameraAttempt) {
            logCameraAttempt({
              stage: 'stream_obtained',
              attempt: attemptNumber,
              method: `deviceId:${cameraLabel}`,
              success: true
            })
          }

          if (trackFlashlightChange) {
            trackFlashlightChange(false, `deviceId:${cameraLabel}`)
          }

          const hasTorch = await checkTorchSupport(stream)

          // Логируем результат проверки torch
          if (logCameraAttempt) {
            logCameraAttempt({
              stage: 'torch_check',
              attempt: attemptNumber,
              method: `deviceId:${cameraLabel}`,
              hasTorch
            })
          }

          if (hasTorch) {
            // Нашли камеру с torch
            if (logCameraAttempt) {
              logCameraAttempt({
                stage: 'success',
                attempt: attemptNumber,
                method: `deviceId:${cameraLabel}`,
                hasTorch: true
              })
            }
            if (bestStream) stopStream(bestStream)
            await refreshDevices()
            return { stream, method: `deviceId:${cameraLabel}` }
          }

          // Камера без torch - сохраняем как запасной вариант
          if (!bestStream) {
            bestStream = stream
            bestMethod = `deviceId:${cameraLabel}`
          } else {
            stopStream(stream)
          }
        } catch (error) {
          // Логируем неудачную попытку
          if (logCameraAttempt) {
            logCameraAttempt({
              stage: 'error',
              attempt: attemptNumber,
              method: `deviceId:${camera.label || 'unknown'}`,
              error: error.message
            })
          }
          if (trackFlashlightChange) {
            trackFlashlightChange(false, `deviceId:${camera.label || 'unknown'}`)
          }
          lastError = error
        }
      }
    } catch (error) {
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'error',
          method: 'getRearCameras',
          error: error.message
        })
      }
      lastError = error
    }

    // Последняя попытка: простой запрос без ограничений
    if (!bestStream) {
      attemptNumber++
      try {
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'trying',
            attempt: attemptNumber,
            method: 'simple',
            type: 'fallback'
          })
        }

        bestStream = await requestStreamSimple()
        bestMethod = 'simple'

        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'stream_obtained',
            attempt: attemptNumber,
            method: 'simple',
            success: true
          })
        }
        if (trackFlashlightChange) {
          trackFlashlightChange(false, 'simple')
        }
      } catch (error) {
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'error',
            attempt: attemptNumber,
            method: 'simple',
            error: error.message
          })
        }
        if (trackFlashlightChange) {
          trackFlashlightChange(false, 'simple')
        }
        throw lastError || error
      }
    }

    // Логируем финальный результат (нет torch, но есть стрим)
    if (logCameraAttempt) {
      logCameraAttempt({
        stage: 'finish',
        method: bestMethod,
        hasTorch: false,
        totalAttempts: attemptNumber
      })
    }

    await refreshDevices()
    return { stream: bestStream, method: bestMethod }
  }

  // Включение фонарика - универсальный метод с поддержкой разных устройств
  // logCallbacks: { trackFlashlightChange, logCameraAttempt, logPlatformInfo } или function (для обратной совместимости)
  const turnOnFlashlight = async (logCallbacks = null) => {
    // Обратная совместимость: если передана функция, оборачиваем её
    const callbacks = typeof logCallbacks === 'function'
      ? { trackFlashlightChange: logCallbacks }
      : logCallbacks

    const { trackFlashlightChange, logCameraAttempt } = callbacks || {}

    if (isFlashlightOn.value) {
      // Если фонарик уже включен, но передан callback, логируем это
      const method = lastUsedMethod.value || 'cached'
      if (trackFlashlightChange) {
        trackFlashlightChange(true, method)
      }
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'already_on',
          method
        })
      }
      return { success: true, method }
    }

    let stream = cachedStream.value
    let usedMethod = 'cached'
    const isCached = !!stream

    try {
      // Если нет кэшированного стрима, создаем новый
      if (!stream) {
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'no_cached_stream',
            action: 'creating_new'
          })
        }
        // Передаем callbacks для логирования попыток получения стрима разными методами
        const result = await ensureRearCameraStream(callbacks)
        stream = result.stream
        usedMethod = result.method
        // НЕ кэшируем стрим здесь - кэшируем только после успешного включения torch
      } else {
        // Используем кэшированный стрим - быстрый путь
        usedMethod = lastUsedMethod.value || 'cached'
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'using_cached_stream',
            method: usedMethod
          })
        }
      }

      const videoTrack = stream.getVideoTracks()[0]

      // Для кэшированного стрима пропускаем проверку torch (уже знаем, что работает)
      // Для нового стрима проверяем поддержку torch
      let hasTorch = isCached
      if (!isCached) {
        hasTorch = await checkTorchSupport(stream)
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'torch_check_before_enable',
            hasTorch,
            method: usedMethod
          })
        }
      }

      if (hasTorch) {
        // Для кэшированного стрима — быстрое включение без retry
        // Для нового стрима — с retry для надежности
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'enabling_torch',
            method: usedMethod,
            fastPath: isCached
          })
        }

        let success
        if (isCached) {
          // Быстрый путь для кэшированного стрима
          try {
            await videoTrack.applyConstraints({ advanced: [{ torch: true }] })
            success = true
          } catch {
            // Если не удалось — пробуем с retry
            success = await tryEnableTorch(videoTrack)
          }
        } else {
          // Новый стрим — с retry для надежности
          success = await tryEnableTorch(videoTrack)
        }

        if (success) {
          // Кэшируем стрим ТОЛЬКО после успешного включения torch
          cachedStream.value = stream
        camera.value = stream
        isFlashlightOn.value = true
        lastUsedMethod.value = usedMethod

        // Логируем успешное включение
          if (trackFlashlightChange) {
            trackFlashlightChange(true, usedMethod)
          }
          if (logCameraAttempt) {
            logCameraAttempt({
              stage: 'torch_enabled',
              success: true,
              method: usedMethod,
              cached: true
            })
        }

        return { success: true, method: usedMethod }
      } else {
          if (logCameraAttempt) {
            logCameraAttempt({
              stage: 'torch_enable_failed',
              method: usedMethod,
              reason: 'tryEnableTorch returned false'
            })
          }
        }
      }

      // Torch не поддерживается или не удалось включить
      // Останавливаем стрим, чтобы не держать камеру занятой
      if (stream && !cachedStream.value) {
        stopStream(stream)
      }

      const error = new Error('Torch не поддерживается на этом устройстве')

      // Логируем неудачное включение
      if (trackFlashlightChange) {
        trackFlashlightChange(false, usedMethod)
      }
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'torch_not_supported',
          method: usedMethod,
          hasTorch: false,
          streamStopped: true
        })
      }

      throw error
    } catch (error) {
      // Останавливаем стрим при ошибке, если он не был закэширован
      if (stream && !cachedStream.value) {
        stopStream(stream)
      }

      // Логируем ошибку включения
      if (trackFlashlightChange) {
        trackFlashlightChange(false, usedMethod || 'unknown')
      }
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'error',
          method: usedMethod || 'unknown',
          error: error.message,
          streamStopped: true
        })
      }
      throw error
    }
  }

  // Выключение фонарика с retry для надежности
  // logCallbacks: { trackFlashlightChange, logCameraAttempt } или function (для обратной совместимости)
  const turnOffFlashlight = async (logCallbacks = null) => {
    // Обратная совместимость: если передана функция, оборачиваем её
    const callbacks = typeof logCallbacks === 'function'
      ? { trackFlashlightChange: logCallbacks }
      : logCallbacks

    const { trackFlashlightChange, logCameraAttempt } = callbacks || {}

    if (!isFlashlightOn.value) {
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'already_off'
        })
      }
      return
    }

    // Получаем метод, который использовался для включения
    const method = lastUsedMethod.value || 'unknown'

    if (cachedStream.value) {
      const videoTrack = cachedStream.value.getVideoTracks()[0]
      if (videoTrack?.getCapabilities?.()?.torch) {
        // Пробуем выключить с retry
        let success = false
        for (let i = 0; i < 3; i++) {
          try {
        await videoTrack.applyConstraints({ advanced: [{ torch: false }] })
            success = true
            break
          } catch {
            if (i < 2) await delay(50)
          }
        }

        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'torch_disabled',
            success,
            method,
            retries: success ? 1 : 3
          })
        }
      }
    }
    isFlashlightOn.value = false

    // Логируем выключение с правильным методом
    if (trackFlashlightChange) {
      trackFlashlightChange(false, method)
    }
  }

  // Проверка поддержки фонарика - просто пытается включить и возвращает true/false
  // logCallbacks: { trackFlashlightChange, logCameraAttempt, logPlatformInfo } или function (для обратной совместимости)
  const checkFlashlightSupport = async (logCallbacks = null) => {
    // Обратная совместимость: если передана функция, оборачиваем её
    const callbacks = typeof logCallbacks === 'function'
      ? { trackFlashlightChange: logCallbacks }
      : logCallbacks

    const { trackFlashlightChange, logCameraAttempt } = callbacks || {}

    // Если поддержка уже проверена, но передан callback, логируем текущее состояние
    if (isFlashlightSupported.value !== null) {
      if (trackFlashlightChange) {
        const method = lastUsedMethod.value || 'cached'
        trackFlashlightChange(isFlashlightOn.value, method)
      }
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'already_checked',
          isSupported: isFlashlightSupported.value,
          isOn: isFlashlightOn.value,
          method: lastUsedMethod.value || 'cached'
        })
      }
      return isFlashlightSupported.value
    }

    if (logCameraAttempt) {
      logCameraAttempt({
        stage: 'checking_support',
        action: 'starting'
      })
    }

    try {
      await turnOnFlashlight(callbacks)
      isFlashlightSupported.value = true

      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'support_check_complete',
          isSupported: true,
          method: lastUsedMethod.value
        })
      }

      return true
    } catch {
      isFlashlightSupported.value = false

      // Логируем финальную неудачную попытку
      if (trackFlashlightChange) {
        trackFlashlightChange(false, 'unknown')
      }
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'support_check_complete',
          isSupported: false,
          reason: 'all_methods_failed'
        })
      }

      return false
    }
  }

  // Очистка кэша
  const clearCache = () => {
    if (cachedStream.value) {
      stopStream(cachedStream.value)
      cachedStream.value = null
    }
    isFlashlightSupported.value = null
    lastUsedMethod.value = null
  }

  return {
    cameraMethod,
    camera,
    devices,
    isFlashlightOn,
    isFlashlightSupported,
    turnOnFlashlight,
    turnOffFlashlight,
    checkFlashlightSupport,
    clearCache,
    refreshDevices,
  }
}
