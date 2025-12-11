<template>
  <div class="frequency-spectrum">
    <canvas
      ref="canvasRef"
      class="frequency-spectrum__canvas"
    />
    <div class="frequency-spectrum__labels">
      <div class="frequency-spectrum__label frequency-spectrum__label--min">
        {{ frequencyRange.min / 1000 }} кГц
      </div>
      <div class="frequency-spectrum__label frequency-spectrum__label--max">
        {{ frequencyRange.max / 1000 }} кГц
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  frequencyData: {
    type: Uint8Array,
    default: null
  },
  frequencyRange: {
    type: Object,
    default: () => ({ min: 17000, max: 19000 })
  }
})

const canvasRef = ref(null)
let animationFrameId = null

const drawSpectrum = () => {
  if (!canvasRef.value || !props.frequencyData || props.frequencyData.length === 0) {
    animationFrameId = requestAnimationFrame(drawSpectrum)
    return
  }

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  // Используем логические размеры canvas (после масштабирования контекста)
  const container = canvas.parentElement
  if (!container) {
    animationFrameId = requestAnimationFrame(drawSpectrum)
    return
  }

  const rect = container.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  // После ctx.scale(dpr, dpr) координаты должны быть в логических пикселях
  const width = rect.width
  const height = rect.height

  if (width === 0 || height === 0) {
    animationFrameId = requestAnimationFrame(drawSpectrum)
    return
  }

  // Очищаем canvas с сохранением прозрачности для плавности
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(0, 0, width, height)

  // Рисуем сетку
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1

  // Горизонтальные линии
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Вертикальные линии
  for (let i = 0; i <= 4; i++) {
    const x = (width / 4) * i
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Рисуем спектр
  const barWidth = width / props.frequencyData.length
  const data = props.frequencyData

  // Градиент для цветов
  const gradient = ctx.createLinearGradient(0, height, 0, 0)
  gradient.addColorStop(0, '#ff00b7')
  gradient.addColorStop(0.5, '#61aede')
  gradient.addColorStop(1, '#00ff00')

  ctx.fillStyle = gradient
  ctx.strokeStyle = gradient
  ctx.lineWidth = 1

  // Отмечаем важные частоты
  const preambleFreq = 18000
  const payloadOnFreq = 17500
  const payloadOffFreq = 18500

  const freqToPosition = (freq) => {
    const range = props.frequencyRange.max - props.frequencyRange.min
    const relativeFreq = (freq - props.frequencyRange.min) / range
    return relativeFreq * width
  }

  // Вертикальные линии для важных частот
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = 2
  const preambleX = freqToPosition(preambleFreq)
  const payloadOnX = freqToPosition(payloadOnFreq)
  const payloadOffX = freqToPosition(payloadOffFreq)

  // Преамбула (18000 Гц)
  if (preambleX >= 0 && preambleX <= width) {
    ctx.beginPath()
    ctx.moveTo(preambleX, 0)
    ctx.lineTo(preambleX, height)
    ctx.stroke()

    // Подпись
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('18000', preambleX, height - 8)
  }

  // Полезные частоты
  if (payloadOnX >= 0 && payloadOnX <= width) {
    ctx.beginPath()
    ctx.moveTo(payloadOnX, 0)
    ctx.lineTo(payloadOnX, height)
    ctx.stroke()

    // Подпись
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('17500', payloadOnX, height - 8)
  }

  if (payloadOffX >= 0 && payloadOffX <= width) {
    ctx.beginPath()
    ctx.moveTo(payloadOffX, 0)
    ctx.lineTo(payloadOffX, height)
    ctx.stroke()

    // Подпись
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('18500', payloadOffX, height - 8)
  }

  // Рисуем бары спектра
  ctx.fillStyle = gradient
  ctx.lineWidth = 1
  for (let i = 0; i < data.length; i++) {
    const barHeight = (data[i] / 255) * height * 0.85
    const x = (i / data.length) * width

    if (barHeight > 0) {
      ctx.fillRect(x, height - barHeight, Math.max(1, barWidth), barHeight)
    }
  }

  // Восстанавливаем стили для текста
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'

  animationFrameId = requestAnimationFrame(drawSpectrum)
}

const resizeCanvas = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const container = canvas.parentElement
  if (!container) return

  const dpr = window.devicePixelRatio || 1
  const rect = container.getBoundingClientRect()

  if (rect.width === 0 || rect.height === 0) {
    // Если контейнер еще не имеет размера, пробуем снова
    requestAnimationFrame(resizeCanvas)
    return
  }

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
}

watch(() => props.frequencyData, () => {
  // Данные обновляются автоматически в drawSpectrum
}, { deep: true })

onMounted(() => {
  resizeCanvas()
  drawSpectrum()

  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

.frequency-spectrum {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba($color-black, 0.3);
  border-radius: 0.8rem;
  overflow: hidden;
}

.frequency-spectrum__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.frequency-spectrum__labels {
  position: absolute;
  bottom: 0.8rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  pointer-events: none;
}

.frequency-spectrum__label {
  font-size: 1rem;
  font-weight: 600;
  color: rgba($color-white, 0.7);
  font-family: $font-default;
}
</style>

