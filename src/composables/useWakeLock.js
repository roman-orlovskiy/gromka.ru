import { ref, onBeforeUnmount } from 'vue'

/**
 * Composable для управления Wake Lock API
 * Предотвращает засыпание экрана устройства
 */
export function useWakeLock() {
  const wakeLock = ref(null)
  const isActive = ref(false)

  /**
   * Запрашивает блокировку экрана для предотвращения засыпания
   */
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLock.value = await navigator.wakeLock.request('screen')
        isActive.value = true

        // Обработчик для случая, когда экран разблокируется автоматически
        wakeLock.value.addEventListener('release', () => {
          isActive.value = false
        })

        console.log('Wake Lock активирован')
      } else {
        console.warn('Wake Lock API не поддерживается в этом браузере')
      }
    } catch (err) {
      console.error('Ошибка при запросе Wake Lock:', err)
      isActive.value = false
    }
  }

  /**
   * Освобождает блокировку экрана
   */
  const releaseWakeLock = async () => {
    if (wakeLock.value) {
      try {
        await wakeLock.value.release()
        wakeLock.value = null
        isActive.value = false
        console.log('Wake Lock деактивирован')
      } catch (err) {
        console.error('Ошибка при освобождении Wake Lock:', err)
      }
    }
  }

  /**
   * Переключает состояние Wake Lock
   */
  const toggleWakeLock = async () => {
    if (isActive.value) {
      await releaseWakeLock()
    } else {
      await requestWakeLock()
    }
  }

  // Автоматически освобождаем Wake Lock при размонтировании компонента
  onBeforeUnmount(() => {
    releaseWakeLock()
  })

  return {
    wakeLock: wakeLock.value,
    isActive,
    requestWakeLock,
    releaseWakeLock,
    toggleWakeLock
  }
}
