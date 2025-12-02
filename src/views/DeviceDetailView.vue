<template>
  <div class="device-detail-view">
    <div class="device-detail-view__header">
      <ButtonComp mod="outline" @click="goBack">← Назад</ButtonComp>
      <h1 class="device-detail-view__title">{{ currentDeviceId || 'Загрузка...' }}</h1>
    </div>

    <div v-if="isLoading" class="device-detail-view__loading">
      <LoadingSpinner />
    </div>

    <div v-else-if="error" class="device-detail-view__error">
      <div class="error-message">
        <div class="error-message__icon">⚠️</div>
        <div class="error-message__text">{{ error }}</div>
        <ButtonComp mod="outline" @click="loadDeviceData">Попробовать снова</ButtonComp>
      </div>
    </div>

    <div v-else-if="deviceData" class="device-detail-view__content">
      <!-- Основная информация -->
      <div class="device-detail-view__section">
        <h2 class="section-title">Основная информация</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-item__label">Device ID:</span>
            <span class="info-item__value">{{ deviceData.deviceId }}</span>
          </div>
          <div class="info-item">
            <span class="info-item__label">Изменений звука:</span>
            <span class="info-item__value">{{ deviceData.soundChangeCount || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="info-item__label">Последняя активность:</span>
            <span class="info-item__value">{{ formatDate(deviceData.timestamp) }}</span>
          </div>
          <div v-if="deviceInfo" class="info-item">
            <span class="info-item__label">Платформа:</span>
            <span class="info-item__value">{{ getPlatformName() }}</span>
          </div>
          <div v-if="deviceInfo" class="info-item">
            <span class="info-item__label">Устройство:</span>
            <span class="info-item__value">{{ getDeviceName() }}</span>
          </div>
          <div v-if="deviceInfo" class="info-item">
            <span class="info-item__label">Браузер:</span>
            <span class="info-item__value">{{ getBrowserName() }}</span>
          </div>
          <div v-if="flashlightSupport" class="info-item">
            <span class="info-item__label">Фонарик:</span>
            <span class="info-item__value" :class="flashlightSupport.isSupported ? 'info-item__value--success' : 'info-item__value--error'">
              {{ flashlightSupport.isSupported ? 'Поддерживается' : 'Не поддерживается' }}
            </span>
          </div>
          <div v-if="microphonePermission" class="info-item">
            <span class="info-item__label">Микрофон:</span>
            <span class="info-item__value" :class="microphonePermission.success ? 'info-item__value--success' : 'info-item__value--error'">
              {{ microphonePermission.success ? 'Разрешение получено' : 'Разрешение не получено' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Информация об устройстве -->
      <div v-if="deviceInfo" class="device-detail-view__section">
        <h2 class="section-title">Информация об устройстве</h2>
        <div class="info-grid">
          <div v-if="deviceInfo.deviceType" class="info-item">
            <span class="info-item__label">Тип устройства:</span>
            <span class="info-item__value">{{ deviceInfo.deviceType }}</span>
          </div>
          <div v-if="deviceInfo.screenWidth && deviceInfo.screenHeight" class="info-item">
            <span class="info-item__label">Разрешение экрана:</span>
            <span class="info-item__value">{{ deviceInfo.screenWidth }}x{{ deviceInfo.screenHeight }}</span>
          </div>
          <div v-if="deviceInfo.pixelRatio" class="info-item">
            <span class="info-item__label">Pixel Ratio:</span>
            <span class="info-item__value">{{ deviceInfo.pixelRatio }}</span>
          </div>
          <div v-if="deviceInfo.touchSupport" class="info-item">
            <span class="info-item__label">Touch Support:</span>
            <span class="info-item__value">{{ deviceInfo.touchSupport ? 'Да' : 'Нет' }}</span>
          </div>
          <div v-if="deviceInfo.hardwareConcurrency" class="info-item">
            <span class="info-item__label">CPU Cores:</span>
            <span class="info-item__value">{{ deviceInfo.hardwareConcurrency }}</span>
          </div>
          <div v-if="deviceInfo.memory && deviceInfo.memory !== 'unknown'" class="info-item">
            <span class="info-item__label">Память (GB):</span>
            <span class="info-item__value">{{ deviceInfo.memory }}</span>
          </div>
        </div>
      </div>

      <!-- Логи -->
      <div class="device-detail-view__section">
        <h2 class="section-title">Логи ({{ logs.length }})</h2>
        <div class="logs-container">
          <div
            v-for="(log, index) in logs"
            :key="index"
            class="log-item"
            :class="`log-item--${log.type}`"
          >
            <div class="log-item__header">
              <span class="log-item__type">{{ log.type }}</span>
              <span class="log-item__timestamp">{{ formatLogTimestamp(log.timestamp) }}</span>
            </div>
            <div class="log-item__data">
              <pre class="log-item__json">{{ formatLogData(log.data) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { getGromkaLogs, getDeviceLogs } from '@/services/api'

const props = defineProps({
  deviceId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['back'])

const currentDeviceId = computed(() => props.deviceId)
const deviceData = ref(null)
const deviceInfo = ref(null)
const flashlightSupport = ref(null)
const microphonePermission = ref(null)
const logs = ref([])
const isLoading = ref(false)
const error = ref(null)

const loadDeviceData = async () => {
  if (!currentDeviceId.value) {
    error.value = 'Device ID не указан'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    let deviceLogData = null

    // Пробуем получить данные устройства напрямую
    try {
      deviceLogData = await getDeviceLogs(currentDeviceId.value)
    } catch (e) {
      // Если не получилось, загружаем все логи и ищем нужное устройство
      const allLogs = await getGromkaLogs()
      const deviceLog = allLogs.find(log => log.id === currentDeviceId.value)
      
      if (deviceLog) {
        deviceLogData = typeof deviceLog.logs === 'string'
          ? JSON.parse(deviceLog.logs)
          : deviceLog.logs
      }
    }

    if (!deviceLogData) {
      error.value = 'Устройство не найдено'
      return
    }

    deviceData.value = deviceLogData

    // Извлекаем информацию об устройстве
    const deviceInfoLog = deviceLogData.logs?.find(log => log.type === 'device_info')
    if (deviceInfoLog) {
      deviceInfo.value = deviceInfoLog.data
    }

    // Извлекаем информацию о фонарике
    const flashlightLog = deviceLogData.logs?.find(log => log.type === 'flashlight_support')
    if (flashlightLog) {
      flashlightSupport.value = flashlightLog.data
    }

    // Извлекаем информацию о микрофоне
    const microphoneLog = deviceLogData.logs?.find(log => log.type === 'microphone_permission')
    if (microphoneLog) {
      microphonePermission.value = microphoneLog.data
    }

    // Все логи
    logs.value = deviceLogData.logs || []
  } catch (err) {
    console.error('Ошибка загрузки данных устройства:', err)
    error.value = 'Не удалось загрузить данные устройства. Попробуйте позже.'
  } finally {
    isLoading.value = false
  }
}

const getPlatformName = () => {
  if (!deviceInfo.value) return 'Неизвестно'
  
  if (deviceInfo.value.deviceType === 'mobile') {
    if (deviceInfo.value.osName === 'iOS') {
      return `iOS ${deviceInfo.value.osVersion || ''}`
    } else if (deviceInfo.value.osName === 'Android') {
      return `Android ${deviceInfo.value.osVersion || ''}`
    }
  }
  
  return deviceInfo.value.osName || 'Неизвестно'
}

const getDeviceName = () => {
  if (!deviceInfo.value) return 'Неизвестно'
  
  if (deviceInfo.value.deviceBrand && deviceInfo.value.deviceModel) {
    return `${deviceInfo.value.deviceBrand} ${deviceInfo.value.deviceModel}`
  }
  
  return deviceInfo.value.deviceModel || deviceInfo.value.deviceBrand || 'Неизвестно'
}

const getBrowserName = () => {
  if (!deviceInfo.value) return 'Неизвестно'
  
  if (deviceInfo.value.browserName) {
    return deviceInfo.value.browserVersion
      ? `${deviceInfo.value.browserName} ${deviceInfo.value.browserVersion}`
      : deviceInfo.value.browserName
  }
  
  return 'Неизвестно'
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Неизвестно'
  return new Date(timestamp).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatLogTimestamp = (timestamp) => {
  if (!timestamp) return 'Нет времени'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

const formatLogData = (data) => {
  if (!data) return ''
  try {
    return JSON.stringify(data, null, 2)
  } catch (e) {
    return String(data)
  }
}

const goBack = () => {
  emit('back')
}

watch(() => props.deviceId, () => {
  if (props.deviceId) {
    loadDeviceData()
  }
}, { immediate: true })

onMounted(() => {
  if (currentDeviceId.value) {
    loadDeviceData()
  } else {
    error.value = 'Device ID не указан'
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

.device-detail-view {
  min-height: 100vh;
  padding: 2rem;
  background: $color-gray-100;
}

.device-detail-view__header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
}

.device-detail-view__title {
  font-size: 3.6rem;
  font-weight: 700;
  color: $color-gray-700;
  word-break: break-all;
}

.device-detail-view__loading,
.device-detail-view__error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.error-message {
  text-align: center;
  max-width: 50rem;
  padding: 3rem;
}

.error-message__icon {
  font-size: 6rem;
  margin-bottom: 1rem;
}

.error-message__text {
  font-size: 1.8rem;
  color: $color-gray-700;
  margin-bottom: 2rem;
}

.device-detail-view__content {
  max-width: 120rem;
  margin: 0 auto;
}

.device-detail-view__section {
  background: $color-white;
  border-radius: 1.2rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 0.2rem 1rem rgba($color-black, 0.05);
}

.section-title {
  font-size: 2.4rem;
  font-weight: 700;
  color: $color-gray-700;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid $color-gray-200;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item__label {
  font-size: 1.4rem;
  color: $color-gray-600;
  font-weight: 500;
}

.info-item__value {
  font-size: 1.6rem;
  color: $color-gray-700;
  font-weight: 600;
  word-break: break-word;

  &--success {
    color: $color-success;
  }

  &--error {
    color: $color-error;
  }
}

.logs-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 80vh;
  overflow-y: auto;
}

.log-item {
  border: 1px solid $color-gray-200;
  border-radius: 0.8rem;
  padding: 1.5rem;
  background: $color-gray-100;

  &--device_info {
    border-left: 4px solid $color-primary;
  }

  &--flashlight_support,
  &--flashlight_change {
    border-left: 4px solid $color-vibrant-orange;
  }

  &--microphone_permission,
  &--audio_settings {
    border-left: 4px solid $color-success;
  }

  &--sound_change {
    border-left: 4px solid $color-pink-stylish;
  }

  &--camera_attempt {
    border-left: 4px solid $color-vibrant-blue;
  }
}

.log-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid $color-gray-300;
}

.log-item__type {
  font-size: 1.6rem;
  font-weight: 700;
  color: $color-gray-700;
  text-transform: uppercase;
}

.log-item__timestamp {
  font-size: 1.4rem;
  color: $color-gray-500;
  font-family: monospace;
}

.log-item__data {
  overflow-x: auto;
}

.log-item__json {
  font-size: 1.3rem;
  font-family: monospace;
  color: $color-gray-700;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

@include layout-mobile {
  .device-detail-view {
    padding: 1rem;
  }

  .device-detail-view__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .device-detail-view__title {
    font-size: 2.4rem;
  }

  .device-detail-view__section {
    padding: 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .logs-container {
    max-height: 60vh;
  }

  .log-item {
    padding: 1rem;
  }

  .log-item__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>

