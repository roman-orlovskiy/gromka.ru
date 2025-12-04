import { ref } from 'vue'
import { useLogging } from '@/composables/useLogging'

export const useCamera = () => {
  // Используем useLogging для логирования
  const {
    trackFlashlightChange: logTrackFlashlightChange,
    logCameraAttempt: logCameraAttemptInternal,
    logPlatformInfo: logPlatformInfoInternal
  } = useLogging()
  const cameraMethod = ref('environment')
  const camera = ref(null)
  const devices = ref([])
  const isFlashlightOn = ref(false)
  const isFlashlightSupported = ref(null)
  const cachedStream = ref(null)
  const cachedAudioStream = ref(null) // Кэш audio стрима для передачи в useAudio
  // Кэш быстрых ограничений для мгновенного переключения фонарика
  const cachedConstraints = ref({ on: null, off: null })
  // Кэш capabilities трека, чтобы не дергать их на каждом переключении
  const cachedCapabilities = ref(null)
  const isPermissionRequested = ref(false) // Флаг запроса разрешений
  let track = null // Трек камеры

  // Информация об устройстве
  const deviceInfo = ref({
    isIOS: false,
    isAndroid: false,
    isChrome: false,
    isSafari: false,
    isYaBrowser: false,
    supportsTorch: false,
    supportsFillLightMode: false,
    torchCapability: null,
    iosVersion: null,
    isOldIOS: false
  })

  // Определение устройства и браузера (из FlashlightView_old.vue)
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

  // Инициализация определения устройства
  detectDeviceAndBrowser()

  // Задержка для ожидания готовности
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  // Утилита: остановка стрима (только video tracks, audio сохраняем)
  const stopStream = (stream, keepAudio = false) => {
    if (stream && stream.getTracks) {
      stream.getTracks().forEach(track => {
        if (keepAudio && track.kind === 'audio') return
        track.stop()
      })
    }
  }

  // Утилита: извлечение и кэширование audio stream
  const cacheAudioFromStream = (stream) => {
    if (!stream) return null
    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length > 0) {
      // Создаём новый MediaStream только с audio tracks
      const audioOnlyStream = new MediaStream(audioTracks)
      cachedAudioStream.value = audioOnlyStream
      return audioOnlyStream
    }
    return null
  }

  // Скрытое видео для «прогрева» трека (из FlashlightView_old.vue)
  let hiddenVideoEl = null
  const getHiddenVideoEl = () => {
    if (typeof document === 'undefined') {
      return null
    }
    if (!hiddenVideoEl) {
      hiddenVideoEl = document.createElement('video')
      hiddenVideoEl.playsInline = true
      hiddenVideoEl.muted = true
      hiddenVideoEl.autoplay = true
      hiddenVideoEl.setAttribute('aria-hidden', 'true')
      hiddenVideoEl.style.position = 'absolute'
      hiddenVideoEl.style.top = '0'
      hiddenVideoEl.style.left = '0'
      hiddenVideoEl.style.width = '1px'
      hiddenVideoEl.style.height = '1px'
      hiddenVideoEl.style.opacity = '0'
      hiddenVideoEl.style.pointerEvents = 'none'
      document.body.appendChild(hiddenVideoEl)
    }
    return hiddenVideoEl
  }

  // Ожидание появления torch support (из FlashlightView_old.vue)
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
      await delay(delayMs)
    }
    return caps || mediaTrack.getCapabilities()
  }

  // Получение вариантов constraints для фонарика (из FlashlightView_old.vue)
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

  // Установка состояния фонарика с кэшированием (из FlashlightView_old.vue)
  const setFlashlightState = async (turnOn) => {
    if (!track) return false

    try {
      // 1) Быстрый путь: если есть кэш рабочей конфигурации — пробуем сразу её
      const cached = turnOn ? cachedConstraints.value.on : cachedConstraints.value.off
      if (cached) {
        try {
          await track.applyConstraints(cached)
          isFlashlightOn.value = !!turnOn
            return true
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
          return true
        } catch {
          // пробуем следующий вариант
        }
      }
    } catch (error) {
      console.error('❌ Ошибка управления фонариком:', error)
    }

    return false
  }

  // Запрос разрешений на камеру (из FlashlightView_old.vue)
  const requestCameraPermission = async (logCallbacks = null) => {
    const { logCameraAttempt: logCameraAttemptCallback } = logCallbacks || {}
    const logCameraAttempt = logCameraAttemptCallback || logCameraAttemptInternal

    try {
      console.log('🔐 Запрос разрешений на камеру...')
      logCameraAttempt({
        stage: 'requesting_permission'
      })

      // Делаем минимальный запрос разрешений на камеру
      const permissionStream = await navigator.mediaDevices.getUserMedia({ video: true })

      // Сразу останавливаем стрим - нам нужны только разрешения
      permissionStream.getTracks().forEach(track => track.stop())

      console.log('✅ Разрешения на камеру получены')
      logCameraAttempt({
        stage: 'permission_granted'
      })
      return true
    } catch (error) {
      console.error('❌ Ошибка запроса разрешений на камеру:', error)
      logCameraAttempt({
        stage: 'permission_denied',
        error: error.message
      })
      return false
    }
  }

  // Запуск камеры (из FlashlightView_old.vue)
  const startCamera = async (includeAudio = false, logCallbacks = null) => {
    const { logCameraAttempt: logCameraAttemptCallback } = logCallbacks || {}
    const logCameraAttempt = logCameraAttemptCallback || logCameraAttemptInternal

    try {
      console.log('🎥 Запуск камеры...')
      logCameraAttempt({
        stage: 'starting_camera',
        includeAudio
      })

      // Получаем список всех камер
      const devicesList = await navigator.mediaDevices.enumerateDevices()
      const cameras = devicesList.filter(device => device.kind === 'videoinput')

      console.log('📹 Найденные камеры:', cameras)
      logCameraAttempt({
        stage: 'cameras_enumerated',
        count: cameras.length
      })

      if (cameras.length === 0) {
        throw new Error('Камеры не найдены на устройстве')
      }

      // Ищем заднюю камеру (обычно последняя в списке)
      let selectedCamera = cameras[cameras.length - 1]
      console.log('📱 Выбранная камера:', selectedCamera)

      // Audio constraints для объединённого запроса (камера + микрофон)
      const audioConstraints = {
        sampleRate: 44100,
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }

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
            },
            audio: includeAudio ? audioConstraints : false
          },
          // Вариант 2: environment с идеальными параметрами
          {
      video: {
        facingMode: { ideal: 'environment' },
              width: { ideal: 720, max: 1280 },
              height: { ideal: 1280, max: 1920 },
              frameRate: { ideal: 30, max: 60 }
      },
      audio: includeAudio ? audioConstraints : false
          },
          // Вариант 3: Простой environment
          {
      video: {
              facingMode: 'environment'
      },
      audio: includeAudio ? audioConstraints : false
          },
          // Вариант 4: Любая камера с ограничениями
          {
            video: {
              width: { ideal: 720, max: 1280 },
              height: { ideal: 1280, max: 1920 },
              frameRate: { ideal: 30, max: 60 }
            },
            audio: includeAudio ? audioConstraints : false
          },
          // Вариант 5: Минимальные требования
          {
            video: true,
            audio: includeAudio ? audioConstraints : false
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
      },
      audio: includeAudio ? audioConstraints : false
          },
          // Вариант 2: Любая камера с environment
          {
      video: {
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
      },
      audio: includeAudio ? audioConstraints : false
          },
          // Вариант 3: Конкретная камера без facingMode
          {
            video: {
              deviceId: { exact: selectedCamera.deviceId },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            },
            audio: includeAudio ? audioConstraints : false
          },
          // Вариант 4: Любая камера
          {
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            },
            audio: includeAudio ? audioConstraints : false
          },
          // Вариант 5: Минимальные требования
          {
      video: true,
      audio: includeAudio ? audioConstraints : false
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
            },
            audio: includeAudio ? audioConstraints : false
          },
          {
            video: true,
            audio: includeAudio ? audioConstraints : false
          }
        ]
      }

      // ВАЖНО: не затенять внешнюю переменную stream — иначе stopCamera не сможет корректно остановить треки
      let stream = null
    let lastError = null

      // Пробуем каждый вариант ограничений
      for (let i = 0; i < constraintsOptions.length; i++) {
      try {
          console.log(`🔄 Попытка ${i + 1}/${constraintsOptions.length}:`, constraintsOptions[i])
          logCameraAttempt({
            stage: 'trying_constraints',
            attempt: i + 1,
            total: constraintsOptions.length,
            constraints: constraintsOptions[i]
          })
          stream = await navigator.mediaDevices.getUserMedia(constraintsOptions[i])
          console.log(`✅ Успешно запущена камера с ограничениями ${i + 1}`)
          logCameraAttempt({
            stage: 'camera_started',
            attempt: i + 1,
            success: true
          })
          break
      } catch (error) {
          console.warn(`❌ Попытка ${i + 1} неудачна:`, error.message)
          logCameraAttempt({
            stage: 'camera_start_failed',
            attempt: i + 1,
            error: error.message
          })
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

      // Привязываем поток к скрытому видео и запускаем воспроизведение — это помогает на Android/iOS корректно инициализировать трек
      const videoEl = getHiddenVideoEl()
      try {
        if (videoEl) {
          if (videoEl.srcObject !== stream) {
            videoEl.srcObject = stream
          }
          const playPromise = videoEl.play()
          if (playPromise && typeof playPromise.then === 'function') {
            await playPromise.catch(() => {})
          }
        }
      } catch (e) {
        console.warn('⚠️ Не удалось авто-воспроизвести скрытое видео:', e?.message)
      }

      // Небольшая задержка, чтобы трек перешёл в состояние live и появились корректные capabilities
      await delay(150)

      console.log('📹 Найденные треки:', stream.getVideoTracks())
      console.log('🔧 Настройки трека:', track.getSettings())
      console.log('⚙️ Поддерживаемые ограничения (первичный снимок):', track.getCapabilities())

      // Проверяем, есть ли поддержка фонарика. На некоторых устройствах флаги появляются не мгновенно — делаем несколько попыток.
      const capabilities = await waitForTorchSupport(track)
      cachedCapabilities.value = capabilities
      console.log('🔦 Проверка поддержки фонарика...')
      console.log('🔦 fillLightMode:', capabilities.fillLightMode)
      console.log('🔦 torch:', capabilities.torch)

            logCameraAttempt({
        stage: 'torch_capabilities_checked',
        torch: capabilities.torch,
        fillLightMode: capabilities.fillLightMode
      })

      // Обновляем информацию об устройстве
      deviceInfo.value.supportsTorch = capabilities.torch === true
      deviceInfo.value.supportsFillLightMode = capabilities.fillLightMode &&
        (capabilities.fillLightMode.includes('flash') || capabilities.fillLightMode.includes('torch'))
      deviceInfo.value.torchCapability = capabilities.torch

      console.log('📱 Обновленная информация об устройстве:', deviceInfo.value)
      console.log('🎬 Камера готова к работе с фонариком')
      console.log('✅ Камера успешно запущена')

      // Кэшируем audio stream если был запрошен
      const audioStream = includeAudio ? cacheAudioFromStream(stream) : null

      return { stream, audioStream }
      } catch (error) {
      console.error('❌ Ошибка запуска камеры:', error)
          logCameraAttempt({
        stage: 'camera_start_error',
            error: error.message
          })
      throw error
    }
  }

  // Включение фонарика - универсальный метод с поддержкой разных устройств
  // logCallbacks: { trackFlashlightChange, logCameraAttempt, logPlatformInfo } или function (для обратной совместимости)
  // options: { includeAudio: boolean } — запросить камеру и микрофон одним запросом
  const turnOnFlashlight = async (logCallbacks = null, options = {}) => {
    // Обратная совместимость: если передана функция, оборачиваем её
    const callbacks = typeof logCallbacks === 'function'
      ? { trackFlashlightChange: logCallbacks }
      : logCallbacks

    const { trackFlashlightChange: trackFlashlightChangeCallback, logCameraAttempt: logCameraAttemptCallback, logPlatformInfo: logPlatformInfoCallback } = callbacks || {}
    const { includeAudio = false } = options

    // Используем callbacks если переданы, иначе методы из useLogging
    const trackFlashlightChange = trackFlashlightChangeCallback || logTrackFlashlightChange
    const logCameraAttempt = logCameraAttemptCallback || logCameraAttemptInternal
    const logPlatformInfo = logPlatformInfoCallback || logPlatformInfoInternal

    // Логируем информацию о платформе
    logPlatformInfo({
      isIOS: deviceInfo.value.isIOS,
      isAndroid: deviceInfo.value.isAndroid,
      isChrome: deviceInfo.value.isChrome,
      isSafari: deviceInfo.value.isSafari,
      isYaBrowser: deviceInfo.value.isYaBrowser,
      iosVersion: deviceInfo.value.iosVersion,
      isOldIOS: deviceInfo.value.isOldIOS
    })

    if (isFlashlightOn.value) {
      // Если фонарик уже включен, но передан callback, логируем это
      trackFlashlightChange(true, 'cached')
        logCameraAttempt({
        stage: 'already_on'
        })
      // Возвращаем кэшированный audio stream если есть
      return { success: true, method: 'cached', audioStream: cachedAudioStream.value }
    }

    let stream = cachedStream.value
    let usedMethod = 'cached'

    try {
      // Если нет кэшированного стрима, создаем новый
      if (!stream) {
          logCameraAttempt({
            stage: 'no_cached_stream',
            action: 'creating_new'
          })

        // Запрашиваем разрешения только один раз при первом запуске
        if (!isPermissionRequested.value) {
          const permissionGranted = await requestCameraPermission(callbacks)
          if (!permissionGranted) {
            throw new Error('Разрешения на камеру не были предоставлены')
          }
          isPermissionRequested.value = true

          // Ждем 600мс после выданных разрешений перед запуском камеры
          console.log('⏳ Ожидание прогрева камеры (600мс)...')
          logCameraAttempt({
            stage: 'waiting_after_permission',
            delay: 600
          })
          await delay(600)
        }

        // Теперь запускаем камеру
        const result = await startCamera(includeAudio, callbacks)
        stream = result.stream
        usedMethod = 'startCamera'
        if (includeAudio && result.audioStream) {
          cachedAudioStream.value = result.audioStream
        }
      } else {
        usedMethod = 'cached'
          logCameraAttempt({
          stage: 'using_cached_stream'
        })
      }

      // Используем кэшированные capabilities (быстрее), при отсутствии — достаем один раз
      const capabilities = cachedCapabilities.value || track.getCapabilities()
      if (!cachedCapabilities.value) cachedCapabilities.value = capabilities

      const hasSupport = capabilities.torch === true ||
        (capabilities.fillLightMode && (capabilities.fillLightMode.includes('flash') || capabilities.fillLightMode.includes('torch')))

      if (!hasSupport) {
          logCameraAttempt({
          stage: 'torch_not_supported',
          capabilities
          })
        throw new Error('Устройство не поддерживает функцию фонарика. Проверьте:\n- Используется ли задняя камера\n- Поддерживает ли устройство фонарик\n- Не заблокирован ли фонарик системными настройками')
      }

        logCameraAttempt({
        stage: 'enabling_torch'
        })

      const success = await setFlashlightState(true)
      if (!success) {
          logCameraAttempt({
            stage: 'torch_enable_failed',
            reason: 'apply_constraints_failed'
          })
        throw new Error('Не удалось включить фонарик')
      }

      cachedStream.value = stream
        camera.value = stream
        isFlashlightOn.value = true

        trackFlashlightChange(true, usedMethod)
        logCameraAttempt({
          stage: 'torch_enabled',
          success: true,
        method: usedMethod
        })

      return { success: true, method: usedMethod, audioStream: cachedAudioStream.value }
    } catch (error) {
      // ВАЖНО: Сохраняем audio stream в кэш перед остановкой, если он был получен
      if (includeAudio && stream && !cachedAudioStream.value) {
        cacheAudioFromStream(stream)
      }

      // Останавливаем только video стрим при ошибке, сохраняем audio
      if (stream && !cachedStream.value) {
        stopStream(stream, includeAudio) // keepAudio = true если был запрошен audio
      }

      // Логируем ошибку включения
        trackFlashlightChange(false, usedMethod || 'unknown')
        logCameraAttempt({
          stage: 'error',
          method: usedMethod || 'unknown',
        error: error.message
        })
      throw error
    }
  }

  // Выключение фонарика
  // logCallbacks: { trackFlashlightChange, logCameraAttempt } или function (для обратной совместимости)
  const turnOffFlashlight = async (logCallbacks = null) => {
    // Обратная совместимость: если передана функция, оборачиваем её
    const callbacks = typeof logCallbacks === 'function'
      ? { trackFlashlightChange: logCallbacks }
      : logCallbacks

    const { trackFlashlightChange: trackFlashlightChangeCallback, logCameraAttempt: logCameraAttemptCallback } = callbacks || {}

    // Используем callbacks если переданы, иначе методы из useLogging
    const trackFlashlightChange = trackFlashlightChangeCallback || logTrackFlashlightChange
    const logCameraAttempt = logCameraAttemptCallback || logCameraAttemptInternal

    if (!isFlashlightOn.value) {
        logCameraAttempt({
          stage: 'already_off'
        })
      return
    }

    logCameraAttempt({
      stage: 'disabling_torch'
    })

    const success = await setFlashlightState(false)
    isFlashlightOn.value = false

        logCameraAttempt({
          stage: 'torch_disabled',
      success
    })

    // Логируем выключение
    trackFlashlightChange(false, 'turnOff')
  }

  // Проверка поддержки фонарика - просто пытается включить и возвращает true/false
  // logCallbacks: { trackFlashlightChange, logCameraAttempt, logPlatformInfo } или function (для обратной совместимости)
  // options: { includeAudio: boolean } — запросить камеру и микрофон одним запросом
  const checkFlashlightSupport = async (logCallbacks = null, options = {}) => {
    // Обратная совместимость: если передана функция, оборачиваем её
    const callbacks = typeof logCallbacks === 'function'
      ? { trackFlashlightChange: logCallbacks }
      : logCallbacks

    const { trackFlashlightChange: trackFlashlightChangeCallback, logCameraAttempt: logCameraAttemptCallback } = callbacks || {}
    const { includeAudio = false } = options

    // Используем callbacks если переданы, иначе методы из useLogging
    const trackFlashlightChange = trackFlashlightChangeCallback || logTrackFlashlightChange
    const logCameraAttempt = logCameraAttemptCallback || logCameraAttemptInternal

    // Если поддержка уже проверена, но передан callback, логируем текущее состояние
    if (isFlashlightSupported.value !== null) {
      trackFlashlightChange(isFlashlightOn.value, 'cached')
        logCameraAttempt({
          stage: 'already_checked',
          isSupported: isFlashlightSupported.value,
        isOn: isFlashlightOn.value
        })
      // Возвращаем объект с audioStream для согласованности
      return { supported: isFlashlightSupported.value, audioStream: cachedAudioStream.value }
    }

      logCameraAttempt({
        stage: 'checking_support',
        action: 'starting',
        includeAudio
      })

    try {
      const result = await turnOnFlashlight(callbacks, { includeAudio })
      isFlashlightSupported.value = true

        logCameraAttempt({
          stage: 'support_check_complete',
          isSupported: true,
          hasAudio: !!result.audioStream
        })

      return { supported: true, audioStream: result.audioStream }
    } catch {
      isFlashlightSupported.value = false

      // Логируем финальную неудачную попытку
        trackFlashlightChange(false, 'unknown')
        logCameraAttempt({
          stage: 'support_check_complete',
          isSupported: false,
          reason: 'all_methods_failed'
        })

      return { supported: false, audioStream: cachedAudioStream.value }
    }
  }

  // Обновление списка устройств
  const refreshDevices = async () => {
    const availableDevices = await navigator.mediaDevices.enumerateDevices()
    devices.value = availableDevices
    return availableDevices
  }

  // Очистка кэша
  const clearCache = () => {
    if (cachedStream.value) {
      stopStream(cachedStream.value)
      cachedStream.value = null
    }
    if (cachedAudioStream.value) {
      stopStream(cachedAudioStream.value)
      cachedAudioStream.value = null
    }
    isFlashlightSupported.value = null
    cachedConstraints.value.on = null
    cachedConstraints.value.off = null
    cachedCapabilities.value = null
    isFlashlightOn.value = false
    track = null
  }

  return {
    cameraMethod,
    camera,
    devices,
    isFlashlightOn,
    isFlashlightSupported,
    cachedAudioStream, // Audio stream для передачи в useAudio
    turnOnFlashlight,
    turnOffFlashlight,
    checkFlashlightSupport,
    clearCache,
    refreshDevices,
  }
}
