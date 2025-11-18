import { ref, onBeforeUnmount } from 'vue'

/**
 * Composable для управления последовательностью перформанса
 * Управляет переключением цветов по заданной последовательности
 */
export function usePerformanceSequence() {
  const sequence = ref([0, 1, 0, 0, 1, 1, 0, 1])
  const currentIndex = ref(0)
  const isActive = ref(false)
  const currentColor = ref(0) // 0 - черный, 1 - белый
  let intervalId = null

  /**
   * Запускает последовательность перформанса
   */
  const startSequence = (onColorChange = null, onComplete = null) => {
    if (isActive.value) {
      return
    }

    isActive.value = true
    currentIndex.value = 0
    currentColor.value = sequence.value[0]

    // Вызываем первый цвет сразу
    if (onColorChange) {
      onColorChange(currentColor.value)
    }

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

      // Обновляем текущий цвет
      currentColor.value = sequence.value[currentIndex.value]

      // Вызываем callback с новым цветом
      if (onColorChange) {
        onColorChange(currentColor.value)
      }
    }, 1000) // Раз в секунду
  }

  /**
   * Останавливает последовательность
   */
  const stopSequence = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
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
    sequence.value = newSequence
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

