<template>
  <div class="admin">
    <div class="admin__buttons">
      <ButtonComp @click="onBroadcastClick(40)">40%</ButtonComp>
      <ButtonComp @click="onBroadcastClick(70)">70%</ButtonComp>
      <ButtonComp @click="onBroadcastClick(100)">100%</ButtonComp>
    </div>

    <!-- Лоадер и слой успеха -->
    <Transition name="overlay">
      <div v-if="isLoading || showSuccess" class="admin__overlay" :class="{ 'admin__overlay--success': showSuccess }">
        <div class="admin__overlay-content">
          <div v-if="isLoading" class="admin__loader"></div>
          <div v-if="showSuccess" class="admin__success-icon">✓</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import { broadcast } from '@/services/api'

const isLoading = ref(false)
const showSuccess = ref(false)

const onBroadcastClick = async (percentage) => {
  isLoading.value = true
  showSuccess.value = false

  try {
    await broadcast({ type: 'light-on', percentage })

    // Показываем состояние успеха
    isLoading.value = false
    showSuccess.value = true

    // Автоматически скрываем через 1.5 секунды
    setTimeout(() => {
      showSuccess.value = false
    }, 1500)
  } catch (e) {
    console.error(e)
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

.admin {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  text-align: center;
  position: relative;
}

.admin__buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

// Оверлей с лоадером и состоянием успеха
.admin__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 1rem;

  &--success {
    background: rgba($color-success, 0.5);
  }
}

.admin__overlay-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Крутящийся лоадер
.admin__loader {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid $color-white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

// Галочка успеха
.admin__success-icon {
  font-size: 8rem;
  color: $color-white;
  font-weight: bold;
  animation: checkmark 0.6s ease-in-out;
}

// Анимация вращения лоадера
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Анимация появления галочки
@keyframes checkmark {
  0% {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(45deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(45deg);
    opacity: 1;
  }
}

// Анимация оверлея
.overlay-enter-active {
  transition: all 0.3s ease;
}

.overlay-leave-active {
  transition: all 0.3s ease;
}

.overlay-enter-from {
  opacity: 0;
}

.overlay-leave-to {
  opacity: 0;
}

// Адаптивность для мобильных устройств
@include layout-mobile {
  .admin__buttons {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    max-width: 200px;
  }

  .admin__loader {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }

  .admin__success-icon {
    font-size: 6rem;
  }
}
</style>


