import { ref } from 'vue'

export const useCamera = () => {
  const cameraMethod = ref('environment')
  const camera = ref(null)
  const devices = ref([])
  const isFlashlightOn = ref(false)
  const isFlashlightSupported = ref(null)
  const cachedStream = ref(null)

  // Утилита: остановка стрима
  const stopStream = (stream) => {
    if (stream && stream.getTracks) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  // Включение фонарика через environment
  const turnOnFlashlight = async () => {
    if (isFlashlightOn.value) {
      return
    }

    let stream = cachedStream.value

    // Если нет кэшированного стрима, создаем новый
    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraMethod.value,
          torch: true,
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 15 }
        }
      })
      // Кэшируем стрим при первом включении
      cachedStream.value = stream

      // Получаем устройства после получения разрешения
      devices.value = await navigator.mediaDevices.enumerateDevices()
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
