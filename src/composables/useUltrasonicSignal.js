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
  gains: {
    preamble: 1,
    payload: 1
  },
  envelope: {
    attack: 0.015,
    release: 0.02
  }
}

/**
 * Отправляет ультразвуковой сигнал
 * @param {string} action - 'on' или 'off'
 * @returns {Promise<void>}
 */
export function sendUltrasonicSignal(action) {
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
      const startTime = ctx.currentTime

      emitTone({
        frequency: SIGNAL_FRAME.preambleFrequency,
        gain: SIGNAL_FRAME.gains.preamble,
        startTime,
        duration: SIGNAL_FRAME.preambleDuration
      })

      emitTone({
        frequency: payloadFrequency,
        gain: SIGNAL_FRAME.gains.payload,
        startTime: startTime + SIGNAL_FRAME.preambleDuration + SIGNAL_FRAME.silenceGap,
        duration: SIGNAL_FRAME.payloadDuration
      })

      const totalDuration =
        SIGNAL_FRAME.preambleDuration + SIGNAL_FRAME.silenceGap + SIGNAL_FRAME.payloadDuration

      setTimeout(() => {
        ctx.close()
        resolve()
      }, (totalDuration + 0.1) * 1000)

      console.log(
        `Передан одиночный кадр: флаг ${flag}, преамбула ${SIGNAL_FRAME.preambleFrequency} Гц, полезная часть ${payloadFrequency} Гц`
      )
    } catch (error) {
      console.error('Ошибка при передаче ультразвукового сигнала:', error)
      reject(error)
    }
  })
}

/**
 * Composable для работы с ультразвуковыми сигналами
 */
export function useUltrasonicSignal() {
  return {
    sendUltrasonicSignal
  }
}

