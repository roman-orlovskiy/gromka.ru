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
          mod="gradient-4"
          @click="exportLogs"
        >
          Экспорт логов
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
const logs = ref([])

const addLog = (event, payload = null) => {
  const time = new Date().toLocaleTimeString()
  const entry = { time, event, payload }
  logs.value.push(entry)
  if (logs.value.length > 500) logs.value.shift()
  // Убираем console.log для компактности
}

const exportLogs = async () => {
  try {
    const text = logs.value.map(l => `${l.time} ${l.event}${l.payload ? ` ${JSON.stringify(l.payload)}` : ''}`).join('\n')
    const ok = await copyToClipboard(text || 'Логи пусты')
    alert(ok ? 'Логи скопированы' : 'Ошибка копирования')
  } catch (e) {
    alert(`Ошибка: ${e?.message || e}`)
  }
}
// Флаг, предотвращающий параллельные/зацикленные старты камеры
const isStartingCamera = ref(false)
// Анти-зацикливание: кулдаун и лимиты для Telegram WebView
const tgStartAttempts = ref(0)
const lastStartAt = ref(0)
const START_COOLDOWN_MS = 1500
const MAX_TG_ATTEMPTS = 2

// Эвристика для определения задней камеры по лейблу
const isBackCameraDevice = (device) => {
  const label = (device?.label || '').toLowerCase()
  return (
    label.includes('back') ||
    label.includes('rear') ||
    label.includes('environment') ||
    label.includes('зад') ||
    label.includes('тыл')
  )
}

