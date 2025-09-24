<template>
  <div class="flashlight">
    <div class="flashlight__container">
      <h1 class="flashlight__title">Фонарик камеры</h1>

      <div class="flashlight__status" :class="{ 'flashlight__status--active': isFlashlightOn }">
        <div class="flashlight__status-indicator"></div>
        <span class="flashlight__status-text">
          {{ isFlashlightOn ? 'Фонарик включен' : 'Фонарик выключен' }}
        </span>
      </div>

      <div class="flashlight__controls">
        <ButtonComp
          :mod="isFlashlightOn ? 'gradient-2' : 'gradient-4'"
          @click="toggleFlashlight"
        >
          {{ isFlashlightOn ? 'Остановить' : 'Начать' }}
        </ButtonComp>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'

// Состояние фонарика
const isFlashlightOn = ref(false)

const toggleFlashlight = () => {
  console.log('Кнопка фонарика нажата')
  // Пока просто переключаем состояние
  isFlashlightOn.value = !isFlashlightOn.value
  console.log('Фонарик:', isFlashlightOn.value ? 'включен' : 'выключен')
}
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
}
</style>
