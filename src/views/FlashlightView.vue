<template>
  <div class="flashlight">
    <div class="flashlight__container">
      <h1 class="flashlight__title">Фонарик</h1>

      <div class="flashlight__status" :class="{ 'flashlight__status--active': isFlashlightOn }">
        <div class="flashlight__status-indicator"></div>
        <span class="flashlight__status-text">
          {{ isFlashlightOn ? 'Фонарик включен' : 'Фонарик выключен' }}
        </span>
      </div>

      <div class="flashlight__controls">
        <button
          class="flashlight__button"
          :class="{ 'flashlight__button--active': isFlashlightOn }"
          @click="toggleFlashlight"
          :disabled="!hasCameraSupport || isLoading"
        >
          {{ isLoading ? 'Загрузка...' : (isFlashlightOn ? 'Выключить' : 'Включить') }}
        </button>

        <button
          class="flashlight__button flashlight__button--secondary"
          @click="switchCamera"
          :disabled="!hasCameraSupport || isLoading"
        >
          🔄 Сменить камеру
        </button>
      </div>

      <div class="flashlight__info" v-if="!hasCameraSupport">
        <p>Ваше устройство не поддерживает функцию фонарика</p>
      </div>

      <div class="flashlight__error" v-if="errorMessage">
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Скрытый видео-элемент для работы с камерой -->
      <video
        ref="videoEl"
        playsinline
        muted
        style="display: none;"
      ></video>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Реактивные переменные
const isFlashlightOn = ref(false)
const hasCameraSupport = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const videoEl = ref(null)

let stream = null
let track = null

// Проверка поддержки камеры
const checkCameraSupport = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Камера не поддерживается')
    }

    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')
    hasCameraSupport.value = videoDevices.length > 0

    if (!hasCameraSupport.value) {
      throw new Error('Камера не найдена')
    }
  } catch (error) {
    console.error('Ошибка проверки камеры:', error)
    errorMessage.value = 'Камера не поддерживается'
    hasCameraSupport.value = false
  }
}

// Умный запуск камеры с поиском фонарика
const startCamera = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    console.log('🎥 Запуск камеры с поиском фонарика...')

    // Получаем список всех камер
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')

    console.log('📷 Найдено камер:', videoDevices.length)

    // Ищем задние камеры
    const backCameras = videoDevices.filter(device => {
      const label = (device.label || '').toLowerCase()
      return label.includes('back') || label.includes('rear') || label.includes('environment')
    })

    console.log('📷 Задние камеры:', backCameras.map(cam => ({ id: cam.deviceId, label: cam.label })))

    // Пробуем каждую заднюю камеру до нахождения с фонариком
    let selectedCamera = null
    let cameraWithFlashlight = null

    for (const camera of backCameras) {
      try {
        console.log(`🔍 Пробуем камеру: ${camera.label}`)

        const constraints = {
          video: {
            deviceId: { exact: camera.deviceId },
            facingMode: 'environment'
          }
        }

        const testStream = await navigator.mediaDevices.getUserMedia(constraints)
        const testTrack = testStream.getVideoTracks()[0]

        // Небольшая задержка для инициализации
        await new Promise(resolve => setTimeout(resolve, 300))

        const capabilities = testTrack.getCapabilities()
        console.log(`🔦 Возможности камеры ${camera.label}:`, {
          torch: capabilities.torch,
          fillLightMode: capabilities.fillLightMode
        })

        // Проверяем поддержку фонарика
        const hasFlashlight = capabilities.torch === true ||
          (capabilities.fillLightMode && (
            capabilities.fillLightMode.includes('flash') ||
            capabilities.fillLightMode.includes('torch')
          ))

        if (hasFlashlight) {
          console.log(`✅ Найдена камера с фонариком: ${camera.label}`)
          cameraWithFlashlight = camera
          // Останавливаем тестовый поток
          testStream.getTracks().forEach(track => track.stop())
          break
        } else {
          console.log(`❌ Камера ${camera.label} без фонарика`)
          // Останавливаем тестовый поток
          testStream.getTracks().forEach(track => track.stop())
        }

      } catch (error) {
        console.warn(`⚠️ Ошибка тестирования камеры ${camera.label}:`, error.message)
      }
    }

    // Выбираем камеру
    if (cameraWithFlashlight) {
      selectedCamera = cameraWithFlashlight
      console.log('🎯 Используем камеру с фонариком:', selectedCamera.label)
    } else if (backCameras.length > 0) {
      selectedCamera = backCameras[0]
      console.log('⚠️ Фонарик не найден, используем первую заднюю камеру:', selectedCamera.label)
    } else {
      throw new Error('Задние камеры не найдены')
    }

    // Запускаем выбранную камеру
    const constraints = {
      video: {
        deviceId: { exact: selectedCamera.deviceId },
        facingMode: 'environment'
      }
    }

    console.log('🎥 Запуск выбранной камеры:', selectedCamera.label)
    stream = await navigator.mediaDevices.getUserMedia(constraints)
    track = stream.getVideoTracks()[0]

    if (!track) {
      throw new Error('Не найден видео трек')
    }

    console.log('📷 Камера запущена:', track.label)

    if (videoEl.value) {
      videoEl.value.srcObject = stream
      await videoEl.value.play()
    }

    // Задержка для стабилизации
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('✅ Камера готова к работе')

  } catch (error) {
    console.error('❌ Ошибка запуска камеры:', error)

    let userMessage = 'Ошибка запуска камеры'
    if (error.name === 'NotAllowedError') {
      userMessage = 'Доступ к камере заблокирован. Разрешите доступ в настройках браузера.'
    } else if (error.name === 'NotFoundError') {
      userMessage = 'Камера не найдена. Проверьте подключение камеры.'
    } else if (error.name === 'NotReadableError') {
      userMessage = 'Камера занята другим приложением.'
    }

    errorMessage.value = userMessage
    throw error
  } finally {
    isLoading.value = false
  }
}

