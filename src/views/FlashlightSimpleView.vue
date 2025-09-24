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

const preflightPermissions = async () => {
  addLog('preflight:start')
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const st = await navigator.permissions.query({ name: 'camera' })
      addLog('preflight:permissionState', { state: st.state })
      if (st.state !== 'granted') {
        try {
          const s = await navigator.mediaDevices.getUserMedia({ video: true })
          s.getTracks().forEach(t => t.stop())
          addLog('preflight:gUM:ok')
          await new Promise(r => setTimeout(r, 120))
        } catch (e) {
          addLog('preflight:gUM:error', { message: e?.message })
        }
      }
    } else {
      // Консервативный прогрев, если нет Permissions API
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true })
        s.getTracks().forEach(t => t.stop())
        addLog('preflight:gUM(no-permissions-api):ok')
        await new Promise(r => setTimeout(r, 120))
      } catch (e) {
        addLog('preflight:gUM(no-permissions-api):error', { message: e?.message })
      }
    }
  } catch (e) {
    addLog('preflight:error', { message: e?.message })
  }
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

    // Подбор простых ограничений: предпочитаем заднюю камеру
    const constraintsList = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: 'environment' } },
      { video: true }
    ]

    let lastErr = null
    for (const c of constraintsList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(c)
        addLog('camera:getUserMedia:ok', c)
        break
      } catch (e) {
        lastErr = e
        addLog('camera:getUserMedia:error', { constraints: c, message: e?.message })
      }
    }

    if (!stream) throw new Error(`Не удалось получить видеопоток: ${lastErr?.message || 'unknown'}`)

    track = stream.getVideoTracks()[0]
    if (!track) throw new Error('Видеотрек не найден в потоке')
    isStreamActive.value = true

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

    // Небольшая задержка, чтобы стабилизировать capabilities
    await new Promise(r => setTimeout(r, 150))

    let caps = null
    try { caps = track.getCapabilities?.() } catch { /* no capabilities available yet */ }
    cachedCapabilities.value = caps
    addLog('track:capabilities', caps)
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
          await ic.getPhotoCapabilities().catch((e) => {
            addLog('imageCapture:getPhotoCapabilities:error', { message: e?.message })
          })
        } catch { /* ignore imageCapture capability errors */ }
        await ic.setOptions({ torch: !!turnOn })
        isFlashlightOn.value = !!turnOn
        if (turnOn) cachedConstraints.value.on = { advanced: [{ torch: true }] }
        else cachedConstraints.value.off = { advanced: [{ torch: false }] }
        addLog('torch:imageCapture:setOptions:ok', { on: !!turnOn })
        return true
      } catch (e) {
        addLog('torch:imageCapture:setOptions:error', { message: e?.message })
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
      await preflightPermissions()
      didInitChecks.value = true
      addLog('init:onClick:done', { hasCameraSupport: hasCameraSupport.value })
    }

    if (!isStreamActive.value || !track) {
      await startCamera()
      if (!isStreamActive.value || !track) return
    }

    // Проверяем поддержку один раз (или используем кэш)
    const caps = cachedCapabilities.value || track.getCapabilities?.() || {}
    cachedCapabilities.value = caps
    const hasSupport = caps?.torch === true || (Array.isArray(caps?.fillLightMode) && (caps.fillLightMode.includes('flash') || caps.fillLightMode.includes('torch')))
    if (!hasSupport) addLog('toggle:capabilities:no-torch', caps)

    // Одноразовый перезапуск при отсутствии поддержки (некоторые Samsung/Fold раскрывают torch со 2-го раза)
    if (!hasSupport && !hasRetriedOnce.value) {
      hasRetriedOnce.value = true
      addLog('retry:once:start')
      stopCamera()
      await wait(220)
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
  } catch { /* ignore stop errors */ }
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
  // Все проверки и префлайт выполняются строго по клику
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


