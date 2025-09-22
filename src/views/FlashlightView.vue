<template>
  <div class="flashlight">
    <div class="flashlight__container">
      <h1 class="flashlight__title">Фонарик камеры</h1>

      <div class="flashlight__status" :class="{ 'flashlight__status--active': isFlashlightOn, 'flashlight__status--music': isPlayingMusic }">
        <div class="flashlight__status-indicator"></div>
        <span class="flashlight__status-text">
          {{ isPlayingMusic ? '🎵 Играет ритм' : 'Фонарик выключен' }}
        </span>
      </div>

      <div class="flashlight__controls">
        <ButtonComp
          :mod="isPlayingMusic ? 'gradient-3' : isFlashlightOn ? 'gradient-2' : 'gradient-1'"
          @click="toggleFlashlight"
          :disabled="!hasCameraSupport"
        >
          {{ isPlayingMusic ? 'Остановить' : 'Начать' }}
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

      <!-- Скрытый видео-элемент: привязка потока необходима для корректной инициализации трека/капаабилити на первом запуске на ряде устройств -->
      <video
        ref="videoEl"
        playsinline
        muted
        autoplay
        style="display: none; width: 0; height: 0"
      ></video>
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
const isPlayingMusic = ref(false)
const currentRhythm = ref(null)
const musicInterval = ref(null)
// Кэш быстрых ограничений для мгновенного переключения фонарика
const cachedConstraints = ref({ on: null, off: null })
// Кэш capabilities трека, чтобы не дергать их на каждом переключении
const cachedCapabilities = ref(null)
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
const videoEl = ref(null)

const loadRhythmData = async () => {
  try {
    console.log('🎵 Загрузка ритма Бетховена...')
    // Импортируем JSON файл напрямую
    const rhythmData = await import('@/assets/data/beethoven_rhythm.json')
    currentRhythm.value = rhythmData.default
    console.log('✅ Ритм Бетховена загружен:', rhythmData.default)
    return rhythmData.default
  } catch (error) {
    console.error('❌ Ошибка загрузки ритма:', error)
    // Создаем базовый ритм в случае ошибки
    currentRhythm.value = {
      name: "Ритм Бетховена (базовый)",
      description: "Та та та тааа",
      isCyclical: true,
      pattern: [
        { duration: 250, action: "on", description: "Та" },
        { duration: 250, action: "off", description: "пауза" },
        { duration: 250, action: "on", description: "та" },
        { duration: 250, action: "off", description: "пауза" },
        { duration: 250, action: "on", description: "та" },
        { duration: 250, action: "off", description: "пауза" },
        { duration: 500, action: "on", description: "тааа" },
        { duration: 500, action: "off", description: "длинная пауза" }
      ]
    }
    console.log('✅ Используем базовый ритм Бетховена')
    return currentRhythm.value
  }
}

const playMusic = async () => {
  if (isPlayingMusic.value) {
    stopMusic()
    return
  }

  if (!currentRhythm.value) {
    await loadRhythmData()
  }

  if (!track) {
    await startCamera()
    if (!track) {
      alert('Не удалось запустить камеру для музыкального фонарика')
      return
    }
  }

  console.log('🎵 Начинаем играть ритм Бетховена...')
  isPlayingMusic.value = true

  let currentNote = 0
  const pattern = currentRhythm.value.pattern

  const playNote = () => {
    if (!isPlayingMusic.value || !track) {
      return
    }

    const note = pattern[currentNote]
    console.log(`🎵 Играем ноту ${currentNote + 1}/${pattern.length}: ${note.description || note.action}`)

    // Включаем или выключаем фонарик
    if (note.action === 'on') {
      setFlashlightState(true)
    } else {
      setFlashlightState(false)
    }

    currentNote++

    // Если цикличность включена и ритм закончился, начинаем заново
    if (currentNote >= pattern.length) {
      if (currentRhythm.value.isCyclical) {
        console.log('🔄 Повторяем ритм Бетховена...')
        currentNote = 0
      } else {
        console.log('🎵 Ритм Бетховена завершен')
        stopMusic()
        return
      }
    }

    // Планируем следующую ноту
    musicInterval.value = setTimeout(playNote, note.duration)
  }

  // Начинаем воспроизведение
  playNote()
}

