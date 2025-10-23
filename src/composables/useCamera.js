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

  const getDevices = async () => {
    try {
      devices.value = await navigator.mediaDevices.enumerateDevices()
    } catch (err) {
      error.value = `Ошибка получения устройств: ${err.message}`
    }
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

  // Включение фонарика
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
      // Если есть кэшированный метод, пробуем его первым
      if (cachedMethod.value) {
        if (await tryCachedMethod()) {
          isFlashlightOn.value = true
          return
        }
      }

      // Метод 1: Попытка использовать environment с torch
      if (await tryEnvironmentTorch()) {
        cachedMethod.value = 'environment'
        isFlashlightOn.value = true
        return
      }

      // Метод 2: Попытка использовать back камеру с torch
      if (await tryBackCameraTorch()) {
        cachedMethod.value = 'back'
        isFlashlightOn.value = true
        return
      }

      // Метод 3: Fallback - использование любой доступной камеры
      if (await tryAnyCameraTorch()) {
        cachedMethod.value = 'any'
        isFlashlightOn.value = true
        return
      }

      throw new Error('Не удалось включить фонарик ни одним из доступных методов')
    } catch (err) {
      error.value = `Ошибка включения фонарика: ${err.message}`
      throw err
    }
  }

  // Выключение фонарика
  const turnOffFlashlight = async () => {
    // Если фонарик уже выключен, ничего не делаем
    if (!isFlashlightOn.value) {
      return
    }

    try {
      if (camera.value && camera.value.getTracks) {
        camera.value.getTracks().forEach(track => {
          if (track.getCapabilities && track.getCapabilities().torch) {
            track.applyConstraints({ advanced: [{ torch: false }] })
          }
          track.stop()
        })
        camera.value = null
      }

      // Очищаем кэшированный стрим при выключении
      if (cachedStream.value) {
        cachedStream.value.getTracks().forEach(track => track.stop())
        cachedStream.value = null
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

  // Метод 1: Попытка использовать environment с torch
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
            torch: true
          }
        })

        // Кэшируем стрим только если он новый
        if (!useCache) {
          cachedStream.value = stream
        }
      }

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack && videoTrack.getCapabilities && videoTrack.getCapabilities().torch) {
        await videoTrack.applyConstraints({ advanced: [{ torch: true }] })
        camera.value = stream
        return true
      }

      // Если torch не поддерживается, останавливаем поток
      if (!useCache) {
        stream.getTracks().forEach(track => track.stop())
      }
      return false
    } catch {
      return false
    }
  }

  // Метод 2: Попытка использовать back камеру с torch
  const tryBackCameraTorch = async (useCache = false) => {
    try {
      let stream

      // Если используем кэш и есть кэшированный стрим
      if (useCache && cachedStream.value) {
        stream = cachedStream.value
      } else {
        // Получаем список устройств
        await getDevices()

        // Фильтруем камеры по названию (back, rear, задняя)
        const backCameras = devices.value.filter(device => {
          const label = device.label.toLowerCase()
          return device.kind === 'videoinput' && (
            label.includes('back') ||
            label.includes('rear') ||
            label.includes('задняя') ||
            label.includes('environment')
          )
        })

        if (backCameras.length === 0) {
          return false
        }

        // Берем первую back камеру
        const backCamera = backCameras[0]

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: backCamera.deviceId },
            torch: true
          }
        })

        // Кэшируем стрим только если он новый
        if (!useCache) {
          cachedStream.value = stream
        }
      }

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack && videoTrack.getCapabilities && videoTrack.getCapabilities().torch) {
        await videoTrack.applyConstraints({ advanced: [{ torch: true }] })
        camera.value = stream
        return true
      }

      if (!useCache) {
        stream.getTracks().forEach(track => track.stop())
      }
      return false
    } catch {
      return false
    }
  }

  // Метод 3: Fallback - использование любой доступной камеры
  const tryAnyCameraTorch = async (useCache = false) => {
    try {
      let stream

      // Если используем кэш и есть кэшированный стрим
      if (useCache && cachedStream.value) {
        stream = cachedStream.value
      } else {
        await getDevices()

        const videoDevices = devices.value.filter(device => device.kind === 'videoinput')

        for (const device of videoDevices) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: device.deviceId },
                torch: true
              }
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

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack && videoTrack.getCapabilities && videoTrack.getCapabilities().torch) {
        await videoTrack.applyConstraints({ advanced: [{ torch: true }] })
        camera.value = stream
        return true
      }

      if (!useCache) {
        stream.getTracks().forEach(track => track.stop())
      }
      return false
    } catch {
      return false
    }
  }

  // Проверка поддержки фонарика
  const checkFlashlightSupport = async () => {
    // Если уже проверяли, возвращаем кэшированный результат
    if (isFlashlightSupported.value !== null) {
      return isFlashlightSupported.value
    }

    try {
      // Просто пытаемся включить фонарик всеми доступными способами
      await turnOnFlashlight()
      isFlashlightSupported.value = true
      return true
    } catch {
      isFlashlightSupported.value = false
      return false
    }
  }

  // Функция для очистки кэша (полезно при смене устройств)
  const clearCache = () => {
    cachedMethod.value = null
    if (cachedStream.value) {
      cachedStream.value.getTracks().forEach(track => track.stop())
      cachedStream.value = null
    }
    isFlashlightSupported.value = null
  }

  return {
    camera,
    devices,
    isFlashlightOn,
    isFlashlightSupported,
    error,
    isProcessing,
    getDevices,
    toggleFlashlight,
    turnOnFlashlight,
    turnOffFlashlight,
    checkFlashlightSupport,
    clearCache,
  }
}