// Остановка камеры
const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
    track = null
  }
  isFlashlightOn.value = false
}

// Универсальное управление фонариком
const setFlashlightState = async (turnOn) => {
  if (!track) {
    console.warn('Нет активного трека')
    return
  }

  try {
    const capabilities = track.getCapabilities()
    console.log('🔦 Возможности камеры:', capabilities)

    // Список всех возможных вариантов управления фонариком
    const flashlightMethods = []

    // 1. Стандартный torch
    if (capabilities.torch === true) {
      flashlightMethods.push({ torch: turnOn })
    }

    // 2. FillLightMode варианты
    if (capabilities.fillLightMode) {
      if (capabilities.fillLightMode.includes('flash')) {
        flashlightMethods.push({ fillLightMode: turnOn ? 'flash' : 'off' })
      }
      if (capabilities.fillLightMode.includes('torch')) {
        flashlightMethods.push({ fillLightMode: turnOn ? 'torch' : 'off' })
      }
    }

    // 3. Advanced варианты (для старых устройств)
    if (capabilities.torch === true) {
      flashlightMethods.push({ advanced: [{ torch: turnOn }] })
    }
    if (capabilities.fillLightMode) {
      const mode = turnOn ? 'flash' : 'off'
      if (capabilities.fillLightMode.includes(mode)) {
        flashlightMethods.push({ advanced: [{ fillLightMode: mode }] })
      }
    }

    console.log(`🔦 Пробуем ${flashlightMethods.length} методов для ${turnOn ? 'включения' : 'выключения'} фонарика`)

    // Пробуем все методы по очереди
    let success = false
    let lastError = null

    for (let i = 0; i < flashlightMethods.length; i++) {
      const method = flashlightMethods[i]
      try {
        console.log(`🔦 Метод ${i + 1}/${flashlightMethods.length}:`, method)
        await track.applyConstraints(method)
        success = true
        console.log(`✅ Фонарик ${turnOn ? 'включен' : 'выключен'} методом:`, method)
        break
      } catch (error) {
        lastError = error
        console.warn(`❌ Метод ${i + 1} не сработал:`, error.message)
      }
    }

    if (success) {
      isFlashlightOn.value = turnOn
      errorMessage.value = ''
    } else {
      const errorMsg = `Фонарик не поддерживается. Последняя ошибка: ${lastError?.message || 'Неизвестно'}`
      console.error('❌', errorMsg)
      throw new Error(errorMsg)
    }
  } catch (error) {
    console.error('❌ Ошибка управления фонариком:', error)
    errorMessage.value = error.message
  }
}

// Переключение фонарика с диагностикой
const toggleFlashlight = async () => {
  try {
    if (!isFlashlightOn.value) {
      // Включаем
      if (!stream) {
        await startCamera()
      }

      // Показываем диагностику камер
      await showCameraDiagnostics()

      await setFlashlightState(true)
    } else {
      // Выключаем
      await setFlashlightState(false)
      stopCamera()
    }
  } catch (error) {
    console.error('Ошибка переключения фонарика:', error)
    errorMessage.value = 'Ошибка переключения фонарика'
  }
}

