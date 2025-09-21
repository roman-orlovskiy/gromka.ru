<template>
  <div class="flashlight">
    <div class="flashlight__container">
      <h1 class="flashlight__title">Фонарик камеры</h1>

      <div class="flashlight__status" :class="{ 'flashlight__status--active': isFlashlightOn }">
        <div class="flashlight__status-indicator"></div>
        <span class="flashlight__status-text">
          {{ isFlashlightOn ? 'Фонарик включен' : 'Фонарик выключен' }}
        </span>
      </div>

      <div class="flashlight__controls">
        <ButtonComp
          :mod="isFlashlightOn ? 'gradient-2' : 'gradient-1'"
          @click="toggleFlashlight"
          :disabled="!hasCameraSupport"
        >
          {{ isFlashlightOn ? 'Выключить фонарик' : 'Включить фонарик' }}
        </ButtonComp>

        <ButtonComp
          mod="gradient-5"
          @click="runDiagnostics"
        >
          Диагностика
        </ButtonComp>
      </div>

      <div class="flashlight__info" v-if="!hasCameraSupport">
        <p>Ваше устройство не поддерживает функцию фонарика камеры</p>
      </div>

      <div class="flashlight__device-info" v-if="deviceInfo.isIOS || deviceInfo.isAndroid">
        <p>
          📱 <strong>{{ deviceInfo.isIOS ? 'iOS' : 'Android' }}</strong>
          | 🌐 <strong>{{ deviceInfo.isSafari ? 'Safari' : deviceInfo.isYaBrowser ? 'YaBrowser' : 'Chrome' }}</strong>
          | 🔦 <strong>{{ deviceInfo.supportsTorch ? 'torch' : deviceInfo.supportsFillLightMode ? 'fillLightMode' : 'не поддерживается' }}</strong>
        </p>
      </div>

      <div class="flashlight__error" v-if="errorMessage">
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'

const isFlashlightOn = ref(false)
const hasCameraSupport = ref(false)
const isStreamActive = ref(false)
const errorMessage = ref('')
const deviceInfo = ref({
  isIOS: false,
  isAndroid: false,
  isChrome: false,
  isSafari: false,
  isYaBrowser: false,
  supportsTorch: false,
  supportsFillLightMode: false,
  torchCapability: null
})
let stream = null
let track = null

const detectDeviceAndBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase()

  deviceInfo.value = {
    isIOS: /iphone|ipad|ipod/.test(userAgent),
    isAndroid: /android/.test(userAgent),
    isChrome: /chrome/.test(userAgent) && !/edg/.test(userAgent),
    isSafari: /safari/.test(userAgent) && !/chrome/.test(userAgent),
    isYaBrowser: /yabrowser/.test(userAgent),
    supportsTorch: false,
    supportsFillLightMode: false,
    torchCapability: null
  }

  console.log('📱 Информация об устройстве:', deviceInfo.value)
}

const checkCameraSupport = async () => {
  try {
    console.log('🔍 Проверка поддержки камеры...')

    if (!navigator.mediaDevices) {
      throw new Error('navigator.mediaDevices не поддерживается')
    }

    if (!navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia не поддерживается')
    }

    // Проверяем поддержку фонарика
    console.log('📱 Проверка доступных устройств...')
    const devices = await navigator.mediaDevices.enumerateDevices()
    console.log('📋 Найденные устройства:', devices)

    const videoDevices = devices.filter(device => device.kind === 'videoinput')
    hasCameraSupport.value = videoDevices.length > 0

    console.log('📹 Видеоустройства:', videoDevices)

    if (!hasCameraSupport.value) {
      throw new Error('Камера не найдена на устройстве')
    }

    console.log('✅ Поддержка камеры подтверждена')
  } catch (error) {
    console.error('❌ Ошибка проверки камеры:', error)
    errorMessage.value = error.message
    hasCameraSupport.value = false
    alert(`Ошибка проверки камеры: ${error.message}`)
  }
}

