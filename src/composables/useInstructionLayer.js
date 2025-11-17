import { ref } from 'vue'

/**
 * Composable для управления слоем с инструкциями
 * Управляет видимостью слоя и инструкций с автоматическим скрытием
 */
export function useInstructionLayer(initialDelay = 4000) {
  const isLayerVisible = ref(false)
  const isInstructionVisible = ref(true)
  let instructionTimeout = null

  /**
   * Показывает слой с инструкциями
   */
  const showLayer = () => {
    isLayerVisible.value = true
    isInstructionVisible.value = true

    // Очищаем предыдущий таймаут, если есть
    clearTimeout(instructionTimeout)

    // Автоматически скрываем инструкции через указанное время
    instructionTimeout = setTimeout(() => {
      isInstructionVisible.value = false
    }, initialDelay)
  }

  /**
   * Скрывает слой
   */
  const hideLayer = () => {
    isLayerVisible.value = false
    isInstructionVisible.value = true
    clearTimeout(instructionTimeout)
  }

  return {
    isLayerVisible,
    isInstructionVisible,
    showLayer,
    hideLayer,
  }
}

