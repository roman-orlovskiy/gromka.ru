import { ref } from 'vue'
import { saveGromkaLogs } from '@/services/api'

export function useLogging() {
  const deviceId = ref(null)
  const logs = ref([])
  const soundChangeCount = ref(0)
  const lastSoundState = ref(null)
  const isLoggingEnabled = ref(false)

  // Генерация уникального идентификатора устройства
  const generateDeviceId = () => {
    if (deviceId.value) return deviceId.value

    // Создаем уникальный ID на основе различных характеристик устройства
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      canvas.toDataURL()
    ].join('|')

    // Создаем хэш из fingerprint
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Конвертируем в 32-битное число
    }

    deviceId.value = `device_${Math.abs(hash).toString(36)}_${Date.now()}`
    return deviceId.value
  }

  // Добавление лога
  const addLog = (type, data) => {
    if (!isLoggingEnabled.value) return

    const logEntry = {
      timestamp: Date.now(),
      type,
      data
    }

    logs.value.push(logEntry)
    console.log(`[Logging] ${type}:`, data)
  }

  // Отслеживание изменений звука
  const trackSoundChange = (newSoundState) => {
    if (!isLoggingEnabled.value) return

    // Проверяем, изменилось ли состояние звука
    if (lastSoundState.value !== newSoundState) {
      soundChangeCount.value++
      lastSoundState.value = newSoundState

      addLog('sound_change', {
        state: newSoundState,
        changeCount: soundChangeCount.value,
        previousState: lastSoundState.value
      })

      // Отправляем логи после третьей смены звука
      if (soundChangeCount.value === 3) {
        sendLogs()
      }
    }
  }

  // Отслеживание изменений фонарика
  const trackFlashlightChange = (isOn, method = null) => {
    if (!isLoggingEnabled.value) return

    addLog('flashlight_change', {
      isOn,
      method,
      timestamp: Date.now()
    })
  }

  // Логирование информации о камерах
  const logCameraInfo = (cameras, selectedMethod) => {
    if (!isLoggingEnabled.value) return

    addLog('camera_info', {
      availableCameras: cameras.map(camera => ({
        deviceId: camera.deviceId,
        label: camera.label,
        kind: camera.kind
      })),
      selectedMethod,
      timestamp: Date.now()
    })
  }

  // Отправка логов на сервер
  const sendLogs = async () => {
    if (!deviceId.value || logs.value.length === 0) return

    try {
      // Создаем финальный объект для отправки
      const finalLogsData = {
        deviceId: deviceId.value,
        timestamp: Date.now(),
        soundChangeCount: soundChangeCount.value,
        logs: logs.value // массив логов без deviceId в каждом элементе
      }

      // Отправляем как JSON строку
      await saveGromkaLogs(deviceId.value, JSON.stringify(finalLogsData))
      console.log('[Logging] Логи успешно отправлены:', finalLogsData)

      // Очищаем логи после отправки
      logs.value = []
      soundChangeCount.value = 0
    } catch (error) {
      console.error('[Logging] Ошибка отправки логов:', error)
    }
  }

  // Включение логирования
  const enableLogging = () => {
    if (!isLoggingEnabled.value) {
      generateDeviceId()
      isLoggingEnabled.value = true
      console.log('[Logging] Логирование включено для устройства:', deviceId.value)
    }
  }

  // Отключение логирования
  const disableLogging = () => {
    isLoggingEnabled.value = false
    console.log('[Logging] Логирование отключено')
  }

  // Очистка логов
  const clearLogs = () => {
    logs.value = []
    soundChangeCount.value = 0
    lastSoundState.value = null
  }

  return {
    // Состояние
    deviceId,
    logs,
    soundChangeCount,
    isLoggingEnabled,

    // Методы
    enableLogging,
    disableLogging,
    trackSoundChange,
    trackFlashlightChange,
    logCameraInfo,
    sendLogs,
    clearLogs
  }
}