const startCamera = async () => {
  try {
    errorMessage.value = ''
    console.log('🎥 Запуск камеры...')

    // Получаем список всех камер
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device => device.kind === 'videoinput')

    console.log('📹 Найденные камеры:', cameras)

    if (cameras.length === 0) {
      throw new Error('Камеры не найдены на устройстве')
    }

    // Ищем заднюю камеру (обычно последняя в списке)
    let selectedCamera = cameras[cameras.length - 1]
    console.log('📱 Выбранная камера:', selectedCamera)

    // Создаем варианты ограничений в зависимости от устройства
    let constraintsOptions = []

    if (deviceInfo.value.isIOS) {
      // iOS Safari требует особый подход
      constraintsOptions = [
        // Вариант 1: iOS Safari - environment с идеальными параметрами
        {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 }
          }
        },
        // Вариант 2: iOS Safari - любая камера
        {
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 }
          }
        },
        // Вариант 3: iOS Safari - минимальные требования
        {
          video: true
        }
      ]
    } else if (deviceInfo.value.isAndroid) {
      // Android - пробуем разные варианты
      constraintsOptions = [
        // Вариант 1: Конкретная камера с environment
        {
          video: {
            deviceId: { exact: selectedCamera.deviceId },
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        },
        // Вариант 2: Любая камера с environment
        {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        },
        // Вариант 3: Конкретная камера без facingMode
        {
          video: {
            deviceId: { exact: selectedCamera.deviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        },
        // Вариант 4: Любая камера
        {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        },
        // Вариант 5: Минимальные требования
        {
          video: true
        }
      ]
    } else {
      // Другие устройства
      constraintsOptions = [
        {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        },
        {
          video: true
        }
      ]
    }

    let stream = null
    let lastError = null

    // Пробуем каждый вариант ограничений
    for (let i = 0; i < constraintsOptions.length; i++) {
      try {
        console.log(`🔄 Попытка ${i + 1}/${constraintsOptions.length}:`, constraintsOptions[i])
        stream = await navigator.mediaDevices.getUserMedia(constraintsOptions[i])
        console.log(`✅ Успешно запущена камера с ограничениями ${i + 1}`)
        break
      } catch (error) {
        console.warn(`❌ Попытка ${i + 1} неудачна:`, error.message)
        lastError = error
      }
    }

    if (!stream) {
      throw new Error(`Не удалось запустить ни одну камеру. Последняя ошибка: ${lastError?.message}`)
    }

    track = stream.getVideoTracks()[0]
    if (!track) {
      throw new Error('Не найден видео трек в потоке')
    }

    isStreamActive.value = true

    console.log('📹 Найденные треки:', stream.getVideoTracks())
    console.log('🔧 Настройки трека:', track.getSettings())
    console.log('⚙️ Поддерживаемые ограничения:', track.getCapabilities())

    // Проверяем, есть ли поддержка фонарика
    const capabilities = track.getCapabilities()
    console.log('🔦 Проверка поддержки фонарика...')
    console.log('🔦 fillLightMode:', capabilities.fillLightMode)
    console.log('🔦 torch:', capabilities.torch)

    // Обновляем информацию об устройстве
    deviceInfo.value.supportsTorch = capabilities.torch === true
    deviceInfo.value.supportsFillLightMode = capabilities.fillLightMode &&
      (capabilities.fillLightMode.includes('flash') || capabilities.fillLightMode.includes('torch'))
    deviceInfo.value.torchCapability = capabilities.torch

    console.log('📱 Обновленная информация об устройстве:', deviceInfo.value)

    console.log('🎬 Камера готова к работе с фонариком')

    console.log('✅ Камера успешно запущена')
  } catch (error) {
    console.error('❌ Ошибка запуска камеры:', error)
    errorMessage.value = `Ошибка доступа к камере: ${error.message}`
    isStreamActive.value = false
    alert(`Ошибка запуска камеры: ${error.message}\n\nПроверьте:\n- Разрешения на доступ к камере\n- Используется ли HTTPS\n- Поддерживает ли устройство камеру`)
  }
}

const getFlashlightConstraints = (turnOn) => {
  const constraints = []

  // Определяем приоритет в зависимости от устройства и поддержки
  if (deviceInfo.value.supportsTorch) {
    // Устройство поддерживает torch - используем его
    if (deviceInfo.value.isIOS) {
      // iOS Safari
      constraints.push(
        { advanced: [{ torch: turnOn }] },
        { torch: turnOn }
      )
    } else {
      // Android и другие
      constraints.push(
        { advanced: [{ torch: turnOn }] },
        { torch: turnOn }
      )
    }
  }

  if (deviceInfo.value.supportsFillLightMode) {
    // Устройство поддерживает fillLightMode
    const mode = turnOn ? 'flash' : 'off'
    constraints.push(
      { advanced: [{ fillLightMode: mode }] },
      { fillLightMode: mode }
    )
  }

  // Fallback варианты для максимальной совместимости
  if (turnOn) {
    constraints.push(
      { advanced: [{ torch: true }] },
      { torch: true },
      { advanced: [{ fillLightMode: 'flash' }] },
      { fillLightMode: 'flash' },
      { advanced: [{ fillLightMode: 'torch' }] },
      { fillLightMode: 'torch' }
    )
  } else {
    constraints.push(
      { advanced: [{ torch: false }] },
      { torch: false },
      { advanced: [{ fillLightMode: 'off' }] },
      { fillLightMode: 'off' }
    )
  }

  return constraints
}

const toggleFlashlight = async () => {
  if (!isStreamActive.value) {
    await startCamera()
    if (!isStreamActive.value) return
  }

  try {
    console.log('🔦 Попытка переключения фонарика...')
    console.log('📱 Информация об устройстве:', deviceInfo.value)
    console.log('📹 Текущий трек:', track)
    console.log('⚙️ Возможности трека:', track.getCapabilities())

    const capabilities = track.getCapabilities()
    console.log('🔍 Проверка поддержки фонарика...')
    console.log('🔦 fillLightMode:', capabilities.fillLightMode)
    console.log('🔦 torch:', capabilities.torch)

    if (isFlashlightOn.value) {
      // Выключаем фонарик
      console.log('🔦 Выключаем фонарик...')
      const offConstraints = getFlashlightConstraints(false)

      let turnedOff = false
      for (let i = 0; i < offConstraints.length; i++) {
        try {
          console.log(`🔄 Попытка выключения способом ${i + 1}:`, offConstraints[i])
          await track.applyConstraints(offConstraints[i])
          console.log(`✅ Фонарик выключен способом ${i + 1}`)
          turnedOff = true
          break
        } catch (error) {
          console.warn(`❌ Способ выключения ${i + 1} не сработал:`, error.message)
        }
      }

      if (turnedOff) {
        isFlashlightOn.value = false
        console.log('✅ Фонарик выключен')
      } else {
        throw new Error('Не удалось выключить фонарик')
      }
    } else {
      // Включаем фонарик
      console.log('🔦 Включаем фонарик...')
      const onConstraints = getFlashlightConstraints(true)

      let turnedOn = false
      for (let i = 0; i < onConstraints.length; i++) {
        try {
          console.log(`🔄 Попытка включения способом ${i + 1}:`, onConstraints[i])
          await track.applyConstraints(onConstraints[i])
          console.log(`✅ Фонарик включен способом ${i + 1}`)
          turnedOn = true
          break
        } catch (error) {
          console.warn(`❌ Способ включения ${i + 1} не сработал:`, error.message)
        }
      }

      if (turnedOn) {
        isFlashlightOn.value = true
        console.log('✅ Фонарик включен')
      } else {
        // Проверяем, поддерживает ли устройство фонарик вообще
        const hasSupport = deviceInfo.value.supportsTorch || deviceInfo.value.supportsFillLightMode

        if (!hasSupport) {
          throw new Error('Устройство не поддерживает функцию фонарика. Проверьте:\n- Используется ли задняя камера\n- Поддерживает ли устройство фонарик\n- Не заблокирован ли фонарик системными настройками')
        } else {
          throw new Error('Фонарик не удалось включить. Возможно, он уже используется другим приложением или заблокирован системой.')
        }
      }
    }
  } catch (error) {
    console.error('❌ Ошибка управления фонариком:', error)
    errorMessage.value = `Ошибка управления фонариком: ${error.message}`
    alert(`Ошибка управления фонариком: ${error.message}`)
  }
}


const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
    track = null
    isStreamActive.value = false
    isFlashlightOn.value = false

    console.log('Камера остановлена')
  }
}

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Современный способ для HTTPS
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback для HTTP или старых браузеров
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return successful
    }
  } catch (error) {
    console.error('Ошибка копирования в буфер обмена:', error)
    return false
  }
}

