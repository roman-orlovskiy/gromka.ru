import { ref } from 'vue'

export function useCameraSupport() {
  const hasCameraSupport = ref(false)
  const errorMessage = ref('')
  const isLoading = ref(false)

  const checkCameraSupport = async () => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      console.log('🔍 Проверка поддержки камеры...')

      if (!navigator.mediaDevices) {
        throw new Error('navigator.mediaDevices не поддерживается')
      }

      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia не поддерживается')
      }

      // Проверяем доступные устройства
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')

      hasCameraSupport.value = videoDevices.length > 0

      if (!hasCameraSupport.value) {
        throw new Error('Камера не найдена на устройстве')
      }

      console.log('✅ Поддержка камеры подтверждена')
    } catch (error) {
      console.error('❌ Ошибка проверки камеры:', error)
      errorMessage.value = error.message
      hasCameraSupport.value = false
    } finally {
      isLoading.value = false
    }
  }

  return {
    hasCameraSupport,
    errorMessage,
    isLoading,
    checkCameraSupport
  }
}
