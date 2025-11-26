import { computed, ref } from 'vue'

export const useCamera = () => {
  const cameraMethod = ref('environment')
  const camera = ref(null)
  const devices = ref([])
  const isFlashlightOn = ref(false)
  const isFlashlightSupported = ref(null)
  const cachedStream = ref(null)
  const cachedAudioStream = ref(null) // Кэш audio стрима для передачи в useAudio
  const cachedImageCapture = ref(null)
  const cachedTorchConstraints = ref({
    on: null,
    off: null
  })
  const lastUsedMethod = ref(null) // Сохраняем метод, который использовался для включения
  const preferredRearLabels = /(main|primary|rear|back|environment|wide|tele|задн|основн)/i
  const labelPriority = ['main', 'primary', 'rear', 'back', 'environment', 'wide', 'tele', 'camera 0', '0']

  // Определение платформы и устройства
  const userAgent = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /Android/i.test(userAgent)

  // Парсинг версии iOS для определения поддержки torch API (с iOS 15.4)
  const getIOSVersion = () => {
    if (!isIOS) return null
    const match = userAgent.match(/OS (\d+)[_.](\d+)/)
    if (match) {
      return { major: parseInt(match[1], 10), minor: parseInt(match[2], 10) }
    }
    return null
  }
  const iosVersion = getIOSVersion()
  // Если iOS, но версия неизвестна — пробуем включить torch (лучше попробовать, чем отказаться)
  const isIOSVersionUnknown = isIOS && !iosVersion
  // torch API поддерживается с iOS 15.4
  const isOldIOS = isIOS && iosVersion
    ? (iosVersion.major < 15 || (iosVersion.major === 15 && iosVersion.minor < 4))
    : false
  const isSamsung = /Samsung|SM-|Galaxy/i.test(userAgent)
  const isHuawei = /Huawei|Honor|HUAWEI/i.test(userAgent)
  const isXiaomi = /Xiaomi|Mi |Redmi|POCO/i.test(userAgent)
  const isOnePlus = /OnePlus/i.test(userAgent)
  const isOppo = /OPPO/i.test(userAgent)
  const isVivo = /vivo/i.test(userAgent)
  const isGoogle = /Pixel/i.test(userAgent)
  const isRealme = /Realme/i.test(userAgent)

  // Определение браузера
  const isChrome = /Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)
  const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)
  const isFirefox = /Firefox/i.test(userAgent)
  const isYandex = /YaBrowser/i.test(userAgent)

  // Получение информации о платформе
  const getPlatformInfo = () => {
    let deviceBrand = 'unknown'
    let deviceType = 'unknown'
    let osName = 'unknown'
    let osVersion = 'unknown'
    let browserName = 'unknown'

    // Определяем бренд устройства
    if (isIOS) {
      deviceBrand = 'Apple'
      deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile'
      osName = 'iOS'
      const match = userAgent.match(/OS (\d+[_.]\d+)/)
      osVersion = match ? match[1].replace('_', '.') : 'unknown'
    } else if (isAndroid) {
      deviceType = /Mobile/.test(userAgent) ? 'mobile' : 'tablet'
      osName = 'Android'
      const match = userAgent.match(/Android (\d+\.?\d*)/)
      osVersion = match ? match[1] : 'unknown'

      if (isSamsung) deviceBrand = 'Samsung'
      else if (isHuawei) deviceBrand = 'Huawei'
      else if (isXiaomi) deviceBrand = 'Xiaomi'
      else if (isOnePlus) deviceBrand = 'OnePlus'
      else if (isOppo) deviceBrand = 'OPPO'
      else if (isVivo) deviceBrand = 'Vivo'
      else if (isGoogle) deviceBrand = 'Google'
      else if (isRealme) deviceBrand = 'Realme'
      else deviceBrand = 'Android (other)'
    } else {
      deviceType = 'desktop'
      if (/Windows/i.test(userAgent)) osName = 'Windows'
      else if (/Mac/i.test(userAgent)) osName = 'macOS'
      else if (/Linux/i.test(userAgent)) osName = 'Linux'
    }

    // Определяем браузер
    if (isYandex) browserName = 'Yandex'
    else if (isChrome) browserName = 'Chrome'
    else if (isSafari) browserName = 'Safari'
    else if (isFirefox) browserName = 'Firefox'
    else if (/Edge|Edg/i.test(userAgent)) browserName = 'Edge'

    return {
      deviceBrand,
      deviceType,
      osName,
      osVersion,
      browserName,
      isIOS,
      isAndroid,
      isSamsung,
      isHuawei,
      isXiaomi,
      isOldIOS, // iOS < 15.4 (torch API не поддерживается)
      isIOSVersionUnknown, // iOS, но версия не определена
      iosVersionMajor: iosVersion?.major ?? null,
      iosVersionMinor: iosVersion?.minor ?? null,
      torchApiSupported: isIOS ? (!isOldIOS && !isIOSVersionUnknown ? true : 'unknown') : true,
      userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints || 0
    }
  }

  // Базовые constraints без torch (torch применяем отдельно для совместимости)
  const baseVideoConstraints = computed(() => ({
    width: { ideal: 640, max: 1280 },
    height: { ideal: 480, max: 720 },
    frameRate: { ideal: 15, max: 30 }
  }))

  // Audio constraints для объединённого запроса (камера + микрофон)
  const audioConstraints = {
    sampleRate: 44100,
    channelCount: 1,
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false
  }

  // Задержка для ожидания готовности torch (особенно на iOS)
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

  // Скрытое видео для «прогрева» трека
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

  const primeStream = async (stream) => {
    if (!stream) return
    const videoEl = getHiddenVideoEl()
    if (!videoEl) return
    try {
      if (videoEl.srcObject !== stream) {
        videoEl.srcObject = stream
      }
      const playPromise = videoEl.play()
      if (playPromise && typeof playPromise.then === 'function') {
        await playPromise.catch(() => {})
      }
    } catch {
      // Игнорируем ошибки автоплея
    }
    await delay(150)
  }

  const waitForTorchSupport = async (track, attempts = 8, delayMs = 120) => {
    if (!track?.getCapabilities) {
      return null
    }
    let capabilities = null
    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        capabilities = track.getCapabilities()
      } catch {
        capabilities = null
      }
      if (
        capabilities &&
        (
          capabilities.torch === true ||
          (Array.isArray(capabilities.fillLightMode) &&
            (capabilities.fillLightMode.includes('flash') || capabilities.fillLightMode.includes('torch')))
        )
      ) {
        return capabilities
      }
      await delay(delayMs)
    }
    return capabilities
  }

  const createImageCapture = (videoTrack) => {
    if (typeof window === 'undefined') return null
    if (!videoTrack || typeof window.ImageCapture !== 'function') return null
    try {
      return new window.ImageCapture(videoTrack)
    } catch {
      return null
    }
  }

  const getTorchConstraintVariants = (turnOn, isLegacyIOS = false) => {
    const variants = []
    const targetMode = turnOn ? 'torch' : 'off'
    const flashMode = turnOn ? 'flash' : 'off'

    variants.push(
      { advanced: [{ torch: turnOn }] },
      { torch: turnOn }
    )

    variants.push(
      { advanced: [{ fillLightMode: targetMode }] },
      { fillLightMode: targetMode }
    )

    variants.push(
      { advanced: [{ fillLightMode: flashMode }] },
      { fillLightMode: flashMode }
    )

    if (turnOn) {
      variants.push(
        { advanced: [{ flash: true }] },
        { flash: true }
      )
    } else {
      variants.push(
        { advanced: [{ flash: false }] },
        { flash: false }
      )
    }

    if (isLegacyIOS) {
      variants.push(
        { advanced: [{ fillLightMode: 'on' }] },
        { fillLightMode: 'on' }
      )
    }

    return variants
  }

  const setTorchState = async (track, turnOn, imageCapture = null, options = {}) => {
    if (!track) return false
    const { cacheResult = true, useCache = true } = options
    const cacheKey = turnOn ? 'on' : 'off'

    if (useCache) {
      const cachedEntry = cachedTorchConstraints.value[cacheKey]
      if (cachedEntry) {
        if (cachedEntry.type === 'constraint') {
          try {
            await track.applyConstraints(cachedEntry.value)
            return true
          } catch {
            cachedTorchConstraints.value[cacheKey] = null
          }
        } else if (cachedEntry.type === 'imageCapture' && imageCapture) {
          try {
            if (cachedEntry.value.mode === 'torch') {
              await imageCapture.setOptions({ torch: turnOn })
            } else if (cachedEntry.value.mode === 'fillLightMode') {
              await imageCapture.setOptions({ fillLightMode: turnOn ? 'torch' : 'off' })
            }
            return true
          } catch {
            cachedTorchConstraints.value[cacheKey] = null
          }
        }
      }
    }

    const variants = getTorchConstraintVariants(turnOn, isOldIOS)
    for (const constraint of variants) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await track.applyConstraints(constraint)
          if (cacheResult) {
            cachedTorchConstraints.value[cacheKey] = {
              type: 'constraint',
              value: constraint
            }
          }
          return true
        } catch {
          if (attempt < 2) {
            await delay(80 * (attempt + 1))
          }
        }
      }
    }

    if (imageCapture) {
      try {
        await imageCapture.setOptions({ torch: turnOn })
        if (cacheResult) {
          cachedTorchConstraints.value[cacheKey] = {
            type: 'imageCapture',
            value: { mode: 'torch' }
          }
        }
        return true
      } catch { /* noop */ }

      try {
        await imageCapture.setOptions({ fillLightMode: turnOn ? 'torch' : 'off' })
        if (cacheResult) {
          cachedTorchConstraints.value[cacheKey] = {
            type: 'imageCapture',
            value: { mode: 'fillLightMode' }
          }
        }
        return true
      } catch { /* noop */ }
    }

    return false
  }

  const tryForceTorchToggle = async (track, turnOn, imageCapture = null) => {
    const success = await setTorchState(track, turnOn, imageCapture, { cacheResult: false, useCache: false })
    if (success && turnOn) {
      await setTorchState(track, false, imageCapture, { cacheResult: false, useCache: false })
    }
    return success
  }

  const refreshDevices = async () => {
    const availableDevices = await navigator.mediaDevices.enumerateDevices()
    devices.value = availableDevices
    return availableDevices
  }

  const labelScore = (label = '') => {
    const normalized = label.toLowerCase()
    const index = labelPriority.findIndex(priority => normalized.includes(priority))
    return index === -1 ? labelPriority.length : index
  }

  // Метод 1: facingMode ideal (работает на большинстве устройств)
  const requestStreamWithFacingModeIdeal = (includeAudio = false) => {
    return navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        ...baseVideoConstraints.value
      },
      audio: includeAudio ? audioConstraints : false
    })
  }

  // Метод 2: facingMode exact (лучше работает на iOS)
  const requestStreamWithFacingModeExact = (includeAudio = false) => {
    return navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { exact: 'environment' },
        ...baseVideoConstraints.value
      },
      audio: includeAudio ? audioConstraints : false
    })
  }

  // Метод 3: facingMode simple (для старых браузеров)
  const requestStreamWithFacingModeSimple = (includeAudio = false) => {
    return navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        ...baseVideoConstraints.value
      },
      audio: includeAudio ? audioConstraints : false
    })
  }

  // Метод 4: по deviceId конкретной камеры
  const requestStreamByDeviceId = (deviceId, includeAudio = false) => {
    return navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        ...baseVideoConstraints.value
      },
      audio: includeAudio ? audioConstraints : false
    })
  }

  // Метод 5: простой запрос видео без ограничений (fallback)
  const requestStreamSimple = (includeAudio = false) => {
    return navigator.mediaDevices.getUserMedia({
      video: true,
      audio: includeAudio ? audioConstraints : false
    })
  }

  // Получение всех задних камер, отсортированных по приоритету
  const getRearCameras = async () => {
    const availableDevices = devices.value.length ? devices.value : await refreshDevices()
    const videoCameras = availableDevices.filter(d => d.kind === 'videoinput')

    // Сортируем камеры: сначала с labels, потом по приоритету
    const rearCameras = videoCameras
      .filter(d => {
        const label = (d.label || '').toLowerCase()
        // Исключаем фронтальные камеры
        if (/front|передн|selfie|face/i.test(label)) return false
        // Включаем камеры с метками задней камеры или без метки (попробуем)
        return preferredRearLabels.test(label) || !label
      })
      .sort((a, b) => labelScore(a.label) - labelScore(b.label))

    return rearCameras
  }

  // Проверка наличия torch в стриме
  // На старых iOS (< 15.4) torch API не поддерживается
  const checkTorchSupport = async (stream, tryForce = false) => {
    const track = stream.getVideoTracks()[0]
    if (!track) return false

    if (isOldIOS) {
      return false
    }

    await waitForTorchSupport(track)

    let capabilities = null
    try {
      capabilities = track.getCapabilities?.()
    } catch {
      capabilities = null
    }

    if (
      capabilities &&
      (
        capabilities.torch === true ||
        (Array.isArray(capabilities.fillLightMode) &&
          (capabilities.fillLightMode.includes('flash') || capabilities.fillLightMode.includes('torch')))
      )
    ) {
      return true
    }

    const imageCapture = createImageCapture(track)
    if (imageCapture) {
      try {
        const photoCaps = await imageCapture.getPhotoCapabilities()
        if (
          photoCaps?.torch === true ||
          (Array.isArray(photoCaps?.fillLightMode) &&
            (photoCaps.fillLightMode.includes('flash') || photoCaps.fillLightMode.includes('torch')))
        ) {
          return true
        }
      } catch { /* ignore */ }
    }

    if (tryForce) {
      const forced = await tryForceTorchToggle(track, true, imageCapture)
      if (forced) {
        return true
      }
    }

    return false
  }

  // Универсальный метод получения стрима с torch
  // Пробует несколько методов в порядке приоритета для максимальной совместимости
  // logCallbacks: { trackFlashlightChange, logCameraAttempt, logPlatformInfo }
  // options: { includeAudio: boolean } — запросить камеру и микрофон одним запросом
  const ensureRearCameraStream = async (logCallbacks = null, options = {}) => {
    const { trackFlashlightChange, logCameraAttempt, logPlatformInfo } = logCallbacks || {}
    const { includeAudio = false } = options

    // Логируем детальную информацию о платформе и устройстве
    if (logPlatformInfo) {
      logPlatformInfo(getPlatformInfo())
    }

    const methods = []

    // Определяем порядок методов в зависимости от платформы
    // Каждый метод теперь принимает includeAudio
    if (isIOS) {
      // Для iOS: exact лучше работает
      methods.push(
        { name: 'facingMode-exact', fn: () => requestStreamWithFacingModeExact(includeAudio) },
        { name: 'facingMode-ideal', fn: () => requestStreamWithFacingModeIdeal(includeAudio) },
        { name: 'facingMode-simple', fn: () => requestStreamWithFacingModeSimple(includeAudio) }
      )
    } else if (isSamsung) {
      // Для Samsung: сначала пробуем facingMode, потом deviceId
      methods.push(
        { name: 'facingMode-ideal', fn: () => requestStreamWithFacingModeIdeal(includeAudio) },
        { name: 'facingMode-exact', fn: () => requestStreamWithFacingModeExact(includeAudio) }
      )
    } else {
      // Для остальных Android и других платформ
      methods.push(
        { name: 'facingMode-ideal', fn: () => requestStreamWithFacingModeIdeal(includeAudio) },
        { name: 'facingMode-exact', fn: () => requestStreamWithFacingModeExact(includeAudio) },
        { name: 'facingMode-simple', fn: () => requestStreamWithFacingModeSimple(includeAudio) }
      )
    }

    // Логируем начало поиска камеры
    if (logCameraAttempt) {
      logCameraAttempt({
        stage: 'start',
        methodsToTry: methods.map(m => m.name),
        platform: isIOS ? 'iOS' : isSamsung ? 'Samsung' : 'other',
        iosVersion: iosVersion ? `${iosVersion.major}.${iosVersion.minor}` : null,
        isOldIOS,
        isIOSVersionUnknown,
        torchApiSupported: !isOldIOS,
        includeAudio
      })
    }

    let lastError = null
    let bestStream = null
    let bestMethod = null
    let attemptNumber = 0

    // Пробуем каждый метод facingMode
    for (const method of methods) {
      attemptNumber++
      try {
        // Логируем попытку
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'trying',
            attempt: attemptNumber,
            method: method.name,
            type: 'facingMode'
          })
        }

        const stream = await method.fn()
        await primeStream(stream)

        // Логируем успешное получение стрима
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'stream_obtained',
            attempt: attemptNumber,
            method: method.name,
            success: true
          })
        }

        // Логируем попытку включения (для trackFlashlightChange)
        if (trackFlashlightChange) {
          trackFlashlightChange(false, method.name)
        }

        // Проверяем поддержку torch (с tryForce для iOS, где capabilities может врать)
        const track = stream.getVideoTracks()[0]
        await waitForTorchSupport(track)
        const hasTorch = await checkTorchSupport(stream, true)

        // Логируем результат проверки torch
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'torch_check',
            attempt: attemptNumber,
            method: method.name,
            hasTorch,
            isOldIOS
          })
        }

        if (hasTorch) {
          // Нашли камеру с torch
          // Кэшируем audio stream если был запрошен
          const audioStream = includeAudio ? cacheAudioFromStream(stream) : null
          if (logCameraAttempt) {
            logCameraAttempt({
              stage: 'success',
              attempt: attemptNumber,
              method: method.name,
              hasTorch: true,
              hasAudio: !!audioStream
            })
          }
          await refreshDevices()
          return { stream, method: method.name, audioStream }
        }

        // Камера без torch - сохраняем как запасной вариант
        if (!bestStream) {
          bestStream = stream
          bestMethod = method.name
        } else {
          stopStream(stream)
        }
      } catch (error) {
        // Логируем неудачную попытку
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'error',
            attempt: attemptNumber,
            method: method.name,
            error: error.message
          })
        }
        if (trackFlashlightChange) {
          trackFlashlightChange(false, method.name)
        }
        lastError = error
      }
    }

    // Пробуем получить камеры по deviceId
    try {
      const rearCameras = await getRearCameras()

      // Логируем найденные камеры
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'deviceId_cameras_found',
          cameras: rearCameras.map(c => ({
            deviceId: c.deviceId?.slice(0, 8),
            label: c.label
          }))
        })
      }

      for (const camera of rearCameras) {
        if (!camera.deviceId) continue
        attemptNumber++

        try {
          const cameraLabel = camera.label || 'unknown'

          // Логируем попытку
          if (logCameraAttempt) {
            logCameraAttempt({
              stage: 'trying',
              attempt: attemptNumber,
              method: `deviceId:${cameraLabel}`,
              type: 'deviceId',
              deviceId: camera.deviceId.slice(0, 8)
            })
          }

          const stream = await requestStreamByDeviceId(camera.deviceId, includeAudio)
          await primeStream(stream)

          // Логируем успешное получение стрима
          if (logCameraAttempt) {
            logCameraAttempt({
              stage: 'stream_obtained',
              attempt: attemptNumber,
              method: `deviceId:${cameraLabel}`,
              success: true
            })
          }

          if (trackFlashlightChange) {
            trackFlashlightChange(false, `deviceId:${cameraLabel}`)
          }

          const track = stream.getVideoTracks()[0]
          await waitForTorchSupport(track)
          const hasTorch = await checkTorchSupport(stream, true)

          // Логируем результат проверки torch
          if (logCameraAttempt) {
            logCameraAttempt({
              stage: 'torch_check',
              attempt: attemptNumber,
              method: `deviceId:${cameraLabel}`,
              hasTorch,
              isOldIOS
            })
          }

          if (hasTorch) {
            // Нашли камеру с torch
            // Кэшируем audio stream если был запрошен
            const audioStream = includeAudio ? cacheAudioFromStream(stream) : null
            if (logCameraAttempt) {
              logCameraAttempt({
                stage: 'success',
                attempt: attemptNumber,
                method: `deviceId:${cameraLabel}`,
                hasTorch: true,
                hasAudio: !!audioStream
              })
            }
            if (bestStream) stopStream(bestStream)
            await refreshDevices()
            return { stream, method: `deviceId:${cameraLabel}`, audioStream }
          }

          // Камера без torch - сохраняем как запасной вариант
          if (!bestStream) {
            bestStream = stream
            bestMethod = `deviceId:${cameraLabel}`
          } else {
            stopStream(stream)
          }
        } catch (error) {
          // Логируем неудачную попытку
          if (logCameraAttempt) {
            logCameraAttempt({
              stage: 'error',
              attempt: attemptNumber,
              method: `deviceId:${camera.label || 'unknown'}`,
              error: error.message
            })
          }
          if (trackFlashlightChange) {
            trackFlashlightChange(false, `deviceId:${camera.label || 'unknown'}`)
          }
          lastError = error
        }
      }
    } catch (error) {
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'error',
          method: 'getRearCameras',
          error: error.message
        })
      }
      lastError = error
    }

    // Последняя попытка: простой запрос без ограничений
    if (!bestStream) {
      attemptNumber++
      try {
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'trying',
            attempt: attemptNumber,
            method: 'simple',
            type: 'fallback'
          })
        }

        bestStream = await requestStreamSimple(includeAudio)
        bestMethod = 'simple'

        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'stream_obtained',
            attempt: attemptNumber,
            method: 'simple',
            success: true
          })
        }
        if (trackFlashlightChange) {
          trackFlashlightChange(false, 'simple')
        }
      } catch (error) {
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'error',
            attempt: attemptNumber,
            method: 'simple',
            error: error.message
          })
        }
        if (trackFlashlightChange) {
          trackFlashlightChange(false, 'simple')
        }
        throw lastError || error
      }
    }

    // Логируем финальный результат (нет torch, но есть стрим)
    // Кэшируем audio stream если был запрошен
    const audioStream = includeAudio ? cacheAudioFromStream(bestStream) : null
    if (logCameraAttempt) {
      logCameraAttempt({
        stage: 'finish',
        method: bestMethod,
        hasTorch: false,
        totalAttempts: attemptNumber,
        hasAudio: !!audioStream
      })
    }

    await refreshDevices()
    return { stream: bestStream, method: bestMethod, audioStream }
  }

  // Включение фонарика - универсальный метод с поддержкой разных устройств
  // logCallbacks: { trackFlashlightChange, logCameraAttempt, logPlatformInfo } или function (для обратной совместимости)
  // options: { includeAudio: boolean } — запросить камеру и микрофон одним запросом
  const turnOnFlashlight = async (logCallbacks = null, options = {}) => {
    // Обратная совместимость: если передана функция, оборачиваем её
    const callbacks = typeof logCallbacks === 'function'
      ? { trackFlashlightChange: logCallbacks }
      : logCallbacks

    const { trackFlashlightChange, logCameraAttempt } = callbacks || {}
    const { includeAudio = false } = options

    if (isFlashlightOn.value) {
      // Если фонарик уже включен, но передан callback, логируем это
      const method = lastUsedMethod.value || 'cached'
      if (trackFlashlightChange) {
        trackFlashlightChange(true, method)
      }
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'already_on',
          method
        })
      }
      // Возвращаем кэшированный audio stream если есть
      return { success: true, method, audioStream: cachedAudioStream.value }
    }

    let stream = cachedStream.value
    let usedMethod = 'cached'
    const isCached = !!stream

    try {
      // Если нет кэшированного стрима, создаем новый
      if (!stream) {
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'no_cached_stream',
            action: 'creating_new'
          })
        }
        const result = await ensureRearCameraStream(callbacks, { includeAudio })
        stream = result.stream
        usedMethod = result.method
        if (includeAudio && result.audioStream) {
          cachedAudioStream.value = result.audioStream
        }
      } else {
        usedMethod = lastUsedMethod.value || 'cached'
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'using_cached_stream',
            method: usedMethod
          })
        }
      }

      const videoTrack = stream.getVideoTracks()[0]
      const imageCapture = cachedImageCapture.value || createImageCapture(videoTrack)
      if (!isCached) {
        cachedImageCapture.value = imageCapture
        cachedTorchConstraints.value.on = null
        cachedTorchConstraints.value.off = null
      }

      let hasTorch = isCached
      if (!isCached) {
        hasTorch = await checkTorchSupport(stream, true)
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'torch_check_before_enable',
            hasTorch,
            method: usedMethod,
            isOldIOS
          })
        }
      }

      if (!hasTorch) {
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'torch_enable_failed',
            method: usedMethod,
            reason: 'torch_not_supported'
          })
        }
        throw new Error('Torch не поддерживается на этом устройстве')
      }

      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'enabling_torch',
          method: usedMethod,
          fastPath: isCached
        })
      }

      const success = await setTorchState(videoTrack, true, imageCapture)
      if (!success) {
        if (logCameraAttempt) {
          logCameraAttempt({
            stage: 'torch_enable_failed',
            method: usedMethod,
            reason: 'apply_constraints_failed'
          })
        }
        throw new Error('Torch не поддерживается на этом устройстве')
      }

      cachedStream.value = stream
        camera.value = stream
        isFlashlightOn.value = true
        lastUsedMethod.value = usedMethod

      if (trackFlashlightChange) {
        trackFlashlightChange(true, usedMethod)
      }
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'torch_enabled',
          success: true,
          method: usedMethod,
          cached: isCached,
          hasAudio: !!cachedAudioStream.value
        })
      }

      return { success: true, method: usedMethod, audioStream: cachedAudioStream.value }
    } catch (error) {
      // Останавливаем только video стрим при ошибке, сохраняем audio
      if (stream && !cachedStream.value) {
        stopStream(stream, includeAudio) // keepAudio = true если был запрошен audio
      }

      // Логируем ошибку включения
      if (trackFlashlightChange) {
        trackFlashlightChange(false, usedMethod || 'unknown')
      }
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'error',
          method: usedMethod || 'unknown',
          error: error.message,
          streamStopped: true,
          audioPreserved: includeAudio
        })
      }
      throw error
    }
  }

  // Выключение фонарика с retry для надежности
  // logCallbacks: { trackFlashlightChange, logCameraAttempt } или function (для обратной совместимости)
  const turnOffFlashlight = async (logCallbacks = null) => {
    // Обратная совместимость: если передана функция, оборачиваем её
    const callbacks = typeof logCallbacks === 'function'
      ? { trackFlashlightChange: logCallbacks }
      : logCallbacks

    const { trackFlashlightChange, logCameraAttempt } = callbacks || {}

    if (!isFlashlightOn.value) {
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'already_off'
        })
      }
      return
    }

    // Получаем метод, который использовался для включения
    const method = lastUsedMethod.value || 'unknown'

    if (cachedStream.value) {
      const videoTrack = cachedStream.value.getVideoTracks()[0]
      const imageCapture = cachedImageCapture.value || createImageCapture(videoTrack)
      const success = await setTorchState(videoTrack, false, imageCapture)

      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'torch_disabled',
          success,
          method
        })
      }
    }
    isFlashlightOn.value = false

    // Логируем выключение с правильным методом
    if (trackFlashlightChange) {
      trackFlashlightChange(false, method)
    }
  }

  // Проверка поддержки фонарика - просто пытается включить и возвращает true/false
  // logCallbacks: { trackFlashlightChange, logCameraAttempt, logPlatformInfo } или function (для обратной совместимости)
  // options: { includeAudio: boolean } — запросить камеру и микрофон одним запросом
  const checkFlashlightSupport = async (logCallbacks = null, options = {}) => {
    // Обратная совместимость: если передана функция, оборачиваем её
    const callbacks = typeof logCallbacks === 'function'
      ? { trackFlashlightChange: logCallbacks }
      : logCallbacks

    const { trackFlashlightChange, logCameraAttempt } = callbacks || {}
    const { includeAudio = false } = options

    // Если поддержка уже проверена, но передан callback, логируем текущее состояние
    if (isFlashlightSupported.value !== null) {
      if (trackFlashlightChange) {
        const method = lastUsedMethod.value || 'cached'
        trackFlashlightChange(isFlashlightOn.value, method)
      }
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'already_checked',
          isSupported: isFlashlightSupported.value,
          isOn: isFlashlightOn.value,
          method: lastUsedMethod.value || 'cached'
        })
      }
      // Возвращаем объект с audioStream для согласованности
      return { supported: isFlashlightSupported.value, audioStream: cachedAudioStream.value }
    }

    if (logCameraAttempt) {
      logCameraAttempt({
        stage: 'checking_support',
        action: 'starting',
        includeAudio
      })
    }

    try {
      const result = await turnOnFlashlight(callbacks, { includeAudio })
      isFlashlightSupported.value = true

      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'support_check_complete',
          isSupported: true,
          method: lastUsedMethod.value,
          hasAudio: !!result.audioStream
        })
      }

      return { supported: true, audioStream: result.audioStream }
    } catch {
      isFlashlightSupported.value = false

      // Логируем финальную неудачную попытку
      if (trackFlashlightChange) {
        trackFlashlightChange(false, 'unknown')
      }
      if (logCameraAttempt) {
        logCameraAttempt({
          stage: 'support_check_complete',
          isSupported: false,
          reason: 'all_methods_failed'
        })
      }

      return { supported: false, audioStream: cachedAudioStream.value }
    }
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
    lastUsedMethod.value = null
    cachedImageCapture.value = null
    cachedTorchConstraints.value.on = null
    cachedTorchConstraints.value.off = null
    isFlashlightOn.value = false
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
