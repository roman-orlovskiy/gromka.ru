<template>
  <div class="flashlight">
    <div class="flashlight__container">
      <h1 class="flashlight__title">Фонарик камеры</h1>

      <div class="flashlight__controls">
        <ButtonComp
          :mod="isFlashlightOn ? 'gradient-2' : 'gradient-1'"
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
.flashlight {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

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

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 300px;
  }
}
</style>
