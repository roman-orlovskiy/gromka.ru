import { computed, ref } from 'vue'

export const useCamera = () => {
  const cameraMethod = ref('environment')
  const camera = ref(null)
  const devices = ref([])
  const isFlashlightOn = ref(false)
  const isFlashlightSupported = ref(null)
  const cachedStream = ref(null)
  const lastUsedMethod = ref(null) // Сохраняем метод, который использовался для включения
  const preferredRearLabels = /(main|primary|rear|back|environment|wide|tele)/i
  const labelPriority = ['main', 'primary', 'rear', 'back', 'environment', 'wide', 'tele']

  const baseVideoConstraints = computed(() => ({
    torch: true,
    width: { ideal: 320 },
    height: { ideal: 240 },
    frameRate: { ideal: 15 }
  }))

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

  const pickRearCamera = (list) => {
    const candidates = list
      .filter(device => device.kind === 'videoinput')
      .filter(device => preferredRearLabels.test(device.label ?? ''))

    if (!candidates.length) {
      return null
    }

    return candidates.sort((a, b) => labelScore(a.label) - labelScore(b.label))[0]
  }

  const requestStreamWithFacingMode = () => {
    // ВРЕМЕННО: для тестирования fallback - раскомментируйте следующую строку
    // if (true) throw new Error('Simulated facingMode error')

    return navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: cameraMethod.value },
        ...baseVideoConstraints.value
      }
    })
  }

  const requestStreamByDeviceId = async () => {
    const availableDevices = devices.value.length ? devices.value : await refreshDevices()
    const rearCamera = pickRearCamera(availableDevices)

    if (!rearCamera?.deviceId) {
      return null
    }

    return navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: rearCamera.deviceId },
        ...baseVideoConstraints.value
      }
    })
  }

  const ensureRearCameraStream = async (logCallback = null) => {
    let primaryStream
    let usedMethod = 'facingMode'

    try {
      // Пробуем получить стрим через facingMode
      primaryStream = await requestStreamWithFacingMode()
      // Логируем попытку получения стрима через facingMode (даже если torch не поддерживается)
      if (logCallback) {
        logCallback(false, 'facingMode') // false = попытка включения, но еще не включен
      }
    } catch (error) {
      // Логируем неудачную попытку через facingMode
      if (logCallback) {
        logCallback(false, 'facingMode')
      }

      // Пробуем fallback через deviceId
      try {
        const fallbackStream = await requestStreamByDeviceId()
        if (fallbackStream) {
          // Логируем успешную попытку получения стрима через deviceId
          if (logCallback) {
            logCallback(false, 'deviceId')
          }
          await refreshDevices()
          return { stream: fallbackStream, method: 'deviceId' }
        }
      } catch {
        // Логируем неудачную попытку через deviceId
        if (logCallback) {
          logCallback(false, 'deviceId')
        }
      }
      throw error
    }

    await refreshDevices()

    const primaryTrack = primaryStream.getVideoTracks()[0]
    if (primaryTrack?.getCapabilities?.()?.torch) {
      return { stream: primaryStream, method: usedMethod }
    }

    // Если torch не поддерживается в primaryStream, пробуем deviceId
    try {
      const fallbackStream = await requestStreamByDeviceId()
      if (fallbackStream) {
        // Логируем попытку через deviceId
        if (logCallback) {
          logCallback(false, 'deviceId')
        }
        stopStream(primaryStream)
        return { stream: fallbackStream, method: 'deviceId' }
      }
    } catch {
      // Логируем неудачную попытку через deviceId
      if (logCallback) {
        logCallback(false, 'deviceId')
      }
    }

    return { stream: primaryStream, method: usedMethod }
  }

  // Включение фонарика через environment
  const turnOnFlashlight = async (logCallback = null) => {
    if (isFlashlightOn.value) {
      // Если фонарик уже включен, но передан callback, логируем это
      // Используем сохраненный метод или 'cached'
      const method = lastUsedMethod.value || 'cached'
      if (logCallback) {
        logCallback(true, method)
      }
      return { success: true, method }
    }

    let stream = cachedStream.value
    let usedMethod = 'cached'

    try {
      // Если нет кэшированного стрима, создаем новый
      if (!stream) {
        // Передаем callback для логирования попыток получения стрима разными методами
        const result = await ensureRearCameraStream(logCallback)
        stream = result.stream
        usedMethod = result.method
        // Кэшируем стрим при первом включении
        cachedStream.value = stream
      }

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack?.getCapabilities?.()?.torch) {
        await videoTrack.applyConstraints({ advanced: [{ torch: true }] })
        camera.value = stream
        isFlashlightOn.value = true
        // Сохраняем метод включения для использования при выключении
        lastUsedMethod.value = usedMethod

        // Логируем успешное включение
        if (logCallback) {
          logCallback(true, usedMethod)
        }

        return { success: true, method: usedMethod }
      } else {
        const error = new Error('Torch не поддерживается')

        // Логируем неудачное включение (передаем false как isOn)
        if (logCallback) {
          logCallback(false, usedMethod)
        }

        throw error
      }
    } catch (error) {
      // Логируем ошибку включения (передаем false как isOn)
      if (logCallback) {
        logCallback(false, usedMethod || 'unknown')
      }
      throw error
    }
  }

  // Выключение фонарика
  const turnOffFlashlight = async (logCallback = null) => {
    if (!isFlashlightOn.value) {
      return
    }

    // Получаем метод, который использовался для включения
    const method = lastUsedMethod.value || 'unknown'

    if (cachedStream.value) {
      const videoTrack = cachedStream.value.getVideoTracks()[0]
      if (videoTrack?.getCapabilities?.()?.torch) {
        await videoTrack.applyConstraints({ advanced: [{ torch: false }] })
      }
    }
    isFlashlightOn.value = false

    // Логируем выключение с правильным методом
    if (logCallback) {
      logCallback(false, method)
    }
  }

  // Проверка поддержки фонарика - просто пытается включить и возвращает true/false
  const checkFlashlightSupport = async (logCallback = null) => {
    // Если поддержка уже проверена, но передан callback, логируем текущее состояние
    if (isFlashlightSupported.value !== null) {
      if (logCallback) {
        // Логируем текущее состояние фонарика (включен/выключен) с методом из кэша
        const method = lastUsedMethod.value || 'cached'
        logCallback(isFlashlightOn.value, method)
      }
      return isFlashlightSupported.value
    }

    try {
      await turnOnFlashlight(logCallback)
      isFlashlightSupported.value = true
      return true
    } catch {
      isFlashlightSupported.value = false
      // Логируем финальную неудачную попытку, если callback передан
      // (все промежуточные попытки уже залогированы в turnOnFlashlight)
      if (logCallback) {
        logCallback(false, 'unknown')
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
