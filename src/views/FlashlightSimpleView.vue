<template>
  <div class="flashlight-simple">
    <div class="flashlight-simple__container">
      <h1 class="flashlight-simple__title">Фонарик (простой режим)</h1>

      <div
        class="flashlight-simple__status"
        :class="{ 'flashlight-simple__status--on': isFlashlightOn }"
      >
        <div class="flashlight-simple__dot"></div>
        <span class="flashlight-simple__text">
          {{ isFlashlightOn ? 'Фонарик включён' : isStreamActive ? 'Камера активна' : 'Фонарик выключен' }}
        </span>
      </div>

      <div class="flashlight-simple__controls">
        <ButtonComp
          :mod="isFlashlightOn ? 'gradient-2' : 'gradient-1'"
          :disabled="isStartingCamera"
          @click="toggleFlashlight"
        >
          {{ isFlashlightOn ? 'Выключить' : 'Включить' }}
        </ButtonComp>
        <ButtonComp
          mod="gradient-4"
          @click="exportLogs"
        >
          Скопировать логи
        </ButtonComp>
      </div>

      <div class="flashlight-simple__error" v-if="errorMessage">
        <p>{{ errorMessage }}</p>
      </div>

      <div class="flashlight-simple__logs">
        <div class="flashlight-simple__logs-title">Логи (последние {{ Math.min(logs.length, 200) }})</div>
        <pre class="flashlight-simple__logs-body">{{ formattedLogs }}</pre>
      </div>

      <!-- Скрытое видео для инициализации трека/capabilities -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'

// Состояния
const isFlashlightOn = ref(false)
const isStreamActive = ref(false)
const isStartingCamera = ref(false)
const hasCameraSupport = ref(false)
const didInitChecks = ref(false)
const errorMessage = ref('')
const logs = ref([])

// Информация об устройстве (упрощенная)
const deviceInfo = ref({
  isAndroid: false
})

// Реальные объекты
let stream = null
let track = null
const videoEl = ref(null)

// Кэш для быстрых переключений
const cachedConstraints = ref({ on: null, off: null })
const cachedCapabilities = ref(null)
const hasRetriedOnce = ref(false)

// Анти-дребезг запуска и переключений
const lastStartAt = ref(0)
const lastToggleAt = ref(0)
const START_COOLDOWN_MS = 1000
const TOGGLE_COOLDOWN_MS = 220

// Логирование
const addLog = (event, payload = null) => {
  const time = new Date().toISOString()
  const entry = { time, event, payload }
  logs.value.push(entry)
  if (logs.value.length > 500) logs.value.shift()
  try { console.log(`📝 [${time}] ${event}`, payload ?? '') } catch { /* ignore console errors in restricted environments */ }
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const formattedLogs = computed(() => {
  const tail = logs.value.slice(-200)
  const safeStringify = (obj) => {
    try {
      const str = JSON.stringify(obj, null, 2)
      return str.length > 800 ? str.slice(0, 800) + '…' : str
    } catch {
      return String(obj)
    }
  }
  return tail
    .map(l => `${l.time} | ${l.event}${l.payload !== null ? `\n${safeStringify(l.payload)}` : ''}`)
    .join('\n\n')
})

const copyToClipboard = async (text) => {
  addLog('clipboard:copy:attempt')
  try {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        addLog('clipboard:copy:ok', { method: 'ClipboardAPI' })
        return true
      } catch (e) {
        addLog('clipboard:copy:api:error', { message: e?.message })
      }
    }

    // Fallback через скрытую textarea
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      textArea.style.top = '-9999px'
      textArea.setAttribute('readonly', '')
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      textArea.setSelectionRange(0, textArea.value.length)
      const ok = document.execCommand('copy')
      document.body.removeChild(textArea)
      if (ok) {
        addLog('clipboard:copy:ok', { method: 'execCommand' })
        return true
      }
    } catch (e) {
      addLog('clipboard:copy:exec:error', { message: e?.message })
    }
  } catch (e) {
    addLog('clipboard:copy:error', { message: e?.message })
  }
  addLog('clipboard:copy:fail')
  return false
}

