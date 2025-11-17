import { ref } from 'vue'

export const useCamera = () => {
  const camera = ref(null)
  const devices = ref([])
  const isFlashlightOn = ref(false)
  const isFlashlightSupported = ref(null) // null = не проверено, true/false = результат проверки
  const error = ref(null)

  // Кэш для оптимизации
  const cachedMethod = ref(null) // Кэшированный успешный метод
  const cachedStream = ref(null) // Кэшированный стрим
  const isProcessing = ref(false) // Флаг для предотвращения множественных вызовов
  const isInitialized = ref(false) // Флаг инициализации
  const backCameras = ref([]) // Предзагруженные back камеры
  const allCameras = ref([]) // Предзагруженные все камеры
  const lastUsedMethod = ref(null) // Последний использованный метод включения камеры

  // Инициализация - предзагрузка устройств
  const initialize = async () => {
    if (isInitialized.value) return

    try {
      // 1. СНАЧАЛА получаем разрешение на камеру
      let tempStream
      try {
        tempStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // пробуем заднюю камеру
        })
      } catch {
        // Если не получилось с environment, пробуем любую камеру
        tempStream = await navigator.mediaDevices.getUserMedia({
          video: true
        })
      }

      // 2. ТЕПЕРЬ перечисляем устройства (deviceId и label будут заполнены)
      devices.value = await navigator.mediaDevices.enumerateDevices()

      // 3. Останавливаем временный поток
      stopStream(tempStream)

      // 4. Фильтруем back камеры с РЕАЛЬНЫМИ labels
      backCameras.value = devices.value.filter(device => {
        const label = device.label.toLowerCase()
        return device.kind === 'videoinput' && (
          label.includes('back') ||
          label.includes('rear') ||
          label.includes('задняя') ||
          label.includes('environment')
        )
      })

      // Предзагружаем все камеры
      allCameras.value = devices.value.filter(device => device.kind === 'videoinput')

      isInitialized.value = true
    } catch (err) {
      error.value = `Ошибка инициализации устройств: ${err.message}`
      throw err // пробрасываем ошибку дальше
    }
  }

  const getDevices = async () => {
    if (!isInitialized.value) {
      await initialize()
    }
  }

  // Утилита: остановка стрима
  const stopStream = (stream) => {
    if (stream && stream.getTracks) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  // Утилита: проверка и применение torch к стриму
  const applyTorchToStream = async (stream) => {
    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack && videoTrack.getCapabilities && videoTrack.getCapabilities().torch) {
      await videoTrack.applyConstraints({ advanced: [{ torch: true }] })
      camera.value = stream
      return true
    }
    return false
  }

  // Утилита: создание video constraints
  const getVideoConstraints = (deviceId = null) => {
    const baseConstraints = {
      torch: true,
      width: { ideal: 320 },
      height: { ideal: 240 },
      frameRate: { ideal: 15 }
    }

    if (deviceId) {
      return {
        deviceId: { exact: deviceId },
        ...baseConstraints
      }
    }

    return baseConstraints
  }

  // Универсальный метод для включения/выключения фонарика
  const toggleFlashlight = async (forceOn = null) => {
    // Предотвращаем множественные вызовы
    if (isProcessing.value) {
      return
    }

    isProcessing.value = true

    try {
      error.value = null

      // Если фонарик уже включен и не принудительно включаем
      if (isFlashlightOn.value && forceOn !== true) {
        await turnOffFlashlight()
        return
      }

      // Если фонарик выключен и не принудительно выключаем
      if (!isFlashlightOn.value && forceOn !== false) {
        await turnOnFlashlight()
        return
      }
    } catch (err) {
      error.value = `Ошибка управления фонариком: ${err.message}`
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  // Включение фонарика с параллельными попытками
  const turnOnFlashlight = async () => {
    // Если уже знаем, что фонарик не поддерживается, не пытаемся
    if (isFlashlightSupported.value === false) {
      throw new Error('Фонарик не поддерживается на этом устройстве')
    }

    // Если фонарик уже включен, ничего не делаем
    if (isFlashlightOn.value) {
      return
    }

    try {
      // Инициализируем устройства если нужно
      await initialize()

      // Если есть кэшированный метод, пробуем его первым
      if (cachedMethod.value) {
        if (await tryCachedMethod()) {
          isFlashlightOn.value = true
          return
        }
      }

      // Параллельные попытки всех методов
      const methods = [
        tryEnvironmentTorch(),
        tryBackCameraTorch(),
        tryAnyCameraTorch()
      ]

      // Используем Promise.race для быстрого результата
      const results = await Promise.allSettled(methods)

      for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'fulfilled' && results[i].value) {
          const methodNames = ['environment', 'back', 'any']
          cachedMethod.value = methodNames[i]
          lastUsedMethod.value = methodNames[i]
          isFlashlightOn.value = true
          return
        }
      }

      throw new Error('Не удалось включить фонарик ни одним из доступных методов')
    } catch (err) {
      error.value = `Ошибка включения фонарика: ${err.message}`
      throw err
    }
  }

  // Быстрое выключение фонарика
  const turnOffFlashlight = async () => {
    // Если фонарик уже выключен, ничего не делаем
    if (!isFlashlightOn.value) {
      return
    }

    try {
      // Минимальные операции - только выключение torch
      if (camera.value && camera.value.getTracks) {
        const videoTrack = camera.value.getVideoTracks()[0]
        if (videoTrack?.getCapabilities?.()?.torch) {
          await videoTrack.applyConstraints({ advanced: [{ torch: false }] })
        }
      }

      isFlashlightOn.value = false
    } catch (err) {
      error.value = `Ошибка выключения фонарика: ${err.message}`
      throw err
    }
  }

  // Попытка использовать кэшированный метод
  const tryCachedMethod = async () => {
    try {
      switch (cachedMethod.value) {
        case 'environment':
          return await tryEnvironmentTorch(true)
        case 'back':
          return await tryBackCameraTorch(true)
        case 'any':
          return await tryAnyCameraTorch(true)
        default:
          return false
      }
    } catch {
      // Если кэшированный метод не работает, очищаем кэш
      cachedMethod.value = null
      return false
    }
  }

  // Метод 1: Попытка использовать environment с torch (минимальные constraints)
  const tryEnvironmentTorch = async (useCache = false) => {
    try {
      let stream

      // Если используем кэш и есть кэшированный стрим
      if (useCache && cachedStream.value) {
        stream = cachedStream.value
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            ...getVideoConstraints()
          }
        })

        // Кэшируем стрим только если он новый
        if (!useCache) {
          cachedStream.value = stream
        }
      }

      if (await applyTorchToStream(stream)) {
        return true
      }

      // Если torch не поддерживается, останавливаем поток
      if (!useCache) {
        stopStream(stream)
      }
      return false
    } catch {
      return false
    }
  }

  // Метод 2: Попытка использовать back камеру с torch (упрощенные проверки)
  const tryBackCameraTorch = async (useCache = false) => {
    try {
      let stream

      // Если используем кэш и есть кэшированный стрим
      if (useCache && cachedStream.value) {
        stream = cachedStream.value
      } else {
        // Используем предзагруженные back камеры
        if (backCameras.value.length === 0) {
          return false
        }

        // Берем первую back камеру
        const backCamera = backCameras.value[0]

        stream = await navigator.mediaDevices.getUserMedia({
          video: getVideoConstraints(backCamera.deviceId)
        })

        // Кэшируем стрим только если он новый
        if (!useCache) {
          cachedStream.value = stream
        }
      }

      if (await applyTorchToStream(stream)) {
        return true
      }

      if (!useCache) {
        stopStream(stream)
      }
      return false
    } catch {
      return false
    }
  }

  // Метод 3: Fallback - использование любой доступной камеры (упрощенные проверки)
  const tryAnyCameraTorch = async (useCache = false) => {
    try {
      let stream

      // Если используем кэш и есть кэшированный стрим
      if (useCache && cachedStream.value) {
        stream = cachedStream.value
      } else {
        // Используем предзагруженные камеры
        for (const device of allCameras.value) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: getVideoConstraints(device.deviceId)
            })

            // Кэшируем стрим только если он новый
            if (!useCache) {
              cachedStream.value = stream
            }
            break
          } catch {
            // Продолжаем с следующей камерой
            continue
          }
        }

        if (!stream) {
          return false
        }
      }

      if (await applyTorchToStream(stream)) {
        return true
      }

      if (!useCache) {
        stopStream(stream)
      }
      return false
    } catch {
      return false
    }
  }

  // Проверка поддержки фонарика
  const checkFlashlightSupport = async (loggingCallback = null) => {
    // Если уже проверяли, возвращаем кэшированный результат
    if (isFlashlightSupported.value !== null) {
      return isFlashlightSupported.value
    }

    try {
      // Просто пытаемся включить фонарик всеми доступными способами
      await turnOnFlashlight()
      isFlashlightSupported.value = true

      // Логируем успешную проверку
      if (loggingCallback) {
        loggingCallback.logFlashlightSupport(true, lastUsedMethod.value)
      }

      return true
    } catch (error) {
      isFlashlightSupported.value = false

      // Логируем неудачную проверку
      if (loggingCallback) {
        loggingCallback.logFlashlightSupport(false, null, error)
      }

      return false
    }
  }

  // Функция для очистки кэша (полезно при смене устройств)
  const clearCache = () => {
    cachedMethod.value = null
    if (cachedStream.value) {
      stopStream(cachedStream.value)
      cachedStream.value = null
    }
    isFlashlightSupported.value = null
    isInitialized.value = false
    backCameras.value = []
    allCameras.value = []
  }

  return {
    camera,
    devices,
    isFlashlightOn,
    isFlashlightSupported,
    error,
    isProcessing,
    isInitialized,
    lastUsedMethod,
    initialize,
    getDevices,
    toggleFlashlight,
    turnOnFlashlight,
    turnOffFlashlight,
    checkFlashlightSupport,
    clearCache,
  }
}
