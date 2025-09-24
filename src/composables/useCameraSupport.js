import { ref } from 'vue'

// Функция определения инкогнито режима
const detectIncognito = async () => {
  try {
    // Проверяем различные признаки инкогнито режима
    if (window.chrome && window.chrome.runtime && window.chrome.runtime.onConnect) {
      return false // Обычный Chrome
    }

    // Проверяем доступность IndexedDB (в инкогнито может быть ограничен)
    if ('indexedDB' in window) {
      try {
        await new Promise((resolve, reject) => {
          const request = indexedDB.open('test')
          request.onerror = () => reject(new Error('IndexedDB blocked'))
          request.onsuccess = () => {
            request.result.close()
            resolve()
          }
        })
      } catch {
        return true // IndexedDB заблокирован - вероятно инкогнито
      }
    }

    // Проверяем доступность localStorage (в некоторых браузерах ограничен в инкогнито)
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
    } catch {
      return true // localStorage заблокирован - вероятно инкогнито
    }

    // Проверяем User Agent на признаки приватного режима
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('incognito') || userAgent.includes('private')) {
      return true
    }

    return false
  } catch {
    return false
  }
}

export function useCameraSupport() {
  const hasCameraSupport = ref(false)
  const errorMessage = ref('')
  const isLoading = ref(false)

const checkCameraSupport = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    console.log('🔍 Проверка поддержки камеры...')

    // Проверяем инкогнито режим
    const isIncognito = await detectIncognito()
    if (isIncognito) {
      console.warn('⚠️ Обнаружен инкогнито режим - фонарик может не работать')
    }

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