const exportLogs = async () => {
  try {
    const text = formattedLogs.value || 'Логи пусты'
    const ok = await copyToClipboard(text)
    alert(ok ? 'Логи скопированы в буфер обмена' : 'Не удалось скопировать логи')
  } catch (e) {
    alert(`Ошибка экспорта логов: ${e?.message || e}`)
  }
}

const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  deviceInfo.value = {
    isAndroid: /android/.test(userAgent)
  }
  addLog('device:detected', deviceInfo.value)
}

const checkCameraBasics = async () => {
  try {
    addLog('checkCameraBasics:start')
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Браузер не поддерживает camera API')
    }
    const devices = await navigator.mediaDevices.enumerateDevices()
    const hasVideo = devices.some(d => d.kind === 'videoinput')
    hasCameraSupport.value = hasVideo
    if (!hasVideo) throw new Error('Камера не найдена на устройстве')
    addLog('checkCameraBasics:ok', { videoInputs: devices.filter(d => d.kind === 'videoinput').length })
  } catch (e) {
    errorMessage.value = e?.message || String(e)
    hasCameraSupport.value = false
    addLog('checkCameraBasics:error', { message: errorMessage.value })
  }
}

// НОВАЯ ФУНКЦИЯ: Ожидание полной остановки камеры
const waitForCameraStop = () => {
  return new Promise((resolve) => {
    if (!stream) {
      resolve()
      return
    }

    const checkInterval = setInterval(() => {
      const tracks = stream.getTracks()
      const allStopped = tracks.every(track => track.readyState === 'ended')

      if (allStopped || !stream.active) {
        clearInterval(checkInterval)
        addLog('camera:stop:confirmed')
        resolve()
      }
    }, 50)

    // Таймаут на всякий случай
    setTimeout(() => {
      clearInterval(checkInterval)
      addLog('camera:stop:timeout')
      resolve()
    }, 1000)
  })
}

// УПРОЩЕННАЯ ФУНКЦИЯ ПРЕФЛАЙТА - только проверка разрешений
const preflightPermissions = async () => {
  addLog('preflight:start')
  try {
    // Только проверяем состояние разрешений, не запускаем камеру
    if (navigator.permissions && navigator.permissions.query) {
      const st = await navigator.permissions.query({ name: 'camera' })
      addLog('preflight:permissionState', { state: st.state })
      // Если разрешение уже дано, не нужно делать лишних вызовов
      if (st.state === 'granted') {
        addLog('preflight:permissionAlreadyGranted')
        return
      }
    }

    // Если нет Permissions API или разрешение не дано,
    // просто ждем немного для стабильности
    await wait(100)
    addLog('preflight:completed')

  } catch (e) {
    addLog('preflight:error', { message: e?.message })
  }
}

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

// Приоритизация задних камер
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

