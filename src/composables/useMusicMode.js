import { ref } from 'vue'

export function useMusicMode() {
  const isPlayingMusic = ref(false)
  const currentRhythm = ref(null)
  const musicInterval = ref(null)

  const loadRhythmData = async () => {
    try {
      console.log('🎵 Загрузка ритма Бетховена...')
      // Импортируем JSON файл напрямую
      const rhythmData = await import('@/assets/data/beethoven_rhythm.json')
      currentRhythm.value = rhythmData.default
      console.log('✅ Ритм Бетховена загружен:', rhythmData.default)
      return rhythmData.default
    } catch (error) {
      console.error('❌ Ошибка загрузки ритма:', error)
      // Создаем базовый ритм в случае ошибки
      currentRhythm.value = {
        name: "Ритм Бетховена (базовый)",
        description: "Та та та тааа",
        isCyclical: true,
        pattern: [
          { duration: 250, action: "on", description: "Та" },
          { duration: 250, action: "off", description: "пауза" },
          { duration: 250, action: "on", description: "та" },
          { duration: 250, action: "off", description: "пауза" },
          { duration: 250, action: "on", description: "та" },
          { duration: 250, action: "off", description: "пауза" },
          { duration: 500, action: "on", description: "тааа" },
          { duration: 500, action: "off", description: "длинная пауза" }
        ]
      }
      console.log('✅ Используем базовый ритм Бетховена')
      return currentRhythm.value
    }
  }

  const playMusic = async (setFlashlightState) => {
    if (isPlayingMusic.value) {
      stopMusic()
      return
    }

    if (!currentRhythm.value) {
      await loadRhythmData()
    }

    console.log('🎵 Начинаем играть ритм Бетховена...')
    isPlayingMusic.value = true

    let currentNote = 0
    const pattern = currentRhythm.value.pattern

    const playNote = () => {
      if (!isPlayingMusic.value) {
        return
      }

      const note = pattern[currentNote]
      console.log(`🎵 Играем ноту ${currentNote + 1}/${pattern.length}: ${note.description || note.action}`)

      // Включаем или выключаем фонарик
      if (note.action === 'on') {
        setFlashlightState(true)
      } else {
        setFlashlightState(false)
      }

      currentNote++

      // Если цикличность включена и ритм закончился, начинаем заново
      if (currentNote >= pattern.length) {
        if (currentRhythm.value.isCyclical) {
          console.log('🔄 Повторяем ритм Бетховена...')
          currentNote = 0
        } else {
          console.log('🎵 Ритм Бетховена завершен')
          stopMusic()
          return
        }
      }

      // Планируем следующую ноту
      musicInterval.value = setTimeout(playNote, note.duration)
    }

    // Начинаем воспроизведение
    playNote()
  }

  const stopMusic = () => {
    console.log('🛑 Останавливаем музыкальный фонарик')
    isPlayingMusic.value = false

    if (musicInterval.value) {
      clearTimeout(musicInterval.value)
      musicInterval.value = null
    }
  }

  const cleanup = () => {
    console.log('🧹 Очистка музыкального режима...')
    stopMusic()
  }

  return {
    isPlayingMusic,
    currentRhythm,
    loadRhythmData,
    playMusic,
    stopMusic,
    cleanup
  }
}