const stopMusic = () => {
  console.log('🛑 Останавливаем музыкальный фонарик')
  isPlayingMusic.value = false

  if (musicInterval.value) {
    clearTimeout(musicInterval.value)
    musicInterval.value = null
  }

  // Выключаем фонарик
  setFlashlightState(false)
}

const setFlashlightState = async (turnOn) => {
  if (!track) return

  try {
    // 1) Быстрый путь: если есть кэш рабочей конфигурации — пробуем сразу её
    const cached = turnOn ? cachedConstraints.value.on : cachedConstraints.value.off
    if (cached) {
      try {
        await track.applyConstraints(cached)
        isFlashlightOn.value = !!turnOn
        return
      } catch (e) {
        console.warn('⚠️ Кэшированное ограничение перестало работать, пробуем подбор…', e.message)
        // очищаем кэш, чтобы переобучить ниже
        if (turnOn) cachedConstraints.value.on = null
        else cachedConstraints.value.off = null
      }
    }

    // 2) Подбор рабочего ограничения и обучение кэша
    const constraints = getFlashlightConstraints(turnOn)
    for (const constraint of constraints) {
      try {
        await track.applyConstraints(constraint)
        isFlashlightOn.value = !!turnOn
        // сохраняем удачное ограничение для будущих мгновенных переключений
        if (turnOn) cachedConstraints.value.on = constraint
        else cachedConstraints.value.off = constraint
        return
      } catch {
        // пробуем следующий вариант
      }
    }
  } catch (error) {
    console.error('❌ Ошибка управления фонариком:', error)
  }
}

const detectDeviceAndBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase()

  // Определяем версию iOS
  let iosVersion = null
  if (/iphone|ipad|ipod/.test(userAgent)) {
    const match = userAgent.match(/os (\d+)_(\d+)/)
    if (match) {
      iosVersion = parseInt(match[1]) + parseInt(match[2]) / 10
    }
  }

  // Определяем Telegram WebView
  const isTelegramWebView = /telegram/i.test(userAgent) ||
    (window.Telegram && window.Telegram.WebApp) ||
    window.location.hostname.includes('t.me') ||
    window.location.hostname.includes('telegram.org')

  deviceInfo.value = {
    isIOS: /iphone|ipad|ipod/.test(userAgent),
    isAndroid: /android/.test(userAgent),
    isChrome: /chrome/.test(userAgent) && !/edg/.test(userAgent),
    isSafari: /safari/.test(userAgent) && !/chrome/.test(userAgent),
    isYaBrowser: /yabrowser/.test(userAgent),
    isTelegramWebView: isTelegramWebView,
    iosVersion: iosVersion,
    isOldIOS: iosVersion && iosVersion < 17, // iOS 16 и ниже считаются старыми
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
      // iOS Safari - пробуем разные подходы для максимальной совместимости
      constraintsOptions = [
        // Вариант 1: Конкретная задняя камера (для старых iOS)
        {
          video: {
            deviceId: { exact: selectedCamera.deviceId },
            facingMode: 'environment',
            width: { ideal: 720, max: 1280 },
            height: { ideal: 1280, max: 1920 }
          }
        },
        // Вариант 2: environment с идеальными параметрами
        {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 720, max: 1280 },
            height: { ideal: 1280, max: 1920 },
            frameRate: { ideal: 30, max: 60 }
          }
        },
        // Вариант 3: Простой environment
        {
          video: {
            facingMode: 'environment'
          }
        },
        // Вариант 4: Любая камера с ограничениями
        {
          video: {
            width: { ideal: 720, max: 1280 },
            height: { ideal: 1280, max: 1920 },
            frameRate: { ideal: 30, max: 60 }
          }
        },
        // Вариант 5: Минимальные требования
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

    // ВАЖНО: не затенять внешнюю переменную stream — иначе stopCamera не сможет корректно остановить треки
    stream = null
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

    // Привязываем поток к скрытому видео и запускаем воспроизведение — это помогает на Android/iOS корректно инициализировать трек
    try {
      if (videoEl.value) {
        if (videoEl.value.srcObject !== stream) {
          videoEl.value.srcObject = stream
        }
        const playPromise = videoEl.value.play()
        if (playPromise && typeof playPromise.then === 'function') {
          await playPromise.catch(() => {})
        }
      }
    } catch (e) {
      console.warn('⚠️ Не удалось авто-воспроизвести скрытое видео:', e?.message)
    }

    // Небольшая задержка, чтобы трек перешёл в состояние live и появились корректные capabilities
    await new Promise(resolve => setTimeout(resolve, 150))

    console.log('📹 Найденные треки:', stream.getVideoTracks())
    console.log('🔧 Настройки трека:', track.getSettings())
    console.log('⚙️ Поддерживаемые ограничения (первичный снимок):', track.getCapabilities())

    // Проверяем, есть ли поддержка фонарика. На некоторых устройствах флаги появляются не мгновенно — делаем несколько попыток.
    const waitForTorchSupport = async (mediaTrack, attempts = 8, delayMs = 120) => {
      let caps = null
      for (let attempt = 0; attempt < attempts; attempt++) {
        try {
          caps = mediaTrack.getCapabilities()
        } catch {
          caps = null
        }
        if (
          caps && (
            caps.torch === true ||
            (Array.isArray(caps.fillLightMode) && (caps.fillLightMode.includes('flash') || caps.fillLightMode.includes('torch')))
          )
        ) {
          return caps
        }
        await new Promise(r => setTimeout(r, delayMs))
      }
      return caps || mediaTrack.getCapabilities()
    }

    const capabilities = await waitForTorchSupport(track)
    cachedCapabilities.value = capabilities
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

  // Специальная логика для старых iOS
  if (deviceInfo.value.isOldIOS) {
    console.log('🍎 Старая версия iOS - используем альтернативные методы')

    // Для старых iOS пробуем все возможные варианты
    if (turnOn) {
      constraints.push(
        // Стандартные варианты
        { advanced: [{ torch: true }] },
        { torch: true },
        { advanced: [{ fillLightMode: 'flash' }] },
        { fillLightMode: 'flash' },
        { advanced: [{ fillLightMode: 'torch' }] },
        { fillLightMode: 'torch' },
        // Альтернативные варианты для старых iOS
        { advanced: [{ fillLightMode: 'on' }] },
        { fillLightMode: 'on' },
        { advanced: [{ flash: true }] },
        { flash: true }
      )
    } else {
      constraints.push(
        { advanced: [{ torch: false }] },
        { torch: false },
        { advanced: [{ fillLightMode: 'off' }] },
        { fillLightMode: 'off' },
        { advanced: [{ flash: false }] },
        { flash: false }
      )
    }
  } else {
    // Обычная логика для новых устройств
    if (deviceInfo.value.supportsTorch) {
      constraints.push(
        { advanced: [{ torch: turnOn }] },
        { torch: turnOn }
      )
    }

    if (deviceInfo.value.supportsFillLightMode) {
      const mode = turnOn ? 'flash' : 'off'
      constraints.push(
        { advanced: [{ fillLightMode: mode }] },
        { fillLightMode: mode }
      )
    }

    // Fallback варианты
    if (turnOn) {
      constraints.push(
        { advanced: [{ torch: true }] },
        { torch: true },
        { advanced: [{ fillLightMode: 'flash' }] },
        { fillLightMode: 'flash' }
      )
    } else {
      constraints.push(
        { advanced: [{ torch: false }] },
        { torch: false },
        { advanced: [{ fillLightMode: 'off' }] },
        { fillLightMode: 'off' }
      )
    }
  }

  return constraints
}

