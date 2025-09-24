import { ref } from 'vue'

export function useCamera() {
  const isStreamActive = ref(false)
  const isFlashlightOn = ref(false)
  const errorMessage = ref('')
  const isLoading = ref(false)

  let stream = null
  let track = null

  const startCamera = async () => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      console.log('🎥 Запуск камеры...')

      // Базовые ограничения для камеры
      const constraints = {
        video: {
          facingMode: 'environment', // Задняя камера
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      stream = await navigator.mediaDevices.getUserMedia(constraints)
      track = stream.getVideoTracks()[0]

      if (!track) {
        throw new Error('Не найден видео трек в потоке')
      }

      isStreamActive.value = true
      console.log('✅ Камера успешно запущена')

    } catch (error) {
      console.error('❌ Ошибка запуска камеры:', error)
      errorMessage.value = `Ошибка запуска камеры: ${error.message}`
      isStreamActive.value = false
    } finally {
      isLoading.value = false
    }
  }

  const stopCamera = () => {
    console.log('🛑 Остановка камеры...')

    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      stream = null
      track = null
      isStreamActive.value = false
      isFlashlightOn.value = false
      console.log('✅ Камера остановлена')
    }
  }

  const toggleFlashlight = async () => {
    if (!isStreamActive.value) {
      await startCamera()
      if (!isStreamActive.value) return
    }

    try {
      console.log('🔦 Переключение фонарика...')

      // Пока просто переключаем состояние
      // В следующих шагах добавим реальную работу с фонариком
      isFlashlightOn.value = !isFlashlightOn.value
      console.log('Фонарик:', isFlashlightOn.value ? 'включен' : 'выключен')

    } catch (error) {
      console.error('❌ Ошибка управления фонариком:', error)
      errorMessage.value = `Ошибка управления фонариком: ${error.message}`
    }
  }

  return {
    isStreamActive,
    isFlashlightOn,
    errorMessage,
    isLoading,
    startCamera,
    stopCamera,
    toggleFlashlight
  }
}