const startCamera = async () => {
  if (isStartingCamera.value) { addLog('startCamera:skip(already-starting)'); return }
  const now = Date.now()
  if (now - lastStartAt.value < START_COOLDOWN_MS) {
    addLog('startCamera:cooldown', { msLeft: START_COOLDOWN_MS - (now - lastStartAt.value) })
    return
  }
  lastStartAt.value = now

  try {
    isStartingCamera.value = true
    errorMessage.value = ''
    addLog('camera:start')

    // Сначала убедимся, что предыдущая камера полностью остановилась
    if (stream) {
      addLog('camera:waitingForPreviousStop')
      await waitForCameraStop()
    }

    // Получаем список всех камер
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device => device.kind === 'videoinput')
    addLog('enumerateDevices', { count: cameras.length })

    if (cameras.length === 0) {
      throw new Error('Камеры не найдены на устройстве')
    }

    // Ищем задние камеры
    const backCameras = sortBackCameras(cameras.filter(d => isBackCameraDevice(d)))
    let selectedCamera = backCameras[0] || cameras[cameras.length - 1]
    addLog('camera:selected', { device: selectedCamera?.label || 'unknown' })

    // Универсальные варианты ограничений
    const constraintsOptions = [
      // Приоритет: конкретная задняя камера с высоким разрешением
      {
        video: {
          deviceId: { exact: selectedCamera.deviceId },
          facingMode: 'environment',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        }
      },
      // Задняя камера с environment
      {
        video: {
          deviceId: { exact: selectedCamera.deviceId },
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      },
      // Environment без конкретного deviceId
      {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      },
      // Простой environment
      {
        video: {
          facingMode: 'environment'
        }
      },
      // Любая камера с ограничениями
      {
        video: {
          deviceId: { exact: selectedCamera.deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      },
      // Минимальные требования
      { video: true }
    ]

    let lastError = null
    for (let i = 0; i < constraintsOptions.length; i++) {
      try {
        addLog(`camera:attempt:${i + 1}`, constraintsOptions[i])
        stream = await navigator.mediaDevices.getUserMedia(constraintsOptions[i])
        addLog('camera:getUserMedia:ok', constraintsOptions[i])
        break
      } catch (error) {
        lastError = error
        addLog('camera:getUserMedia:error', { constraints: constraintsOptions[i], message: error?.message })
      }
    }

    if (!stream) {
      throw new Error(`Не удалось запустить ни одну камеру. Последняя ошибка: ${lastError?.message}`)
    }

    track = stream.getVideoTracks()[0]
    if (!track) throw new Error('Видеотрек не найден в потоке')
    isStreamActive.value = true

    // Обработка событий трека для отслеживания состояния
    track.addEventListener('ended', () => {
      addLog('track:ended')
      isStreamActive.value = false
      isFlashlightOn.value = false
    })

    track.addEventListener('mute', () => {
      addLog('track:muted')
    })

    track.addEventListener('unmute', () => {
      addLog('track:unmuted')
    })

    // Привязка к скрытому видео и автозапуск
    try {
      if (videoEl.value) {
        if (videoEl.value.srcObject !== stream) videoEl.value.srcObject = stream
        const p = videoEl.value.play()
        if (p && typeof p.then === 'function') await p.catch(() => {})
      }
    } catch (e) {
      addLog('video:play:error', { message: e?.message })
    }

    // Ждем стабилизации трека перед получением capabilities
    await new Promise((resolve) => {
      const checkReady = () => {
        if (track.readyState === 'live') {
          resolve()
        } else {
          setTimeout(checkReady, 50)
        }
      }
      checkReady()
    })

    // Получаем capabilities с несколькими попытками
    let caps = null
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        caps = track.getCapabilities?.()
        if (caps && (caps.torch === true || caps.fillLightMode)) {
          addLog('track:capabilities:found', caps)
          break
        }
        if (attempt < 4) {
          await new Promise(r => setTimeout(r, 100))
        }
      } catch (e) {
        addLog('track:capabilities:error', { message: e?.message, attempt })
      }
    }

    if (!caps) {
      try {
        caps = track.getCapabilities?.()
        addLog('track:capabilities:final', caps)
      } catch (e) {
        addLog('track:capabilities:error', { message: e?.message })
      }
    }

    cachedCapabilities.value = caps
  } catch (e) {
    errorMessage.value = `Ошибка запуска камеры: ${e?.message || e}`
    isStreamActive.value = false
    addLog('camera:start:error', { message: errorMessage.value })
  } finally {
    isStartingCamera.value = false
  }
}

const getTorchConstraints = (turnOn) => {
  const result = []
  // Основные варианты
  result.push(
    { advanced: [{ torch: !!turnOn }] },
    { torch: !!turnOn }
  )
  // Альтернативы через fillLightMode
  const mode = turnOn ? 'flash' : 'off'
  result.push(
    { advanced: [{ fillLightMode: mode }] },
    { fillLightMode: mode }
  )
  return result
}