const toggleFlashlight = async () => {
  if (!isStreamActive.value) {
    await startCamera()
    if (!isStreamActive.value) return
  }

  try {
    console.log('🔦 Переключение фонарика...')
    // Используем кэшированные capabilities (быстрее), при отсутствии — достаем один раз
    const capabilities = cachedCapabilities.value || track.getCapabilities()
    if (!cachedCapabilities.value) cachedCapabilities.value = capabilities

    const hasSupport = capabilities.torch === true ||
      (capabilities.fillLightMode && (capabilities.fillLightMode.includes('flash') || capabilities.fillLightMode.includes('torch')))

    if (!hasSupport) {
      throw new Error('Устройство не поддерживает функцию фонарика. Проверьте:\n- Используется ли задняя камера\n- Поддерживает ли устройство фонарик\n- Не заблокирован ли фонарик системными настройками')
    }

    // Если фонарик уже включен или играет музыка - выключаем
    if (isFlashlightOn.value || isPlayingMusic.value) {
      console.log('🔦 Выключаем фонарик и останавливаем музыку...')
      stopMusic()
      await setFlashlightState(false)
      console.log('✅ Фонарик выключен')
    } else {
      // Включаем фонарик и начинаем играть ритм Бетховена
      console.log('🎵 Включаем фонарик и начинаем играть ритм Бетховена...')
      await playMusic()
      console.log('✅ Музыкальный фонарик запущен')
    }
  } catch (error) {
    console.error('❌ Ошибка управления фонариком:', error)
    errorMessage.value = `Ошибка управления фонариком: ${error.message}`
    alert(`Ошибка управления фонариком: ${error.message}`)
  }
}


const stopCamera = () => {
  // Останавливаем музыку
  stopMusic()

  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
    track = null
    isStreamActive.value = false
    isFlashlightOn.value = false
    // Сбрасываем кэш, так как трек потерян
    cachedConstraints.value.on = null
    cachedConstraints.value.off = null
    cachedCapabilities.value = null

    console.log('Камера остановлена')
  }
}