// Переключение на другую камеру
const switchCamera = async () => {
  try {
    console.log('🔄 Переключение на другую камеру...')

    // Останавливаем текущую камеру
    if (stream) {
      stopCamera()
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Запускаем поиск новой камеры
    await startCamera()

    // Показываем диагностику новой камеры
    await showCameraDiagnostics()

    console.log('✅ Камера переключена')

  } catch (error) {
    console.error('❌ Ошибка переключения камеры:', error)
    errorMessage.value = 'Ошибка переключения камеры'
  }
}

// Функция копирования в буфер обмена
const copyToClipboard = async (text) => {
  try {
    // Метод 1: Современный Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // Метод 2: Старый способ через textarea
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    textArea.style.opacity = '0'
    textArea.setAttribute('readonly', '')

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    textArea.setSelectionRange(0, 99999)

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    return successful
  } catch (error) {
    console.error('Ошибка копирования:', error)
    return false
  }
}

// Диагностика камер с копированием
const showCameraDiagnostics = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')

    let diagnosticInfo = `📱 УСТРОЙСТВО:\n${navigator.userAgent}\n\n`
    diagnosticInfo += `📷 НАЙДЕНО КАМЕР: ${videoDevices.length}\n\n`

    videoDevices.forEach((device, index) => {
      diagnosticInfo += `Камера ${index + 1}:\n`
      diagnosticInfo += `  ID: ${device.deviceId}\n`
      diagnosticInfo += `  Название: ${device.label || 'Без названия'}\n`
      diagnosticInfo += `  Группа: ${device.groupId}\n\n`
    })

    if (track) {
      const settings = track.getSettings()
      const capabilities = track.getCapabilities()

      diagnosticInfo += `🎥 АКТИВНАЯ КАМЕРА:\n`
      diagnosticInfo += `  Название: ${settings.label || 'Неизвестно'}\n`
      diagnosticInfo += `  Разрешение: ${settings.width}x${settings.height}\n`
      diagnosticInfo += `  Частота: ${settings.frameRate} fps\n`
      diagnosticInfo += `  Устройство ID: ${settings.deviceId}\n\n`

      diagnosticInfo += `🔦 ВОЗМОЖНОСТИ ФОНАРИКА:\n`
      diagnosticInfo += `  Torch: ${capabilities.torch ? '✅ Поддерживается' : '❌ Не поддерживается'}\n`
      diagnosticInfo += `  FillLightMode: ${capabilities.fillLightMode ? capabilities.fillLightMode.join(', ') : 'Нет'}\n\n`

      diagnosticInfo += `🔧 ВСЕ ВОЗМОЖНОСТИ:\n`
      diagnosticInfo += JSON.stringify(capabilities, null, 2)
    }

    // Показываем alert
    // alert(diagnosticInfo)

    // Копируем в буфер обмена
    const copied = await copyToClipboard(diagnosticInfo)
    if (copied) {
      console.log('✅ Диагностическая информация скопирована в буфер обмена')
    } else {
      console.warn('⚠️ Не удалось скопировать в буфер обмена')
    }

  } catch (error) {
    console.error('Ошибка диагностики:', error)
    // alert(`Ошибка получения информации о камерах: ${error.message}`)
  }
}

// Инициализация
onMounted(() => {
  checkCameraSupport()
})

// Очистка
onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.flashlight {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 20px;
}

.flashlight__container {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.flashlight__title {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: 300;
}

.flashlight__status {
  margin-bottom: 3rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.flashlight__status--active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.flashlight__status-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #666;
  margin: 0 auto 0.5rem;
  transition: all 0.3s ease;
}

.flashlight__status--active .flashlight__status-indicator {
  background: #ffeb3b;
  box-shadow: 0 0 20px #ffeb3b;
}

.flashlight__status-text {
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
}

.flashlight__controls {
  margin-bottom: 2rem;
}

.flashlight__button {
  width: 200px;
  height: 60px;
  border: none;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.flashlight__button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.flashlight__button--active {
  background: linear-gradient(45deg, #ff6b6b 0%, #ee5a24 100%);
}

.flashlight__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.flashlight__button--secondary {
  background: linear-gradient(45deg, #4CAF50 0%, #45a049 100%);
  margin-top: 1rem;
}

.flashlight__button--secondary:hover:not(:disabled) {
  background: linear-gradient(45deg, #45a049 0%, #3d8b40 100%);
}

.flashlight__info,
.flashlight__error {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.flashlight__info {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.4);
  color: #ffc107;
}

.flashlight__error {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
  color: #f44336;
}

.flashlight__info p,
.flashlight__error p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