const setFlashlightState = async (turnOn) => {
  if (!track) return false
  try {
    // 1) Быстрый путь через кэш
    const cached = turnOn ? cachedConstraints.value.on : cachedConstraints.value.off
    if (cached) {
      try {
        await track.applyConstraints(cached)
        isFlashlightOn.value = !!turnOn
        addLog('torch:apply(cached):ok', { on: !!turnOn })
        return true
      } catch (e) {
        addLog('torch:apply(cached):error', { message: e?.message })
        if (turnOn) cachedConstraints.value.on = null; else cachedConstraints.value.off = null
      }
    }

    // 2) Подбор рабочего ограничения
    const variants = getTorchConstraints(turnOn)
    for (const v of variants) {
      try {
        await track.applyConstraints(v)
        isFlashlightOn.value = !!turnOn
        if (turnOn) cachedConstraints.value.on = v; else cachedConstraints.value.off = v
        addLog('torch:apply:ok', { on: !!turnOn, constraint: v })
        return true
      } catch (e) {
        addLog('torch:apply:fail', { on: !!turnOn, message: e?.message })
      }
    }

    // 3) Fallback через ImageCapture
    if ('ImageCapture' in window) {
      try {
        const ic = new window.ImageCapture(track)
        try {
          const photoCaps = await ic.getPhotoCapabilities()
          addLog('imageCapture:getPhotoCapabilities:ok', photoCaps)
        } catch (e) {
          addLog('imageCapture:getPhotoCapabilities:error', { message: e?.message })
        }

        // Универсальные варианты для всех устройств
        const universalOptions = [
          { torch: !!turnOn },
          { fillLightMode: turnOn ? 'flash' : 'off' },
          { flash: !!turnOn }
        ]

        for (const option of universalOptions) {
          try {
            await ic.setOptions(option)
            isFlashlightOn.value = !!turnOn
            if (turnOn) cachedConstraints.value.on = { advanced: [{ torch: true }] }
            else cachedConstraints.value.off = { advanced: [{ torch: false }] }
            addLog('torch:imageCapture:ok', { on: !!turnOn, option })
            return true
          } catch (e) {
            addLog('torch:imageCapture:fail', { option, message: e?.message })
          }
        }
      } catch (e) {
        addLog('torch:imageCapture:error', { message: e?.message })
      }
    }

    throw new Error('Фонарик не поддерживается данным устройством/профилем')
  } catch (e) {
    errorMessage.value = e?.message || String(e)
    addLog('torch:error', { message: errorMessage.value })
    return false
  }
}

