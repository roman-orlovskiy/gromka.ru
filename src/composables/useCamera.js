import { ref } from 'vue'

export const useCamera = () => {
  const camera = ref(null)
  const devices = ref([])
  const isFlashlightOn = ref(false)
  const isFlashlightSupported = ref(null) // null = не проверено, true/false = результат проверки
  const error = ref(null)

  const getDevices = async () => {
    try {
      devices.value = await navigator.mediaDevices.enumerateDevices()
    } catch (err) {
      error.value = `Ошибка получения устройств: ${err.message}`
    }
  }

  // Универсальный метод для включения/выключения фонарика
  const toggleFlashlight = async (forceOn = null) => {
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
    }
  }

  // Включение фонарика
  const turnOnFlashlight = async () => {
    // Если уже знаем, что фонарик не поддерживается, не пытаемся
    if (isFlashlightSupported.value === false) {
      throw new Error('Фонарик не поддерживается на этом устройстве')
    }

    try {
      // Метод 1: Попытка использовать environment с torch
      if (await tryEnvironmentTorch()) {
        isFlashlightOn.value = true
        return
      }

      // Метод 2: Попытка использовать back камеру с torch
      if (await tryBackCameraTorch()) {
        isFlashlightOn.value = true
        return
      }

      // Метод 3: Fallback - использование любой доступной камеры
      if (await tryAnyCameraTorch()) {
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
      isFlashlightOn.value = false
    } catch (err) {
      error.value = `Ошибка выключения фонарика: ${err.message}`
      throw err
    }
  }

  // Метод 1: Попытка использовать environment с torch
  const tryEnvironmentTorch = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          torch: true
        }
      })

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack && videoTrack.getCapabilities && videoTrack.getCapabilities().torch) {
        await videoTrack.applyConstraints({ advanced: [{ torch: true }] })
        camera.value = stream
        return true
      }

      // Если torch не поддерживается, останавливаем поток
      stream.getTracks().forEach(track => track.stop())
      return false
    } catch {
      return false
    }
  }

  // Метод 2: Попытка использовать back камеру с torch
  const tryBackCameraTorch = async () => {
    try {
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

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: backCamera.deviceId },
          torch: true
        }
      })

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack && videoTrack.getCapabilities && videoTrack.getCapabilities().torch) {
        await videoTrack.applyConstraints({ advanced: [{ torch: true }] })
        camera.value = stream
        return true
      }

      stream.getTracks().forEach(track => track.stop())
      return false
    } catch {
      return false
    }
  }

  // Метод 3: Fallback - использование любой доступной камеры
  const tryAnyCameraTorch = async () => {
    try {
      await getDevices()

      const videoDevices = devices.value.filter(device => device.kind === 'videoinput')

      for (const device of videoDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: device.deviceId },
              torch: true
            }
          })

          const videoTrack = stream.getVideoTracks()[0]
          if (videoTrack && videoTrack.getCapabilities && videoTrack.getCapabilities().torch) {
            await videoTrack.applyConstraints({ advanced: [{ torch: true }] })
            camera.value = stream
            return true
          }

          stream.getTracks().forEach(track => track.stop())
        } catch {
          // Продолжаем с следующей камерой
          continue
        }
      }

      return false
    } catch {
      return false
    }
  }

  // Проверка поддержки фонарика
  const checkFlashlightSupport = async () => {
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

  return {
    camera,
    devices,
    isFlashlightOn,
    isFlashlightSupported,
    error,
    getDevices,
    toggleFlashlight,
    turnOnFlashlight,
    turnOffFlashlight,
    checkFlashlightSupport,
  }
}