const runDiagnostics = async () => {
  console.log('🔍 Запуск полной диагностики...')

  let diagnosticInfo = '🔍 ДИАГНОСТИКА СИСТЕМЫ\n\n'

  // Информация о браузере и устройстве
  diagnosticInfo += `🌐 Протокол: ${window.location.protocol}\n`
  diagnosticInfo += `📱 User Agent: ${navigator.userAgent}\n`
  diagnosticInfo += `🔒 HTTPS: ${window.location.protocol === 'https:' ? '✅' : '❌'}\n`
  diagnosticInfo += `📹 MediaDevices: ${navigator.mediaDevices ? '✅' : '❌'}\n`
  diagnosticInfo += `🎥 getUserMedia: ${navigator.mediaDevices?.getUserMedia ? '✅' : '❌'}\n\n`

  // Информация об устройстве
  diagnosticInfo += `📱 ИНФОРМАЦИЯ ОБ УСТРОЙСТВЕ:\n`
  diagnosticInfo += `  iOS: ${deviceInfo.value.isIOS ? '✅' : '❌'}\n`
  diagnosticInfo += `  Android: ${deviceInfo.value.isAndroid ? '✅' : '❌'}\n`
  diagnosticInfo += `  Chrome: ${deviceInfo.value.isChrome ? '✅' : '❌'}\n`
  diagnosticInfo += `  Safari: ${deviceInfo.value.isSafari ? '✅' : '❌'}\n`
  diagnosticInfo += `  YaBrowser: ${deviceInfo.value.isYaBrowser ? '✅' : '❌'}\n`
  diagnosticInfo += `  Поддержка torch: ${deviceInfo.value.supportsTorch ? '✅' : '❌'}\n`
  diagnosticInfo += `  Поддержка fillLightMode: ${deviceInfo.value.supportsFillLightMode ? '✅' : '❌'}\n\n`

  try {
    // Проверяем устройства
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(d => d.kind === 'videoinput')

    diagnosticInfo += `📹 Видеоустройства (${videoDevices.length}):\n`
    videoDevices.forEach((device, index) => {
      diagnosticInfo += `  ${index + 1}. ${device.label || 'Без названия'} (${device.deviceId})\n`
    })
    diagnosticInfo += '\n'

    // Проверяем разрешения
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'camera' })
        diagnosticInfo += `🔐 Разрешение камеры: ${permission.state}\n`
      } catch {
        diagnosticInfo += `🔐 Разрешение камеры: Не удалось проверить\n`
      }
    }

    // Если есть активный трек, проверяем его возможности
    if (track) {
      const settings = track.getSettings()
      const capabilities = track.getCapabilities()

      diagnosticInfo += '\n📹 АКТИВНЫЙ ТРЕК:\n'
      diagnosticInfo += `  Разрешение: ${settings.width}x${settings.height}\n`
      diagnosticInfo += `  Частота кадров: ${settings.frameRate || 'неизвестно'}\n`
      diagnosticInfo += `  Камера: ${settings.facingMode || 'неизвестно'}\n`
      diagnosticInfo += `  Device ID: ${settings.deviceId || 'неизвестно'}\n`
      diagnosticInfo += `  fillLightMode: ${capabilities.fillLightMode ? capabilities.fillLightMode.join(', ') : 'не поддерживается'}\n`
      diagnosticInfo += `  torch: ${capabilities.torch !== undefined ? capabilities.torch : 'не поддерживается'}\n`

      // Дополнительная информация о фонарике
      if (capabilities.fillLightMode && capabilities.fillLightMode.includes('flash')) {
        diagnosticInfo += `  ✅ Фонарик поддерживается (fillLightMode)\n`
      } else if (capabilities.torch === true) {
        diagnosticInfo += `  ✅ Фонарик поддерживается (torch)\n`
      } else {
        diagnosticInfo += `  ❌ Фонарик НЕ поддерживается\n`
      }
    }

  } catch (error) {
    diagnosticInfo += `❌ Ошибка диагностики: ${error.message}\n`
  }

  console.log(diagnosticInfo)

  // Копируем в буфер обмена
  const copied = await copyToClipboard(diagnosticInfo)

  // Показываем алерт с информацией о копировании
  const alertMessage = copied
    ? `📋 ДИАГНОСТИКА СКОПИРОВАНА В БУФЕР ОБМЕНА\n\n${diagnosticInfo}`
    : `⚠️ НЕ УДАЛОСЬ СКОПИРОВАТЬ В БУФЕР ОБМЕНА\n\n${diagnosticInfo}`

  alert(alertMessage)
}