const toggleFlashlight = async () => {
  const now = Date.now()
  if (now - lastToggleAt.value < TOGGLE_COOLDOWN_MS) {
    addLog('toggle:cooldown', { msLeft: TOGGLE_COOLDOWN_MS - (now - lastToggleAt.value) })
    return
  }
  lastToggleAt.value = now

  try {
    // Первый клик: все проверки и префлайт строго по жесту пользователя
    if (!didInitChecks.value) {
      addLog('init:onClick:start')
      await checkCameraBasics()
      await preflightPermissions() // Теперь здесь только проверка разрешений
      didInitChecks.value = true
      addLog('init:onClick:done', { hasCameraSupport: hasCameraSupport.value })
    }

    if (!isStreamActive.value || !track) {
      await startCamera() // Только ОДИН вызов getUserMedia
      if (!isStreamActive.value || !track) return
    }

    // Проверяем поддержку один раз (или используем кэш)
    const caps = cachedCapabilities.value || track.getCapabilities?.() || {}
    cachedCapabilities.value = caps
    const hasSupport = caps?.torch === true || (Array.isArray(caps?.fillLightMode) && (caps.fillLightMode.includes('flash') || caps.fillLightMode.includes('torch')))
    if (!hasSupport) addLog('toggle:capabilities:no-torch', caps)

    // Одноразовый перезапуск при отсутствии поддержки
    if (!hasSupport && !hasRetriedOnce.value) {
      hasRetriedOnce.value = true
      addLog('retry:once:start')
      stopCamera()
      await waitForCameraStop() // Ждем полной остановки
      await startCamera()
      const caps2 = cachedCapabilities.value || (track && track.getCapabilities?.()) || {}
      cachedCapabilities.value = caps2
      const hasSupport2 = caps2?.torch === true || (Array.isArray(caps2?.fillLightMode) && (caps2.fillLightMode.includes('flash') || caps2.fillLightMode.includes('torch')))
      addLog('retry:once:done', { supported: hasSupport2 })
    }

    const target = !isFlashlightOn.value
    addLog('toggle:attempt', { target })
    const ok = await setFlashlightState(target)
    if (!ok) throw new Error('Не удалось переключить фонарик')
    addLog('toggle:done', { on: isFlashlightOn.value })
  } catch (e) {
    errorMessage.value = e?.message || String(e)
    addLog('toggle:error', { message: errorMessage.value })
    alert(`Ошибка управления фонариком: ${errorMessage.value}`)
  }
}

const stopCamera = () => {
  try {
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
      stream = null
      track = null
    }
  } catch (e) {
    addLog('camera:stop:error', { message: e?.message })
  }
  isStreamActive.value = false
  isFlashlightOn.value = false
  cachedConstraints.value.on = null
  cachedConstraints.value.off = null
  cachedCapabilities.value = null
  addLog('camera:stopped')
}

onMounted(async () => {
  addLog('page:init', {
    protocol: window.location.protocol,
    ua: navigator.userAgent,
    mediaDevices: !!navigator.mediaDevices,
    gUM: !!navigator.mediaDevices?.getUserMedia
  })

  // Детекция устройства
  detectDevice()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<style lang="scss">
.flashlight-simple {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1f4037 0%, #99f2c8 100%);
  color: $color-white;

  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    max-width: 560px;
    width: 100%;
  }

  &__title {
    font-size: 3rem;
    text-align: center;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.6rem;
    background-color: rgba(255, 255, 255, 0.12);
    border-radius: 1.2rem;
    border: 2px solid rgba(255, 255, 255, 0.22);
    transition: all 0.25s ease;

    &--on {
      background-color: rgba(255, 215, 0, 0.22);
      border-color: rgba(255, 215, 0, 0.42);
      box-shadow: 0 0 18px rgba(255, 215, 0, 0.32);
    }
  }

  &__dot {
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 50%;
    background: #ff4757;
    box-shadow: 0 0 10px rgba(255, 71, 87, 0.5);
  }

  &__status--on &__dot {
    background: #ffa502;
    box-shadow: 0 0 14px rgba(255, 165, 2, 0.7);
  }

  &__text {
    font-size: 1.6rem;
    font-weight: 500;
  }

  &__controls {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  &__error {
    padding: 1.2rem;
    border-radius: 1rem;
    background-color: rgba(255, 71, 87, 0.2);
    border: 1px solid rgba(255, 71, 87, 0.4);
    color: #ffebee;
    text-align: center;
    font-size: 1.4rem;
  }

  &__logs {
    width: 100%;
    max-width: 560px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 0.8rem;
    overflow: hidden;
  }

  &__logs-title {
    padding: 0.8rem 1rem;
    font-size: 1.4rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.12);
    border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  }

  &__logs-body {
    margin: 0;
    padding: 1rem;
    max-height: 220px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 1.2rem;
    line-height: 1.5;
    color: #f0f0f0;
    background: transparent;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    &__title { font-size: 2.4rem; }
    &__text { font-size: 1.4rem; }
  }
}
</style>