// Приоритизация задних камер: чаще всего основная задняя камера имеет deviceId, оканчивающийся на '0'
const sortBackCameras = (list) => {
  return [...list].sort((a, b) => {
    const aId = a.deviceId || ''
    const bId = b.deviceId || ''
    const aIsZero = aId.endsWith('0') ? 1 : 0
    const bIsZero = bId.endsWith('0') ? 1 : 0
    if (aIsZero !== bIsZero) return bIsZero - aIsZero
    const score = (d) => {
      const l = (d.label || '').toLowerCase()
      return (
        (l.includes('back') ? 2 : 0) +
        (l.includes('rear') ? 2 : 0) +
        (l.includes('environment') ? 2 : 0)
      )
    }
    return score(b) - score(a)
  })
}

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

  // Защита от зацикливания
  if (isStartingCamera.value) {
    addLog('playMusic: пропуск (камера запускается)')
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
      } catch {
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

    // 3) Fallback через ImageCapture.setOptions — на части Samsung показывает фонарик
    if ('ImageCapture' in window) {
      try {
        const ic = new window.ImageCapture(track)
        try {
          const pc = await ic.getPhotoCapabilities()
          console.log('📷 (fallback) PhotoCapabilities:', pc)
        } catch { /* игнорируем ошибку получения PhotoCapabilities в fallback */ }
        await ic.setOptions({ torch: !!turnOn })
        isFlashlightOn.value = !!turnOn
        if (turnOn) cachedConstraints.value.on = { advanced: [{ torch: true }] }
        else cachedConstraints.value.off = { advanced: [{ torch: false }] }
        return
      } catch (e) {
        console.warn('⚠️ Fallback через ImageCapture.setOptions не сработал:', e?.message)
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
    if (isStartingCamera.value) {
      addLog('startCamera: skip (already starting)');
      return
    }

    // КРИТИЧНО: глобальная защита от зацикливания
    const startTime = Date.now()
    const MAX_START_TIME = 30000 // 30 секунд максимум
    const startKey = `camera_start_${startTime}`

    // Проверяем, не было ли недавних попыток запуска
    const lastStart = localStorage.getItem('last_camera_start')
    if (lastStart && (startTime - parseInt(lastStart)) < 5000) {
      addLog('startCamera: блокировка (слишком частые попытки)')
      throw new Error('Слишком частые попытки запуска камеры. Подождите 5 секунд.')
    }

    localStorage.setItem('last_camera_start', startTime.toString())

    // В Telegram WebView: ограничиваем частоту и количество стартов
    if (deviceInfo.value.isTelegramWebView) {
      const now = Date.now()
      const since = now - lastStartAt.value
      if (since < START_COOLDOWN_MS) {
        addLog('startCamera: cooldown (webview)', { msLeft: START_COOLDOWN_MS - since })
        return
      }
      if (tgStartAttempts.value >= MAX_TG_ATTEMPTS) {
        addLog('startCamera: attempts limit reached (webview)', { attempts: tgStartAttempts.value })
        errorMessage.value = 'Слишком много попыток запуска камеры в приложении. Попробуйте ещё раз через несколько секунд.'
        return
      }
      tgStartAttempts.value += 1
      lastStartAt.value = now
    }

    isStartingCamera.value = true
    errorMessage.value = ''
    console.log('🎥 Запуск камеры...')
    addLog('startCamera: начало')

    // Preflight для прогрева разрешений
    try {
      if (navigator.permissions) {
        const st = await navigator.permissions.query({ name: 'camera' })
        if (st.state !== 'granted') {
          // КРИТИЧНО: проверяем флаг перед preflight getUserMedia
          if (isStartingCamera.value === false) {
            addLog('preflight: прервано (флаг сброшен)')
            return
          }

          try {
            addLog('preflight: попытка getUserMedia')
            const s = await navigator.mediaDevices.getUserMedia({ video: true })
            s.getTracks().forEach(t => t.stop())
            await new Promise(r => setTimeout(r, 120))
            addLog('preflight: успех')
          } catch (e) {
            addLog('preflight: ошибка', e?.message)
          }
        }
      }
    } catch { /* игнорируем сбои preflight */ }

    // Получаем список всех камер
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device => device.kind === 'videoinput')

    addLog('enumerateDevices', { count: cameras.length })

    if (cameras.length === 0) {
      throw new Error('Камеры не найдены на устройстве')
    }

    // Ищем задние камеры
    const backCameras = sortBackCameras(cameras.filter(d => isBackCameraDevice(d)))
    // Если определить по лейблу не удалось, сохраняем прежнюю эвристику (последняя камера)
    let selectedCamera = backCameras[0] || cameras[cameras.length - 1]
    console.log('📱 Начальный выбор камеры:', selectedCamera)

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
      // Android — сначала активно перебираем задние камеры и проверяем поддержку фонарика
      const tryAndroidBackCamerasForTorch = async () => {
        const candidates = backCameras.length ? backCameras : cameras
        let lastErr = null
        let attemptsCount = 0
        const MAX_ATTEMPTS = 3 // КРИТИЧНО: ограничиваем попытки

        for (const cam of candidates) {
          // КРИТИЧНО: проверяем, не превышено ли количество попыток
          if (attemptsCount >= MAX_ATTEMPTS) {
            addLog('tryAndroidBackCamerasForTorch: превышен лимит попыток', { attempts: attemptsCount })
            break
          }

          try {
            console.log('🔍 Пробуем заднюю камеру для torch:', cam)
            const variants = [
              { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
              { width: { ideal: 1920 }, height: { ideal: 1080 } },
              { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
              { width: { ideal: 1280 }, height: { ideal: 720 } },
              { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
              { width: { ideal: 640 }, height: { ideal: 480 } }
            ]

            for (const v of variants) {
              // КРИТИЧНО: проверяем флаг запуска перед каждым getUserMedia
              if (isStartingCamera.value === false) {
                addLog('tryAndroidBackCamerasForTorch: прервано (флаг сброшен)')
                return false
              }

              let localStream = null
              try {
                attemptsCount++
                addLog('tryAndroidBackCamerasForTorch: попытка getUserMedia', { attempt: attemptsCount, camera: cam.deviceId })

                localStream = await navigator.mediaDevices.getUserMedia({
                  video: {
                    deviceId: { exact: cam.deviceId },
                    facingMode: 'environment',
                    ...v
                  }
                })
              } catch (e) {
                lastErr = e
                addLog('tryAndroidBackCamerasForTorch: ошибка getUserMedia', { error: e?.message, attempt: attemptsCount })
                continue
              }

              const localTrack = localStream.getVideoTracks()[0]
              // Небольшой «прайминг» трека, чтобы capabilities стабилизировались
              try {
                if (videoEl.value) {
                  if (videoEl.value.srcObject !== localStream) videoEl.value.srcObject = localStream
                  const p = videoEl.value.play()
                  if (p && typeof p.then === 'function') await p.catch(() => {})
                }
              } catch { /* игнорируем ошибки автозапуска видео на некоторых вебвью */ }
              await new Promise(r => setTimeout(r, 180))

              // Снимаем capabilities через track и через ImageCapture (если доступен)
              let caps = null
              try {
                caps = localTrack.getCapabilities?.()
              } catch { caps = null }

              let photoCaps = null
              if ('ImageCapture' in window) {
                try {
                  const ic = new window.ImageCapture(localTrack)
                  photoCaps = await ic.getPhotoCapabilities()
                } catch (e) {
                  console.warn('⚠️ ImageCapture недоступен или вернул ошибку:', e?.message)
                }
              }

              const hasTorchSupport = (
                (caps && (caps.torch === true || (Array.isArray(caps.fillLightMode) && (caps.fillLightMode.includes('flash') || caps.fillLightMode.includes('torch'))))) ||
                (photoCaps && (
                  photoCaps.torch === true ||
                  (Array.isArray(photoCaps.fillLightMode) && (photoCaps.fillLightMode.includes('flash') || photoCaps.fillLightMode.includes('torch')))
                ))
              )

              if (hasTorchSupport) {
                // Назначаем основной поток и трек
                stream = localStream
                track = localTrack
                isStreamActive.value = true
                cachedCapabilities.value = caps || photoCaps || null
                deviceInfo.value.supportsTorch = !!(caps?.torch === true || photoCaps?.torch === true)
                deviceInfo.value.supportsFillLightMode = !!(
                  (caps?.fillLightMode && (caps.fillLightMode.includes('flash') || caps.fillLightMode.includes('torch'))) ||
                  (photoCaps?.fillLightMode && (photoCaps.fillLightMode.includes('flash') || photoCaps.fillLightMode.includes('torch')))
                )
                deviceInfo.value.torchCapability = caps?.torch ?? photoCaps?.torch ?? null
                console.log('✅ Найдена камера/профиль с поддержкой фонарика:', cam, v)
                return true
              }

              // Камера/профиль не поддерживает фонарик — останавливаем локальный поток и пробуем следующий профиль
              localStream.getTracks().forEach(t => t.stop())
            }
          } catch (e) {
            console.warn('❌ Не удалось запустить кандидата камеры:', e?.message)
            lastErr = e
          }
        }
        if (lastErr) console.warn('ℹ️ Не найдено камер с torch, последняя ошибка:', lastErr?.message)
        return false
      }

      const picked = await tryAndroidBackCamerasForTorch()

      if (!picked) {
        console.log('↩️ Переходим к стандартным вариантам ограничений для Android')
        // Стандартные варианты для случаев без torch
        constraintsOptions = [
          {
            video: {
              deviceId: { exact: selectedCamera.deviceId },
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          },
          {
            video: {
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          },
          {
            video: {
              deviceId: { exact: selectedCamera.deviceId },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          },
          {
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          },
          { video: true }
        ]
      } else {
        // Мы уже всё настроили и определили возможности — завершаем ранний выход
        console.log('🎬 Камера готова к работе с фонариком (Android)')
        console.log('✅ Камера успешно запущена')
        return
      }
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
      // КРИТИЧНО: проверяем флаг запуска перед каждым getUserMedia
      if (isStartingCamera.value === false) {
        addLog('constraintsOptions: прервано (флаг сброшен)')
        break
      }

      try {
        console.log(`🔄 Попытка ${i + 1}/${constraintsOptions.length}:`, constraintsOptions[i])
        addLog('constraintsOptions: попытка getUserMedia', { attempt: i + 1, constraints: constraintsOptions[i] })

        stream = await navigator.mediaDevices.getUserMedia(constraintsOptions[i])
        console.log(`✅ Успешно запущена камера с ограничениями ${i + 1}`)
        addLog('constraintsOptions: успех', { attempt: i + 1 })
        break
      } catch (error) {
        console.warn(`❌ Попытка ${i + 1} неудачна:`, error.message)
        addLog('constraintsOptions: ошибка', { attempt: i + 1, error: error.message })
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

    // Проверяем поддержку фонарика
    const waitForTorchSupport = async (mediaTrack, attempts = 12, delayMs = 150) => {
      let caps = null
      let lastCaps = null

      for (let attempt = 0; attempt < attempts; attempt++) {
        try {
          caps = mediaTrack.getCapabilities()
          lastCaps = caps
        } catch {
          caps = null
        }

        if (
          caps && (
            caps.torch === true ||
            (Array.isArray(caps.fillLightMode) && (caps.fillLightMode.includes('flash') || caps.fillLightMode.includes('torch')))
          )
        ) {
          addLog('torch: найдена поддержка', { torch: caps.torch, fillLightMode: caps.fillLightMode })
          return caps
        }

        const currentDelay = deviceInfo.value.isAndroid ? delayMs * 1.5 : delayMs
        await new Promise(r => setTimeout(r, currentDelay))
      }

      addLog('torch: поддержка не найдена')
      return lastCaps || mediaTrack.getCapabilities()
    }

    const capabilities = await waitForTorchSupport(track)
    cachedCapabilities.value = capabilities
    console.log('🔦 Проверка поддержки фонарика...')
    console.log('🔦 fillLightMode:', capabilities.fillLightMode)
    console.log('🔦 torch:', capabilities.torch)

    // Дополнительно пробуем получить возможности через ImageCapture — на части Android это надёжнее
    if (!deviceInfo.value.isIOS && 'ImageCapture' in window) {
      try {
        const ic = new window.ImageCapture(track)
        const photoCaps = await ic.getPhotoCapabilities()
        console.log('📷 PhotoCapabilities:', photoCaps)
        if (photoCaps) {
          // Объединяем сведения
          deviceInfo.value.supportsTorch = deviceInfo.value.supportsTorch || photoCaps.torch === true
          deviceInfo.value.supportsFillLightMode = deviceInfo.value.supportsFillLightMode || (
            Array.isArray(photoCaps.fillLightMode) && (photoCaps.fillLightMode.includes('flash') || photoCaps.fillLightMode.includes('torch'))
          )
          if (!cachedCapabilities.value) cachedCapabilities.value = capabilities || photoCaps
        }
      } catch (e) {
        console.warn('⚠️ Не удалось получить PhotoCapabilities:', e?.message)
      }
    }

    // Обновляем информацию об устройстве
    deviceInfo.value.supportsTorch = capabilities.torch === true
    deviceInfo.value.supportsFillLightMode = capabilities.fillLightMode &&
      (capabilities.fillLightMode.includes('flash') || capabilities.fillLightMode.includes('torch'))
    deviceInfo.value.torchCapability = capabilities.torch

    addLog('deviceInfo: обновлено', {
      torch: deviceInfo.value.supportsTorch,
      fillLight: deviceInfo.value.supportsFillLightMode
    })

    console.log('📱 Обновленная информация об устройстве:', deviceInfo.value)

    console.log('🎬 Камера готова к работе с фонариком')

    console.log('✅ Камера успешно запущена')
    // Сбросим счётчик попыток в WebView после успешного запуска
    if (deviceInfo.value.isTelegramWebView) {
      tgStartAttempts.value = 0
      lastStartAt.value = Date.now()
    }

    // Убираем автоматические повторные запуски камеры, которые вызывают зацикливание
    // Вместо этого просто логируем информацию о возможностях фонарика
    if (deviceInfo.value.isAndroid && !deviceInfo.value.supportsTorch && !deviceInfo.value.supportsFillLightMode) {
      console.log('⚠️ Android: фонарик не обнаружен при первом запуске. Возможно, потребуется ручной перезапуск.')
    }
  } catch (error) {
    console.error('❌ Ошибка запуска камеры:', error)
    errorMessage.value = `Ошибка доступа к камере: ${error.message}`
    isStreamActive.value = false
    alert(`Ошибка запуска камеры: ${error.message}\n\nПроверьте:\n- Разрешения на доступ к камере\n- Используется ли HTTPS\n- Поддерживает ли устройство камеру`)
  } finally {
    isStartingCamera.value = false
    // КРИТИЧНО: очищаем блокировку при завершении
    localStorage.removeItem('last_camera_start')
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
  // Защита от зацикливания - если камера уже запускается, ждем
  if (isStartingCamera.value) {
    addLog('toggleFlashlight: пропуск (камера запускается)')
    return
  }

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

    addLog('stopCamera: остановлена')
  }
}


const copyToClipboard = async (text) => {
  try {
    // Метод 1: Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch {
        // пробуем следующий метод
      }
    }

    // Метод 2: document.execCommand
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
      textArea.focus()
      textArea.select()
      textArea.setSelectionRange(0, 99999)

      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (successful) return true
    } catch {
      // пробуем следующий метод
    }

    // Метод 3: Выделение текста
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

      if (successful) return true
    } catch {
      // все методы не сработали
    }

    return false
  } catch {
    return false
  }
}


onMounted(async () => {
  addLog('init: начало')

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
