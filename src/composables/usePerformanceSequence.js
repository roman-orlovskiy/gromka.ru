import { ref, onBeforeUnmount } from 'vue'
import soundScenarios from '@/assets/data/sound-demo.json'

/**
 * Composable для управления последовательностью перформанса
 * Управляет переключением цветов по заданной последовательности
 */
const DEFAULT_SCENARIO_KEY = 'sound-demo'

const resolveScenarioSequence = (scenarioKey) => {
  if (typeof scenarioKey === 'string' && soundScenarios[scenarioKey]) {
    return [...soundScenarios[scenarioKey]]
  }

  console.warn(`[usePerformanceSequence] Сценарий "${scenarioKey}" не найден`)
  return []
}

const resolveSequenceInput = (value) => {
  if (typeof value === 'string') {
    return resolveScenarioSequence(value)
  }

  if (Array.isArray(value)) {
    return [...value]
  }

  return []
}

export function usePerformanceSequence(scenarioKey = DEFAULT_SCENARIO_KEY) {
  const sequence = ref(resolveScenarioSequence(scenarioKey))
  const currentIndex = ref(0)
  const isActive = ref(false)
  const currentColor = ref(0) // 0 - черный, 1 - белый
  let intervalId = null
  let flickerIntervalId = null

  const stopFlicker = () => {
    if (flickerIntervalId) {
      clearInterval(flickerIntervalId)
      flickerIntervalId = null
    }
  }

  const startFlicker = (onColorChange) => {
    stopFlicker()
    flickerIntervalId = setInterval(() => {
      currentColor.value = currentColor.value === 1 ? 0 : 1
      if (onColorChange) {
        onColorChange(currentColor.value)
      }
    }, 150)
  }

  const handleStepValue = (value, onColorChange) => {
    if (value === -1) {
      startFlicker(onColorChange)
      return
    }

    stopFlicker()
    currentColor.value = value
    if (onColorChange) {
      onColorChange(currentColor.value)
    }
  }

  /**
   * Запускает последовательность перформанса
   */
  const startSequence = (onColorChange = null, onComplete = null) => {
    if (isActive.value) {
      return
    }

    if (!sequence.value.length) {
      console.warn('[usePerformanceSequence] Пустая последовательность, запуск невозможен')
      return
    }

    isActive.value = true
    currentIndex.value = 0
    handleStepValue(sequence.value[0], onColorChange)

    // Запускаем интервал
    intervalId = setInterval(() => {
      currentIndex.value++

      // Если последовательность закончилась
      if (currentIndex.value >= sequence.value.length) {
        stopSequence()
        // Последний цвет уже применен, просто вызываем onComplete
        if (onComplete) {
          onComplete()
        }
        return
      }

      handleStepValue(sequence.value[currentIndex.value], onColorChange)
    }, 1200)
  }

  /**
   * Останавливает последовательность
   */
  const stopSequence = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    stopFlicker()
    isActive.value = false
    currentIndex.value = 0
    currentColor.value = 0
  }

  /**
   * Устанавливает новую последовательность
   */
  const setSequence = (newSequence) => {
    if (isActive.value) {
      stopSequence()
    }
    sequence.value = resolveSequenceInput(newSequence)
  }

  // Автоматически очищаем интервал при размонтировании
  onBeforeUnmount(() => {
    stopSequence()
  })

  return {
    sequence,
    currentIndex,
    isActive,
    currentColor,
    startSequence,
    stopSequence,
    setSequence,
  }
}

