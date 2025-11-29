import { ref } from 'vue'

export const useCamera = () => {
  const cameraMethod = ref('environment')
  const camera = ref(null)
  const devices = ref([])
  const isFlashlightOn = ref(false)
  const isFlashlightSupported = ref(null)
  const cachedAudioStream = ref(null)

  // eslint-disable-next-line no-unused-vars
  const turnOnFlashlight = async (logCallbacks = null, options = {}) => {
    return { success: false, method: null, audioStream: null }
  }

  // eslint-disable-next-line no-unused-vars
  const turnOffFlashlight = async (logCallbacks = null) => {
    // Пустая заглушка
  }

  // eslint-disable-next-line no-unused-vars
  const checkFlashlightSupport = async (logCallbacks = null, options = {}) => {
    return { supported: false, audioStream: null }
  }

  const clearCache = () => {
    // Пустая заглушка
  }

  const refreshDevices = async () => {
    return []
  }

  return {
    cameraMethod,
    camera,
    devices,
    isFlashlightOn,
    isFlashlightSupported,
    cachedAudioStream,
    turnOnFlashlight,
    turnOffFlashlight,
    checkFlashlightSupport,
    clearCache,
    refreshDevices,
  }
}
