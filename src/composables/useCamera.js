import { computed, ref } from 'vue'

export const useCamera = () => {
  const cameraMethod = ref('environment')
  const camera = ref(null)
  const devices = ref([])
  const isFlashlightOn = ref(false)
  const isFlashlightSupported = ref(null)
  const cachedStream = ref(null)
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

  const requestStreamWithFacingMode = () => navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: cameraMethod.value },
      ...baseVideoConstraints.value
    }
  })

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

  const ensureRearCameraStream = async () => {
    let primaryStream

    try {
      primaryStream = await requestStreamWithFacingMode()
    } catch (error) {
      const fallbackStream = await requestStreamByDeviceId()
      if (fallbackStream) {
        await refreshDevices()
        return fallbackStream
      }
      throw error
    }

    await refreshDevices()

    const primaryTrack = primaryStream.getVideoTracks()[0]
    if (primaryTrack?.getCapabilities?.()?.torch) {
      return primaryStream
    }

    const fallbackStream = await requestStreamByDeviceId()
    if (fallbackStream) {
      stopStream(primaryStream)
      return fallbackStream
    }

    return primaryStream
  }

  // Включение фонарика через environment
  const turnOnFlashlight = async () => {
    if (isFlashlightOn.value) {
      return
    }

    let stream = cachedStream.value

    // Если нет кэшированного стрима, создаем новый
    if (!stream) {
      stream = await ensureRearCameraStream()
      // Кэшируем стрим при первом включении
      cachedStream.value = stream
    }

    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack?.getCapabilities?.()?.torch) {
      await videoTrack.applyConstraints({ advanced: [{ torch: true }] })
      camera.value = stream
      isFlashlightOn.value = true
    } else {
      throw new Error('Torch не поддерживается')
    }
  }

  // Выключение фонарика
  const turnOffFlashlight = async () => {
    if (!isFlashlightOn.value) {
      return
    }

    if (cachedStream.value) {
      const videoTrack = cachedStream.value.getVideoTracks()[0]
      if (videoTrack?.getCapabilities?.()?.torch) {
        await videoTrack.applyConstraints({ advanced: [{ torch: false }] })
      }
    }
    isFlashlightOn.value = false
  }

  // Проверка поддержки фонарика - просто пытается включить и возвращает true/false
  const checkFlashlightSupport = async () => {
    if (isFlashlightSupported.value !== null) {
      return isFlashlightSupported.value
    }

    try {
      await turnOnFlashlight()
      isFlashlightSupported.value = true
      return true
    } catch {
      isFlashlightSupported.value = false
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
  }
}
