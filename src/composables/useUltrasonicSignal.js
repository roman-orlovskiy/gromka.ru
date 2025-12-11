/**
 * Composable для отправки ультразвуковых сигналов
 * Используется для управления перформансом через ультразвуковые команды
 */

const SIGNAL_FRAME = {
  preambleFrequency: 19500,
  payloadFrequencies: {
    on: 19000,
    off: 18000
  },
  preambleDuration: 0.08,
  payloadDuration: 0.2,
  silenceGap: 0.05,
  interFrameGapMs: 300,
  burstCount: 5,
  gains: {
    preamble: 1,
    payload: 1
  },
  envelope: {
    attack: 0.015,
    release: 0.02
  }
}

const getBurstDefaults = () => ({
  count: SIGNAL_FRAME.burstCount,
  interFrameGapMs: SIGNAL_FRAME.interFrameGapMs
})

/**
 * Отправляет ультразвуковой сигнал
 * @param {string} action - 'on' или 'off'
 * @param {Object} [options]
 * @param {number} [options.count=SIGNAL_FRAME.burstCount] - количество кадров подряд
 * @param {number} [options.interFrameGapMs=SIGNAL_FRAME.interFrameGapMs] - пауза между кадрами
 * @returns {Promise<void>}
 */
export function sendUltrasonicSignal(action, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()

      const emitTone = ({ frequency, gain, startTime, duration }) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.frequency.value = frequency
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        const {
          attack,
          release
        } = SIGNAL_FRAME.envelope
        const effectiveAttack = Math.min(attack, duration / 3)
        const effectiveRelease = Math.min(release, duration / 3)
        const epsilon = 0.000001

        gainNode.gain.setValueAtTime(epsilon, startTime)
        gainNode.gain.linearRampToValueAtTime(gain, startTime + effectiveAttack)
        gainNode.gain.setValueAtTime(gain, startTime + duration - effectiveRelease)
        gainNode.gain.linearRampToValueAtTime(epsilon, startTime + duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }

      const flag = action === 'on' ? 1 : 0
      const payloadFrequency =
        flag === 1 ? SIGNAL_FRAME.payloadFrequencies.on : SIGNAL_FRAME.payloadFrequencies.off
      const defaults = getBurstDefaults()
      const burstCountRaw = typeof options.count === 'number' ? options.count : defaults.count
      const burstCount = Number.isFinite(burstCountRaw) ? Math.max(1, Math.floor(burstCountRaw)) : 1

      const interFrameGapMsRaw =
        typeof options.interFrameGapMs === 'number' ? options.interFrameGapMs : defaults.interFrameGapMs
      const interFrameGapMs = Number.isFinite(interFrameGapMsRaw) ? Math.max(0, interFrameGapMsRaw) : 0
      const interFrameGapSec = interFrameGapMs / 1000

      const frameDurationSec =
        SIGNAL_FRAME.preambleDuration + SIGNAL_FRAME.silenceGap + SIGNAL_FRAME.payloadDuration

      const startTime = ctx.currentTime

      for (let i = 0; i < burstCount; i++) {
        const frameStartTime = startTime + i * (frameDurationSec + interFrameGapSec)

        emitTone({
          frequency: SIGNAL_FRAME.preambleFrequency,
          gain: SIGNAL_FRAME.gains.preamble,
          startTime: frameStartTime,
          duration: SIGNAL_FRAME.preambleDuration
        })

        emitTone({
          frequency: payloadFrequency,
          gain: SIGNAL_FRAME.gains.payload,
          startTime: frameStartTime + SIGNAL_FRAME.preambleDuration + SIGNAL_FRAME.silenceGap,
          duration: SIGNAL_FRAME.payloadDuration
        })
      }

      const totalDurationSec =
        burstCount * frameDurationSec + Math.max(0, burstCount - 1) * interFrameGapSec

      setTimeout(() => {
        ctx.close()
        resolve()
      }, (totalDurationSec + 0.1) * 1000)

      console.log(
        `Передан сигнал: кадров ${burstCount}, флаг ${flag}, преамбула ${SIGNAL_FRAME.preambleFrequency} Гц, полезная часть ${payloadFrequency} Гц, пауза между кадрами ${interFrameGapMs}мс`
      )
    } catch (error) {
      console.error('Ошибка при передаче ультразвукового сигнала:', error)
      reject(error)
    }
  })
}

/**
 * Генерирует WAV файл с ультразвуковым сигналом
 * @param {string} action - 'on' или 'off'
 * @param {Object} [options]
 * @param {number} [options.count=SIGNAL_FRAME.burstCount] - количество кадров подряд
 * @param {number} [options.interFrameGapMs=SIGNAL_FRAME.interFrameGapMs] - пауза между кадрами
 * @returns {Blob} WAV файл
 */