onMounted(() => {
  console.log('🚀 Инициализация страницы фонарика...')
  console.log('🌐 Протокол:', window.location.protocol)
  console.log('📱 User Agent:', navigator.userAgent)
  console.log('🔒 HTTPS:', window.location.protocol === 'https:')
  console.log('📹 MediaDevices:', !!navigator.mediaDevices)
  console.log('🎥 getUserMedia:', !!navigator.mediaDevices?.getUserMedia)

  // Определяем устройство и браузер
  detectDeviceAndBrowser()

  checkCameraSupport()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<style lang="scss">
.flashlight {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: $color-white;

  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    max-width: 600px;
    width: 100%;
  }

  &__title {
    font-size: 3.5rem;
    text-align: center;
    margin-bottom: 1rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 2rem;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;

    &--active {
      background-color: rgba(255, 215, 0, 0.2);
      border-color: rgba(255, 215, 0, 0.4);
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    }

    &-indicator {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background-color: #ff4757;
      transition: background-color 0.3s ease;
      box-shadow: 0 0 10px rgba(255, 71, 87, 0.5);
    }

    &--active &-indicator {
      background-color: #ffa502;
      box-shadow: 0 0 15px rgba(255, 165, 2, 0.7);
    }

    &-text {
      font-size: 1.8rem;
      font-weight: 500;
    }
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 300px;
  }


  &__info,
  &__error,
  &__device-info {
    padding: 1.5rem;
    border-radius: 1rem;
    text-align: center;
    font-size: 1.6rem;
    max-width: 400px;
  }

  &__device-info {
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-top: 1rem;
  }

  &__info {
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  &__error {
    background-color: rgba(255, 71, 87, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 71, 87, 0.4);
    color: #ffebee;
  }

  @media (max-width: 768px) {
    padding: 1rem;

    &__title {
      font-size: 2.5rem;
    }

    &__status-text {
      font-size: 1.5rem;
    }

    &__info,
    &__error {
      font-size: 1.4rem;
      padding: 1rem;
    }
  }
}
</style>
