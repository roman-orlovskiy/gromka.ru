import { ref } from 'vue'

/**
 * Composable для управления Fullscreen API
 * Позволяет входить и выходить из полноэкранного режима
 */
export function useFullscreen() {
  const isFullscreen = ref(false)

  /**
   * Входит в полноэкранный режим
   */
  const enterFullscreen = async () => {
    const element = document.documentElement
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen()
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen()
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen()
      }
      isFullscreen.value = true
    } catch (err) {
      console.error('Ошибка при входе в полноэкранный режим:', err)
    }
  }

  /**
   * Выходит из полноэкранного режима
   */
  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen()
      }
      isFullscreen.value = false
    } catch (err) {
      console.error('Ошибка при выходе из полноэкранного режима:', err)
    }
  }

  /**
   * Переключает полноэкранный режим
   */
  const toggleFullscreen = async () => {
    if (isFullscreen.value) {
      await exitFullscreen()
    } else {
      await enterFullscreen()
    }
  }

  // Слушаем изменения состояния fullscreen
  if (typeof document !== 'undefined') {
    const updateFullscreenState = () => {
      isFullscreen.value = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement
      )
    }

    document.addEventListener('fullscreenchange', updateFullscreenState)
    document.addEventListener('webkitfullscreenchange', updateFullscreenState)
    document.addEventListener('msfullscreenchange', updateFullscreenState)
    document.addEventListener('mozfullscreenchange', updateFullscreenState)
  }

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  }
}

