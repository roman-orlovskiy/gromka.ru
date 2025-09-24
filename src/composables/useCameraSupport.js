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

    let userMessage = 'Ошибка проверки камеры'

    if (error.message.includes('mediaDevices не поддерживается')) {
      userMessage = 'Ваш браузер не поддерживает доступ к камере. Обновите браузер или используйте современный браузер.'
    } else if (error.message.includes('getUserMedia не поддерживается')) {
      userMessage = 'Функция getUserMedia не поддерживается. Обновите браузер.'
    } else if (error.message.includes('Камера не найдена')) {
      userMessage = 'Камера не найдена на устройстве. Проверьте подключение камеры.'
    } else {
      userMessage = error.message
    }

    errorMessage.value = userMessage
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
