<template>
  <div class="flashlight">
    <div class="flashlight__container">
      <h1 class="flashlight__title">Фонарик камеры</h1>

      <div class="flashlight__status" :class="statusClasses">
        <div class="flashlight__status-indicator"></div>
        <span class="flashlight__status-text">
          {{ statusText }}
        </span>
      </div>

      <div class="flashlight__controls">
        <ButtonComp
          :mod="buttonMod"
          @click="toggleFlashlight"
          :disabled="isButtonDisabled"
        >
          {{ buttonText }}
        </ButtonComp>
      </div>

      <div class="flashlight__info" v-if="!hasCameraSupport">
        <p>Ваше устройство не поддерживает функцию фонарика камеры</p>
      </div>

      <div class="flashlight__info" v-if="hasCameraSupport && isStreamActive && !supportsFlashlight">
        <p>Камера найдена, но фонарик не поддерживается</p>
        <p style="font-size: 1.2rem; margin-top: 0.5rem; opacity: 0.8;">
          💡 Если вы в инкогнито режиме, попробуйте обычный режим браузера
        </p>
      </div>

      <div class="flashlight__loading" v-if="isLoadingCameraSupport">
        <p>Проверка поддержки камеры...</p>
      </div>

      <div class="flashlight__loading" v-if="isLoadingCamera">
        <p>Запуск камеры...</p>
      </div>

      <div class="flashlight__error" v-if="errorMessage">
        <p>{{ errorMessage }}</p>
        <ButtonComp
          mod="gradient-5"
          @click="retryOperation"
          style="margin-top: 1rem;"
        >
          Попробовать снова
        </ButtonComp>
      </div>

      <!-- Скрытый видео-элемент: привязка потока необходима для корректной инициализации трека/капаабилити на первом запуске на ряде устройств -->
      <video
        ref="videoEl"
        playsinline
        muted
        autoplay
        style="display: none; width: 0; height: 0"
      ></video>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import { useCameraSupport } from '@/composables/useCameraSupport.js'
import { useCamera } from '@/composables/useCamera.js'

// Ссылка на скрытый видео элемент
const videoEl = ref(null)

// Используем хук для проверки камеры
const { hasCameraSupport, errorMessage: cameraSupportError, isLoading: isLoadingCameraSupport, checkCameraSupport } = useCameraSupport()

// Используем хук для работы с камерой
const {
  isStreamActive,
  isFlashlightOn,
  errorMessage: cameraError,
  isLoading: isLoadingCamera,
  supportsFlashlight,
  isPlayingMusic,
  toggleFlashlight,
  stopCamera
} = useCamera(videoEl)

// Импортируем функцию загрузки ритма
import { useMusicMode } from '@/composables/useMusicMode.js'
const { loadRhythmData } = useMusicMode()

// Computed свойства для динамических значений
const buttonMod = computed(() => isPlayingMusic.value ? 'gradient-3' : isFlashlightOn.value ? 'gradient-2' : 'gradient-4')
const buttonText = computed(() => isPlayingMusic.value ? 'Остановить' : 'Начать')
const statusText = computed(() => isPlayingMusic.value ? '🎵 Играет ритм' : isFlashlightOn.value ? 'Фонарик включен' : 'Фонарик выключен')
const isButtonDisabled = computed(() => !hasCameraSupport.value || isLoadingCameraSupport.value || isLoadingCamera.value)
const statusClasses = computed(() => ({
  'flashlight__status--active': isFlashlightOn.value,
  'flashlight__status--music': isPlayingMusic.value
}))

// Объединяем ошибки от разных источников
const errorMessage = computed(() => cameraSupportError.value || cameraError.value)

const cleanup = () => {
  console.log('🧹 Очистка ресурсов...')
  stopCamera()
}

const retryOperation = async () => {
  console.log('🔄 Повторная попытка...')
  // Очищаем ошибки и пробуем снова
  errorMessage.value = ''
  await checkCameraSupport()
}

onMounted(async () => {
  console.log('🚀 Инициализация страницы фонарика...')
  console.log('🌐 Протокол:', window.location.protocol)
  console.log('📱 User Agent:', navigator.userAgent)
  console.log('🔒 HTTPS:', window.location.protocol === 'https:')

  // Загружаем ритм Бетховена при инициализации
  await loadRhythmData()

  // Проверяем поддержку камеры
  checkCameraSupport()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style lang="scss">
@use '@/assets/scss/variables.scss' as *;

.flashlight {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, $color-vibrant-blue 0%, $color-vibrant-purple 100%);
  color: $color-white;

  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    max-width: 600px;
    width: 100%;
  }

  &__title {
    font-size: 3.5rem;
    text-align: center;
    margin-bottom: 1rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 2rem;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;

    &--active {
      background-color: rgba($color-vibrant-orange, 0.2);
      border-color: rgba($color-vibrant-orange, 0.4);
      box-shadow: 0 0 20px rgba($color-vibrant-orange, 0.3);
    }

    &--music {
      background-color: rgba($color-vibrant-pink, 0.2);
      border-color: rgba($color-vibrant-pink, 0.4);
      box-shadow: 0 0 20px rgba($color-vibrant-pink, 0.3);
      animation: pulse-music 0.5s ease-in-out infinite alternate;
    }

    &-indicator {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background-color: $color-error;
      transition: background-color 0.3s ease;
      box-shadow: 0 0 10px rgba($color-error, 0.5);
    }

    &--active &-indicator {
      background-color: $color-vibrant-orange;
      box-shadow: 0 0 15px rgba($color-vibrant-orange, 0.7);
    }

    &--music &-indicator {
      background-color: $color-vibrant-pink;
      box-shadow: 0 0 15px rgba($color-vibrant-pink, 0.7);
      animation: pulse-indicator 0.5s ease-in-out infinite alternate;
    }

    &-text {
      font-size: 1.8rem;
      font-weight: 500;
    }
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 300px;
  }

  &__info,
  &__error,
  &__loading {
    padding: 1.5rem;
    border-radius: 1rem;
    text-align: center;
    font-size: 1.6rem;
    max-width: 400px;
  }

  &__info {
    background-color: rgba($color-white, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba($color-white, 0.2);
  }

  &__error {
    background-color: rgba($color-error, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba($color-error, 0.4);
    color: #ffebee;
  }

  &__loading {
    background-color: rgba($color-primary, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba($color-primary, 0.4);
    color: $color-primary-light;
  }

  @media (max-width: $breakpoint-mobile) {
    padding: 1rem;

    &__title {
      font-size: 2.5rem;
    }

    &__status-text {
      font-size: 1.5rem;
    }

    &__info,
    &__error,
    &__loading {
      font-size: 1.4rem;
      padding: 1rem;
    }
  }
}

@keyframes pulse-music {
  0% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba($color-vibrant-pink, 0.3);
  }
  100% {
    transform: scale(1.02);
    box-shadow: 0 0 30px rgba($color-vibrant-pink, 0.5);
  }
}

@keyframes pulse-indicator {
  0% {
    transform: scale(1);
    box-shadow: 0 0 15px rgba($color-vibrant-pink, 0.7);
  }
  100% {
    transform: scale(1.1);
    box-shadow: 0 0 25px rgba($color-vibrant-pink, 1);
  }
}
</style>
