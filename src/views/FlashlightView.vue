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
          class="flashlight__button flashlight__button--info"
          @click="showCameraInfo"
          :disabled="!hasCameraSupport"
        >
          📷 Показать камеры
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

// Определение задней камеры по метке устройства
const isBackCameraDevice = (device) => {
  const label = device.label.toLowerCase()

  // Сначала исключаем явно передние камеры
  if (label.includes('front') ||
      label.includes('facing front') ||
      label.includes('selfie') ||
      label.includes('user') ||
      label.includes('facetime')) {
    return false
  }

  // Затем проверяем признаки задней камеры
  return (
    label.includes('back') ||
    label.includes('rear') ||
    label.includes('environment') ||
    label.includes('facing back') ||
    label.includes('wide') || // Широкоугольная камера (обычно задняя)
    label.includes('main') || // Основная камера
    label.includes('primary') || // Первичная камера
    isBackCameraByNumber(label) // Проверка по номеру камеры
  )
}

// Проверка задней камеры по номеру
const isBackCameraByNumber = (label) => {
  const number = extractCameraNumber(label)
  if (number === null) return false

  // Обычно camera 0 - задняя, camera 1 - передняя
  // Но это может варьироваться в зависимости от устройства
  return number === 0 || number === 2
}

// Сортировка камер по приоритету (задние камеры в начале)
const sortBackCameras = (cameras) => {
  return cameras.sort((a, b) => {
    const aIsBack = isBackCameraDevice(a)
    const bIsBack = isBackCameraDevice(b)
    const aNumber = extractCameraNumber(a.label)
    const bNumber = extractCameraNumber(b.label)

    console.log(`Сравниваем: "${a.label}" (back: ${aIsBack}, num: ${aNumber}) vs "${b.label}" (back: ${bIsBack}, num: ${bNumber})`)

    // Если одна задняя, а другая нет - задняя идет первой
    if (aIsBack && !bIsBack) {
      console.log('  -> A задняя, B передняя: A идет первой')
      return -1
    }
    if (!aIsBack && bIsBack) {
      console.log('  -> A передняя, B задняя: B идет первой')
      return 1
    }

    // Если обе задние или обе передние - сортируем по номерам камер
    if (aIsBack === bIsBack) {
      // Если номера найдены - сортируем по возрастанию
      if (aNumber !== null && bNumber !== null) {
        const result = aNumber - bNumber
        console.log(`  -> Оба с номерами: ${aNumber} - ${bNumber} = ${result}`)
        return result
      }

      // Если только у одной есть номер - она идет первой
      if (aNumber !== null && bNumber === null) {
        console.log('  -> A с номером, B без: A идет первой')
        return -1
      }
      if (aNumber === null && bNumber !== null) {
        console.log('  -> A без номера, B с номером: B идет первой')
        return 1
      }

      // Если у обеих нет номеров - сохраняем исходный порядок
      console.log('  -> Обе без номеров: сохраняем порядок')
      return 0
    }

    return 0
  })
}

// Извлечение номера камеры из метки
const extractCameraNumber = (label) => {
  const match = label.toLowerCase().match(/camera\s*(\d+)/)
  const number = match ? parseInt(match[1], 10) : null
  console.log(`Извлекаем номер из "${label}": ${number}`)
  return number
}

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

// Получение разрешения на камеру и списка камер
const getCameraPermissionAndDevices = async () => {
  try {
    console.log('🔐 Запрашиваем разрешение на камеру...')

    // Сначала запрашиваем базовое разрешение на камеру
    const tempStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })

    // Останавливаем временный поток
    tempStream.getTracks().forEach(track => track.stop())

    console.log('✅ Разрешение получено, получаем список камер...')

    // Теперь получаем полный список камер с метками
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')

    console.log('📷 Получены камеры:', videoDevices.map(d => ({
      deviceId: d.deviceId,
      label: d.label
    })))

    return videoDevices
  } catch (error) {
    console.error('❌ Ошибка получения разрешения:', error)
    throw error
  }
}

