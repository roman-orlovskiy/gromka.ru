import { ref } from 'vue'
import { useMusicMode } from './useMusicMode.js'

export function useCamera() {
  const isStreamActive = ref(false)
  const isFlashlightOn = ref(false)
  const errorMessage = ref('')
  const isLoading = ref(false)
  const supportsFlashlight = ref(false)

  // Интегрируем музыкальный режим
  const { isPlayingMusic, playMusic, stopMusic } = useMusicMode()

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

      // Проверяем поддержку фонарика после запуска камеры
      supportsFlashlight.value = checkFlashlightSupport()
      console.log('✅ Камера успешно запущена')
      console.log('🔦 Поддержка фонарика:', supportsFlashlight.value)

    } catch (error) {
      console.error('❌ Ошибка запуска камеры:', error)
      errorMessage.value = `Ошибка запуска камеры: ${error.message}`
      isStreamActive.value = false
      supportsFlashlight.value = false
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
      supportsFlashlight.value = false
      console.log('✅ Камера остановлена')
    }
  }

  const setFlashlightState = async (turnOn) => {
    if (!track) {
      console.warn('⚠️ Нет активного трека для управления фонариком')
      return
    }

    try {
      console.log(`🔦 ${turnOn ? 'Включение' : 'Выключение'} фонарика...`)

      // Проверяем возможности трека
      const capabilities = track.getCapabilities()
      console.log('📷 Возможности трека:', capabilities)

      // Пробуем разные варианты управления фонариком
      const constraints = []

      if (capabilities.torch === true) {
        constraints.push({ torch: turnOn })
      }

      if (capabilities.fillLightMode && capabilities.fillLightMode.includes('flash')) {
        constraints.push({ fillLightMode: turnOn ? 'flash' : 'off' })
      }

      if (capabilities.fillLightMode && capabilities.fillLightMode.includes('torch')) {
        constraints.push({ fillLightMode: turnOn ? 'torch' : 'off' })
      }

      // Пробуем применить ограничения
      let success = false
      for (const constraint of constraints) {
        try {
          await track.applyConstraints(constraint)
          success = true
          console.log('✅ Фонарик успешно переключен:', constraint)
          break
        } catch (e) {
          console.warn('⚠️ Не удалось применить ограничение:', constraint, e.message)
        }
      }

      if (!success) {
        throw new Error('Устройство не поддерживает управление фонариком')
      }

      isFlashlightOn.value = turnOn
      console.log('Фонарик:', turnOn ? 'включен' : 'выключен')

    } catch (error) {
      console.error('❌ Ошибка управления фонариком:', error)
      errorMessage.value = `Ошибка управления фонариком: ${error.message}`
    }
  }

  const toggleFlashlight = async () => {
    if (!isStreamActive.value) {
      await startCamera()
      if (!isStreamActive.value) return
    }

    try {
      console.log('🔦 Переключение фонарика...')

      // Если фонарик уже включен или играет музыка - выключаем
      if (isFlashlightOn.value || isPlayingMusic.value) {
        console.log('🔦 Выключаем фонарик и останавливаем музыку...')
        stopMusic()
        await setFlashlightState(false)
        console.log('✅ Фонарик выключен')
      } else {
        // Включаем фонарик и начинаем играть ритм Бетховена
        console.log('🎵 Включаем фонарик и начинаем играть ритм Бетховена...')
        await playMusic(setFlashlightState)
        console.log('✅ Музыкальный фонарик запущен')
      }
    } catch (error) {
      console.error('❌ Ошибка переключения фонарика:', error)
      errorMessage.value = `Ошибка переключения фонарика: ${error.message}`
    }
  }

  const checkFlashlightSupport = () => {
    if (!track) return false

    try {
      const capabilities = track.getCapabilities()
      return (
        capabilities.torch === true ||
        (capabilities.fillLightMode && (
          capabilities.fillLightMode.includes('flash') ||
          capabilities.fillLightMode.includes('torch')
        ))
      )
    } catch {
      return false
    }
  }

  return {
    isStreamActive,
    isFlashlightOn,
    errorMessage,
    isLoading,
    supportsFlashlight,
    isPlayingMusic,
    startCamera,
    stopCamera,
    toggleFlashlight,
    setFlashlightState,
    checkFlashlightSupport
  }
}