export function generateUltrasonicWav(action, options = {}) {
  const sampleRate = 44100
  const flag = action === 'on' ? 1 : 0
  const payloadFrequency = flag === 1 ? SIGNAL_FRAME.payloadFrequencies.on : SIGNAL_FRAME.payloadFrequencies.off
  const defaults = getBurstDefaults()
  const burstCountRaw = typeof options.count === 'number' ? options.count : defaults.count
  const burstCount = Number.isFinite(burstCountRaw) ? Math.max(1, Math.floor(burstCountRaw)) : 1

  const interFrameGapMsRaw =
    typeof options.interFrameGapMs === 'number' ? options.interFrameGapMs : defaults.interFrameGapMs
  const interFrameGapMs = Number.isFinite(interFrameGapMsRaw) ? Math.max(0, interFrameGapMsRaw) : 0

  // Вычисляем длительности в сэмплах
  const preambleSamples = Math.floor(SIGNAL_FRAME.preambleDuration * sampleRate)
  const silenceSamples = Math.floor(SIGNAL_FRAME.silenceGap * sampleRate)
  const payloadSamples = Math.floor(SIGNAL_FRAME.payloadDuration * sampleRate)
  const frameSamples = preambleSamples + silenceSamples + payloadSamples
  const interFrameGapSamples = Math.floor((interFrameGapMs / 1000) * sampleRate)
  const totalSamples = burstCount * frameSamples + Math.max(0, burstCount - 1) * interFrameGapSamples

  // Создаем массив сэмплов
  const samples = new Float32Array(totalSamples)

  // Генерируем тон
  const generateTone = (frequency, startSample, durationSamples, gain, attackSamples, releaseSamples) => {
    const twoPi = 2 * Math.PI
    const phaseIncrement = (twoPi * frequency) / sampleRate
    let phase = 0

    for (let i = 0; i < durationSamples; i++) {
      const sampleIndex = startSample + i

      // Вычисляем envelope
      let envelope = gain
      if (i < attackSamples) {
        envelope = gain * (i / attackSamples)
      } else if (i >= durationSamples - releaseSamples) {
        const releaseProgress = (i - (durationSamples - releaseSamples)) / releaseSamples
        envelope = gain * (1 - releaseProgress)
      }

      samples[sampleIndex] = Math.sin(phase) * envelope
      phase += phaseIncrement

      // Нормализуем фазу для избежания переполнения
      if (phase >= twoPi) {
        phase -= twoPi
      }
    }
  }

  const attackSamples = Math.floor(SIGNAL_FRAME.envelope.attack * sampleRate)
  const releaseSamples = Math.floor(SIGNAL_FRAME.envelope.release * sampleRate)

  for (let i = 0; i < burstCount; i++) {
    const frameStartSample = i * (frameSamples + interFrameGapSamples)

    // Преамбула
    generateTone(
      SIGNAL_FRAME.preambleFrequency,
      frameStartSample,
      preambleSamples,
      SIGNAL_FRAME.gains.preamble,
      attackSamples,
      releaseSamples
    )

    // Тишина (уже нули в массиве)

    // Полезная часть
    generateTone(
      payloadFrequency,
      frameStartSample + preambleSamples + silenceSamples,
      payloadSamples,
      SIGNAL_FRAME.gains.payload,
      attackSamples,
      releaseSamples
    )
  }

  // Конвертируем Float32Array в Int16Array для WAV
  const int16Samples = new Int16Array(totalSamples)
  for (let i = 0; i < totalSamples; i++) {
    // Ограничиваем значение и конвертируем в 16-bit PCM
    const sample = Math.max(-1, Math.min(1, samples[i]))
    int16Samples[i] = Math.round(sample * 32767)
  }

  // Создаем WAV файл
  const wavBuffer = new ArrayBuffer(44 + int16Samples.length * 2)
  const view = new DataView(wavBuffer)

  // WAV заголовок
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + int16Samples.length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // размер fmt chunk
  view.setUint16(20, 1, true) // аудио формат (1 = PCM)
  view.setUint16(22, 1, true) // количество каналов
  view.setUint32(24, sampleRate, true) // sample rate
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(36, 'data')
  view.setUint32(40, int16Samples.length * 2, true) // размер данных

  // Записываем сэмплы
  const samplesView = new Int16Array(wavBuffer, 44)
  samplesView.set(int16Samples)

  return new Blob([wavBuffer], { type: 'audio/wav' })
}

/**
 * Скачивает WAV файл с ультразвуковым сигналом
 * @param {string} action - 'on' или 'off'
 * @param {string} filename - имя файла (по умолчанию 'ultrasonic-on.wav' или 'ultrasonic-off.wav')
 * @param {Object} [options]
 * @param {number} [options.count=SIGNAL_FRAME.burstCount] - количество кадров подряд
 * @param {number} [options.interFrameGapMs=SIGNAL_FRAME.interFrameGapMs] - пауза между кадрами
 */
export function downloadUltrasonicWav(action, filename = null, options = {}) {
  const blob = generateUltrasonicWav(action, options)
  const defaultFilename = action === 'on' ? 'ultrasonic-on.wav' : 'ultrasonic-off.wav'
  const finalFilename = filename || defaultFilename

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = finalFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Composable для работы с ультразвуковыми сигналами
 */
export function useUltrasonicSignal() {
  return {
    sendUltrasonicSignal,
    generateUltrasonicWav,
    downloadUltrasonicWav,
    ultrasonicBurstDefaults: Object.freeze(getBurstDefaults())
  }
}