// Запуск камеры
const startCamera = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    // Получаем разрешение и список камер
    const videoDevices = await getCameraPermissionAndDevices()

    // Сортируем камеры, задние камеры будут в начале списка
    const sortedCameras = sortBackCameras(videoDevices)

    // Выбираем первую заднюю камеру или первую доступную
    const selectedCamera = sortedCameras.find(camera => isBackCameraDevice(camera, videoDevices)) || sortedCameras[0]

    console.log('📷 Отсортированные камеры:', sortedCameras.map(d => ({
      deviceId: d.deviceId,
      label: d.label,
      isBack: isBackCameraDevice(d, videoDevices),
      number: extractCameraNumber(d.label)
    })))

    console.log('🎯 Выбранная камера:', {
      deviceId: selectedCamera?.deviceId,
      label: selectedCamera?.label,
      isBack: selectedCamera ? isBackCameraDevice(selectedCamera, videoDevices) : false,
      number: selectedCamera ? extractCameraNumber(selectedCamera.label) : null
    })

    // Создаем constraints с конкретным deviceId
    const constraints = {
      video: {
        deviceId: selectedCamera ? { exact: selectedCamera.deviceId } : undefined,
        facingMode: 'environment', // Fallback для устройств без deviceId
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }

    // Если не удалось получить deviceId, пробуем только с facingMode
    if (!selectedCamera?.deviceId) {
      delete constraints.video.deviceId
      console.log('⚠️ Используем только facingMode без deviceId')
    }

    stream = await navigator.mediaDevices.getUserMedia(constraints)
    track = stream.getVideoTracks()[0]

    if (videoEl.value) {
      videoEl.value.srcObject = stream
      await videoEl.value.play()
    }

    // Небольшая задержка для инициализации
    await new Promise(resolve => setTimeout(resolve, 200))

    console.log('✅ Камера успешно запущена')

  } catch (error) {
    console.error('Ошибка запуска камеры:', error)

    // Если не удалось запустить с конкретным deviceId, пробуем fallback
    if (error.name === 'OverconstrainedError' || error.name === 'NotFoundError') {
      console.log('🔄 Пробуем fallback с facingMode...')
      try {
        const fallbackConstraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        }

        stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints)
        track = stream.getVideoTracks()[0]

        if (videoEl.value) {
          videoEl.value.srcObject = stream
          await videoEl.value.play()
        }

        await new Promise(resolve => setTimeout(resolve, 200))
        console.log('✅ Fallback камера запущена')
        return
      } catch (fallbackError) {
        console.error('❌ Fallback также не сработал:', fallbackError)
        errorMessage.value = 'Ошибка запуска камеры'
        throw fallbackError
      }
    }

    errorMessage.value = 'Ошибка запуска камеры'
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

// Управление фонариком
const setFlashlightState = async (turnOn) => {
  if (!track) return

  try {
    const capabilities = track.getCapabilities()
    let success = false

    // Пробуем torch
    if (capabilities.torch === true) {
      try {
        await track.applyConstraints({ torch: turnOn })
        success = true
      } catch (e) {
        console.warn('Torch не работает:', e.message)
      }
    }

    // Пробуем fillLightMode
    if (!success && capabilities.fillLightMode) {
      const mode = turnOn ? 'flash' : 'off'
      if (capabilities.fillLightMode.includes(mode)) {
        try {
          await track.applyConstraints({ fillLightMode: mode })
          success = true
        } catch (e) {
          console.warn('FillLightMode не работает:', e.message)
        }
      }
    }

    if (success) {
      isFlashlightOn.value = turnOn
      errorMessage.value = ''
    } else {
      throw new Error('Фонарик не поддерживается')
    }
  } catch (error) {
    console.error('Ошибка управления фонариком:', error)
    errorMessage.value = error.message
  }
}

// Показать информацию о камерах
const showCameraInfo = async () => {
  try {
    // Получаем разрешение и список камер
    const videoDevices = await getCameraPermissionAndDevices()

    const cameraInfo = videoDevices.map(d => ({
      deviceId: d.deviceId,
      label: d.label,
      isBack: isBackCameraDevice(d, videoDevices)
    }))

    const backCameras = cameraInfo.filter(camera => camera.isBack)
    const backCamerasInfo = backCameras.length > 0
      ? backCameras.map((camera, index) =>
          `${index + 1}. ${camera.label || 'Без названия'} (ID: ${camera.deviceId})`
        ).join('\n')
      : 'Задние камеры не найдены'

    const allCamerasInfo = cameraInfo.map((camera, index) =>
      `${index + 1}. ${camera.label || 'Без названия'} ${camera.isBack ? '(ЗАДНЯЯ)' : '(ПЕРЕДНЯЯ)'} (ID: ${camera.deviceId})`
    ).join('\n')

    alert(`📷 ИНФОРМАЦИЯ О КАМЕРАХ:\n\n` +
          `🔍 ВСЕ КАМЕРЫ (${cameraInfo.length}):\n${allCamerasInfo}\n\n` +
          `📱 ЗАДНИЕ КАМЕРЫ (${backCameras.length}):\n${backCamerasInfo}`)
  } catch (error) {
    console.error('Ошибка получения информации о камерах:', error)
    alert('Ошибка получения информации о камерах')
  }
}

// Переключение фонарика
const toggleFlashlight = async () => {
  try {
    if (!isFlashlightOn.value) {
      // Включаем
      if (!stream) {
        await startCamera()
      }
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

.flashlight__button--info {
  background: linear-gradient(45deg, #4CAF50 0%, #45a049 100%);
  margin-top: 1rem;
  width: 200px;
  height: 50px;
  font-size: 1rem;
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
