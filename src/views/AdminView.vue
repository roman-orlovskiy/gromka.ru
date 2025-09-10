<template>
  <div class="admin">
    <div class="admin__buttons">
      <ButtonComp @click="onBroadcastClick(40)">40%</ButtonComp>
      <ButtonComp @click="onBroadcastClick(70)">70%</ButtonComp>
      <ButtonComp @click="onBroadcastClick(100)">100%</ButtonComp>
    </div>

    <!-- Плашка с последними данными -->
    <div class="admin__status-plate">
      <h3 class="status-plate__title">Результат запроса</h3>
      <div v-if="lastResult" class="status-plate__content">
        <div class="status-plate__header">
          <span class="status-plate__time">{{ formatTime(lastResult.timestamp) }}</span>

          <div class="status-plate__percentage-wrapper">
            <span class="status-plate__percentage">{{ lastResult.percentage }}%</span>
            &nbsp;
            <span class="status-plate__percentage-text">экранов включено</span>
          </div>
        </div>
        <div class="status-plate__details">
          <div class="status-detail">
            <span class="status-detail__label">Всего подключений:</span>
            <span class="status-detail__value">{{ lastResult.totalConnections }}</span>
          </div>
          <div class="status-detail">
            <span class="status-detail__label">Успешно отправлено:</span>
            <span class="status-detail__value status-detail__value--success">{{ lastResult.successful }}</span>
          </div>
          <div class="status-detail">
            <span class="status-detail__label">Ошибок:</span>
            <span class="status-detail__value status-detail__value--error">{{ lastResult.failed }}</span>
          </div>
        </div>
      </div>
      <div v-else class="status-plate__empty">
        <span>Нет данных</span>
      </div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import { broadcast } from '@/services/api'

const isLoading = ref(false)
const showSuccess = ref(false)
const lastResult = ref(null)
let wakeUpInterval = null

const onBroadcastClick = async (percentage) => {
  isLoading.value = true
  showSuccess.value = false

  try {
    const response = await broadcast({ type: 'light-on', percentage })

    // Обновляем последний результат
    lastResult.value = {
      timestamp: new Date(),
      percentage,
      totalConnections: response.totalConnections,
      successful: response.successful,
      failed: response.failed,
      messageSent: response.messageSent
    }

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

const sendWakeUp = async () => {
  try {
    const response = await broadcast({ type: 'wake-up' })
    console.log('Wake-up response:', response)
  } catch (e) {
    console.error('Wake-up error:', e)
  }
}

const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Запускаем wake-up интервал при монтировании компонента
onMounted(() => {
  // Отправляем wake-up сразу
  sendWakeUp()

  // Устанавливаем интервал на каждые 2 секунды
  wakeUpInterval = setInterval(sendWakeUp, 5000)
})

// Очищаем интервал при размонтировании компонента
onUnmounted(() => {
  if (wakeUpInterval) {
    clearInterval(wakeUpInterval)
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

.admin {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 100%;
  text-align: center;
  position: relative;
}

.admin__buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
}

// Плашка с последними данными
.admin__status-plate {
  max-width: 50rem;
  width: 100%;
  margin: 0 auto;
  background: $color-gray-100;
  border: 1px solid $color-gray-200;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-top: 2rem;
}

.status-plate__title {
  font-size: 2.2rem;
  font-weight: 600;
  color: $color-gray-700;
  margin-bottom: 1rem;
  text-align: center;
}

.status-plate__content {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.status-plate__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid $color-gray-300;
}

.status-plate__time {
  font-size: 1.9rem;
  color: $color-gray-500;
  font-weight: 500;
}

.status-plate__percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: $color-primary;
  background: rgba($color-primary, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
}

.status-plate__percentage-text {
  font-size: 1.5rem;
  font-weight: 500;
  color: $color-gray-500;
}

.status-plate__details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.5rem;
}

.status-detail__label {
  color: $color-gray-600;
  font-weight: 500;
}

.status-detail__value {
  font-weight: 600;

  &--success {
    color: $color-success;
  }

  &--error {
    color: $color-error;
  }
}

.status-plate__empty {
  text-align: center;
  color: $color-gray-500;
  font-style: italic;
  padding: 1rem 0;
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

  .admin__status-plate {
    max-width: 100%;
    margin: 1rem;
    padding: 1rem;
  }

  .status-detail {
    font-size: 1.5rem;
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


