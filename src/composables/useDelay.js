/**
 * Composable для работы с задержками
 */
export function useDelay() {
  /**
   * Функция задержки выполнения
   * @param {number} ms - Время задержки в миллисекундах
   * @returns {Promise<void>}
   */
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  return {
    sleep
  }
}