const copyToClipboard = async (text) => {
  console.log('📋 Попытка копирования в буфер обмена...')

  try {
    // Метод 1: Современный Clipboard API (может не работать в Telegram WebView)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        console.log('✅ Скопировано через Clipboard API')
        return true
      } catch (clipboardError) {
        console.warn('⚠️ Clipboard API не работает:', clipboardError.message)
      }
    }

    // Метод 2: document.execCommand (работает в большинстве случаев)
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'
      textArea.setAttribute('readonly', '')

      document.body.appendChild(textArea)

      // Выделяем текст
      textArea.focus()
      textArea.select()
      textArea.setSelectionRange(0, 99999) // Для мобильных устройств

      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (successful) {
        console.log('✅ Скопировано через document.execCommand')
        return true
      }
    } catch (execError) {
      console.warn('⚠️ document.execCommand не работает:', execError.message)
    }

    // Метод 3: Создание временного элемента с выделением (для iOS Safari в Telegram)
    try {
      const range = document.createRange()
      const selection = window.getSelection()

      const textNode = document.createTextNode(text)
      const tempDiv = document.createElement('div')
      tempDiv.appendChild(textNode)
      tempDiv.style.position = 'fixed'
      tempDiv.style.left = '-999999px'
      tempDiv.style.top = '-999999px'

      document.body.appendChild(tempDiv)

      range.selectNodeContents(tempDiv)
      selection.removeAllRanges()
      selection.addRange(range)

      const successful = document.execCommand('copy')
      selection.removeAllRanges()
      document.body.removeChild(tempDiv)

      if (successful) {
        console.log('✅ Скопировано через выделение текста')
        return true
      }
    } catch (rangeError) {
      console.warn('⚠️ Метод выделения текста не работает:', rangeError.message)
    }

    console.log('❌ Все методы копирования не сработали')
    return false

  } catch (error) {
    console.error('❌ Общая ошибка копирования:', error)
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
  if (deviceInfo.value.isIOS && deviceInfo.value.iosVersion) {
    diagnosticInfo += `  Версия iOS: ${deviceInfo.value.iosVersion}\n`
    diagnosticInfo += `  Старая версия iOS: ${deviceInfo.value.isOldIOS ? '✅ (может не поддерживать torch)' : '❌'}\n`
  }
  diagnosticInfo += `  Android: ${deviceInfo.value.isAndroid ? '✅' : '❌'}\n`
  diagnosticInfo += `  Chrome: ${deviceInfo.value.isChrome ? '✅' : '❌'}\n`
  diagnosticInfo += `  Safari: ${deviceInfo.value.isSafari ? '✅' : '❌'}\n`
  diagnosticInfo += `  YaBrowser: ${deviceInfo.value.isYaBrowser ? '✅' : '❌'}\n`
  diagnosticInfo += `  Telegram WebView: ${deviceInfo.value.isTelegramWebView ? '✅ (ограничения копирования)' : '❌'}\n`
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
  let alertMessage = ''

  if (copied) {
    alertMessage = `📋 ДИАГНОСТИКА СКОПИРОВАНА В БУФЕР ОБМЕНА\n\n${diagnosticInfo}`
  } else {
    // Специальные инструкции для Telegram WebView
    if (deviceInfo.value.isTelegramWebView) {
      alertMessage = `⚠️ TELEGRAM WEBVIEW - ОГРАНИЧЕНИЯ КОПИРОВАНИЯ\n\n` +
        `📱 Для копирования в Telegram:\n` +
        `1. Выделите весь текст ниже\n` +
        `2. Нажмите "Копировать" в контекстном меню\n` +
        `3. Или используйте Ctrl+C (Cmd+C на Mac)\n\n` +
        `📋 ДИАГНОСТИКА:\n\n${diagnosticInfo}`
    } else {
      alertMessage = `⚠️ НЕ УДАЛОСЬ СКОПИРОВАТЬ В БУФЕР ОБМЕНА\n\n` +
        `📱 Попробуйте:\n` +
        `1. Выделить текст вручную\n` +
        `2. Нажать Ctrl+C (Cmd+C на Mac)\n\n` +
        `📋 ДИАГНОСТИКА:\n\n${diagnosticInfo}`
    }
  }

  alert(alertMessage)
}

onMounted(async () => {
  console.log('🚀 Инициализация страницы фонарика...')
  console.log('🌐 Протокол:', window.location.protocol)
  console.log('📱 User Agent:', navigator.userAgent)
  console.log('🔒 HTTPS:', window.location.protocol === 'https:')
  console.log('📹 MediaDevices:', !!navigator.mediaDevices)
  console.log('🎥 getUserMedia:', !!navigator.mediaDevices?.getUserMedia)

  // Определяем устройство и браузер
  detectDeviceAndBrowser()

  // Загружаем ритм Бетховена
  await loadRhythmData()

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

    &--music {
      background-color: rgba(255, 0, 255, 0.2);
      border-color: rgba(255, 0, 255, 0.4);
      box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
      animation: pulse-music 0.5s ease-in-out infinite alternate;
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

    &--music &-indicator {
      background-color: #ff00ff;
      box-shadow: 0 0 15px rgba(255, 0, 255, 0.7);
      animation: pulse-indicator 0.5s ease-in-out infinite alternate;
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

@keyframes pulse-music {
  0% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
  }
  100% {
    transform: scale(1.02);
    box-shadow: 0 0 30px rgba(255, 0, 255, 0.5);
  }
}

@keyframes pulse-indicator {
  0% {
    transform: scale(1);
    box-shadow: 0 0 15px rgba(255, 0, 255, 0.7);
  }
  100% {
    transform: scale(1.1);
    box-shadow: 0 0 25px rgba(255, 0, 255, 1);
  }
}
</style>
