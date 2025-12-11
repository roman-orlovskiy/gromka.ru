<template>
  <div class="devices-view">
    <DeviceDetailView v-if="selectedDeviceId" :device-id="selectedDeviceId" @back="goBackToList" />

    <template v-else>
    <div class="devices-view__header">
      <h1 class="devices-view__title">Устройства</h1>
      <div class="devices-view__stats">
        <div class="stat-card">
          <div class="stat-card__value">{{ devicesLast5Days.length }}</div>
          <div class="stat-card__label">Всего устройств (5 дней)</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{{ withFlashlightCount }}</div>
          <div class="stat-card__label">С фонариком (5 дней)</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{{ withScreenCount }}</div>
          <div class="stat-card__label">С экраном (5 дней)</div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="devices-view__loading">
      <LoadingSpinner />
    </div>

    <div v-else-if="error" class="devices-view__error">
      <div class="error-message">
        <div class="error-message__icon">⚠️</div>
        <div class="error-message__text">{{ error }}</div>
        <ButtonComp mod="outline" @click="loadDevices">Попробовать снова</ButtonComp>
      </div>
    </div>

    <div v-else-if="devicesLast5Days.length === 0" class="devices-view__empty">
      <div class="empty-state">
        <div class="empty-state__icon">📱</div>
        <div class="empty-state__text">Нет устройств за последние 5 дней</div>
      </div>
    </div>

    <div v-else class="devices-view__content">
      <!-- Фильтры -->
      <div class="devices-view__filters">
        <InputComp
          v-model="searchQuery"
          placeholder="Поиск по deviceId..."
          class="devices-view__search"
        />
        <SelectComp
          v-model="filterPlatform"
          :options="platformOptions"
          placeholder="Все платформы"
          class="devices-view__filter"
        />
        <SelectComp
          v-model="filterFlashlight"
          :options="flashlightOptions"
          placeholder="Фонарик"
          class="devices-view__filter"
        />
      </div>

      <!-- Список устройств -->
      <div class="devices-view__list">
        <div
          v-for="(group, groupIndex) in groupedDevices"
          :key="groupIndex"
          class="device-group"
        >
          <div class="device-group__header">
            <span class="device-group__time">{{ formatGroupTime(group.timeRange.start) }}</span>
            <span class="device-group__count">{{ group.devices.length }} {{ group.devices.length === 1 ? 'устройство' : group.devices.length < 5 ? 'устройства' : 'устройств' }}</span>
          </div>
          <div class="device-group__items">
            <div
              v-for="device in group.devices"
              :key="device.id"
              class="device-card"
              @click="openDeviceDetail(device.id)"
            >
              <div class="device-card__header">
                <div class="device-card__id">{{ device.id }}</div>
                <div class="device-card__badges">
                  <span
                    v-if="device.hasFlashlight"
                    class="device-badge device-badge--flashlight"
                  >
                    <FlashlightIcon />
                  </span>
                  <span
                    v-if="device.hasScreen"
                    class="device-badge device-badge--screen"
                  >
                    <ScreenIcon />
                  </span>
                  <span
                    v-if="device.hasAudio"
                    class="device-badge device-badge--audio"
                  >
                    <MicrophoneIcon />
                  </span>
                </div>
              </div>

              <div class="device-card__info">
                <div class="device-info-item">
                  <span class="device-info-item__label">Платформа:</span>
                  <span class="device-info-item__value">{{ device.platform || 'Неизвестно' }}</span>
                </div>
                <div class="device-info-item">
                  <span class="device-info-item__label">Устройство:</span>
                  <span class="device-info-item__value">{{ device.deviceInfo || 'Неизвестно' }}</span>
                </div>
                <div class="device-info-item">
                  <span class="device-info-item__label">Браузер:</span>
                  <span class="device-info-item__value">{{ device.browser || 'Неизвестно' }}</span>
                </div>
                <div class="device-info-item">
                  <span class="device-info-item__label">Изменений звука:</span>
                  <span class="device-info-item__value">{{ device.soundChangeCount || 0 }}</span>
                </div>
                <div class="device-info-item">
                  <span class="device-info-item__label">Последняя активность:</span>
                  <span class="device-info-item__value">{{ formatDate(device.lastActivity) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ButtonComp from '@/components/ButtonComp.vue'
import InputComp from '@/components/InputComp.vue'
import SelectComp from '@/components/SelectComp.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import DeviceDetailView from '@/views/DeviceDetailView.vue'
import FlashlightIcon from '@/components/icons/FlashlightIcon.vue'
import MicrophoneIcon from '@/components/icons/MicrophoneIcon.vue'
import ScreenIcon from '@/components/icons/ScreenIcon.vue'
import { getGromkaLogs } from '@/services/api'

const route = useRoute()
const router = useRouter()

const selectedDeviceId = computed(() => route.query.deviceId)

const devices = ref([])
const isLoading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const filterPlatform = ref('')
const filterFlashlight = ref('')

const platformOptions = computed(() => {
  const platforms = new Set()
  devices.value.forEach(device => {
    if (device.platform) {
      platforms.add(device.platform)
    }
  })
  return [
    { value: '', label: 'Все платформы' },
    ...Array.from(platforms).map(p => ({ value: p, label: p }))
  ]
})

const flashlightOptions = [
  { value: '', label: 'Все' },
  { value: 'yes', label: 'С фонариком' },
  { value: 'no', label: 'Без фонарика' }
]

const withFlashlightCount = computed(() => {
  return devicesLast5Days.value.filter(d => d.hasFlashlight).length
})

const withScreenCount = computed(() => {
  return devicesLast5Days.value.filter(d => d.hasScreen).length
})

// Устройства за последние 5 дней
const devicesLast5Days = computed(() => {
  const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000)
  return devices.value.filter(device => {
    return device.lastActivity >= fiveDaysAgo
  })
})

const filteredDevices = computed(() => {
  // Начинаем с отфильтрованных по дате (последние 5 дней)
  let filtered = devicesLast5Days.value

  // Поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(device =>
      device.id.toLowerCase().includes(query)
    )
  }

  // Фильтр по платформе
  if (filterPlatform.value) {
    filtered = filtered.filter(device =>
      device.platform === filterPlatform.value
    )
  }

  // Фильтр по фонарику
  if (filterFlashlight.value === 'yes') {
    filtered = filtered.filter(device => device.hasFlashlight)
  } else if (filterFlashlight.value === 'no') {
    filtered = filtered.filter(device => !device.hasFlashlight)
  }

  // Сортировка по последней активности
  return filtered.sort((a, b) => b.lastActivity - a.lastActivity)
})

// Группировка устройств по 30-минутным интервалам (полчаса)
const groupedDevices = computed(() => {
  if (!filteredDevices.value || filteredDevices.value.length === 0) return []

  const groups = []
  const THIRTY_MINUTES = 30 * 60 * 1000 // 30 минут в миллисекундах

  filteredDevices.value.forEach(device => {
    const deviceTime = device.lastActivity || 0

    // Находим или создаем группу для этого устройства
    let group = groups.find(g => {
      const timeDiff = deviceTime - g.timeRange.start
      return timeDiff >= 0 && timeDiff < THIRTY_MINUTES
    })

    if (!group) {
      // Создаем новую группу, округляя время начала до 30 минут
      const groupStart = Math.floor(deviceTime / THIRTY_MINUTES) * THIRTY_MINUTES
      group = {
        timeRange: {
          start: groupStart,
          end: groupStart + THIRTY_MINUTES
        },
        devices: []
      }
      groups.push(group)
    }

    group.devices.push(device)
  })

  return groups
})

const formatGroupTime = (timestamp) => {
  if (!timestamp) return 'Неизвестно'
  const date = new Date(timestamp)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const parseDeviceData = (logEntry) => {
  try {
    const logData = typeof logEntry.logs === 'string'
      ? JSON.parse(logEntry.logs)
      : logEntry.logs

    const deviceInfoLog = logData.logs?.find(log => log.type === 'device_info')
    const deviceInfo = deviceInfoLog?.data || {}

    const flashlightSupportLog = logData.logs?.find(log => log.type === 'flashlight_support')
    const flashlightChangeLogs = logData.logs?.filter(log => log.type === 'flashlight_change') || []
    const torchEnabledLogs = logData.logs?.filter(log =>
      log.type === 'camera_attempt' &&
      log.data?.stage === 'torch_enabled' &&
      log.data?.success === true
    ) || []

    // Фонарик есть, если:
    // 1. Есть лог поддержки фонарика с isSupported: true ИЛИ
    // 2. Был хотя бы один успешный лог включения фонарика (torch_enabled с success: true) ИЛИ
    // 3. Был хотя бы один лог включения фонарика (flashlight_change с isOn: true и method не null)
    const hasFlashlight = flashlightSupportLog?.data?.isSupported === true ||
      torchEnabledLogs.length > 0 ||
      flashlightChangeLogs.some(log => log.data?.isOn === true && log.data?.method !== null)

    // Экран есть, если есть хотя бы один лог изменения режима экрана
    const screenModeChangeLogs = logData.logs?.filter(log => log.type === 'screen_mode_change') || []
    const hasScreen = screenModeChangeLogs.length > 0

    const microphoneLog = logData.logs?.find(log => log.type === 'microphone_permission')
    const audioSettingsLog = logData.logs?.find(log => log.type === 'audio_settings')
    const soundChangeCount = logData.soundChangeCount || 0

    // Микрофон есть, если:
    // 1. Есть успешный лог разрешения на микрофон ИЛИ
    // 2. Есть настройки аудио (значит микрофон был настроен) ИЛИ
    // 3. Были изменения звука (soundChangeCount > 0) - это значит микрофон точно работал
    //    для обработки ультразвуковых сигналов и переключения фонарика
    const hasAudio = microphoneLog?.data?.success === true ||
      audioSettingsLog !== undefined ||
      soundChangeCount > 0

    const platformInfoLog = logData.logs?.find(log => log.type === 'platform_info')
    const platformInfo = platformInfoLog?.data || {}

    // Определяем платформу
    let platform = 'Неизвестно'
    if (platformInfo.isIOS) {
      platform = `iOS ${platformInfo.iosVersion || ''}`
    } else if (platformInfo.isAndroid) {
      platform = 'Android'
    } else if (deviceInfo.deviceType === 'desktop') {
      platform = deviceInfo.osName || 'Desktop'
    }

    // Информация об устройстве
    let deviceInfoStr = 'Неизвестно'
    if (deviceInfo.deviceBrand && deviceInfo.deviceModel) {
      deviceInfoStr = `${deviceInfo.deviceBrand} ${deviceInfo.deviceModel}`
    } else if (deviceInfo.deviceModel) {
      deviceInfoStr = deviceInfo.deviceModel
    }

    // Браузер
    let browser = 'Неизвестно'
    if (deviceInfo.browserName) {
      browser = deviceInfo.browserVersion
        ? `${deviceInfo.browserName} ${deviceInfo.browserVersion}`
        : deviceInfo.browserName
    }

    // Последняя активность
    const lastActivity = logData.timestamp || deviceInfoLog?.timestamp || 0

    // Активность: устройство считается активным, если оно участвовало в перформансе
    // soundChangeCount - это количество раз, когда устройство получило звуковой сигнал
    // и отреагировало на него (включило/выключило фонарик)
    // Если звуковые сигналы обрабатывались, значит устройство активно участвовало в перформансе
    const isActive = (logData.soundChangeCount || 0) > 0

    return {
      id: logEntry.id,
      platform,
      deviceInfo: deviceInfoStr,
      browser,
      hasFlashlight,
      hasScreen,
      hasAudio,
      soundChangeCount: logData.soundChangeCount || 0,
      lastActivity,
      isActive,
      rawData: logData
    }
  } catch (e) {
    console.error('Ошибка парсинга данных устройства:', e)
    return {
      id: logEntry.id,
      platform: 'Ошибка',
      deviceInfo: 'Ошибка парсинга',
      browser: 'Ошибка',
      hasFlashlight: false,
      hasScreen: false,
      hasAudio: false,
      soundChangeCount: 0,
      lastActivity: 0,
      isActive: false,
      rawData: null
    }
  }
}

const loadDevices = async () => {
  isLoading.value = true
  error.value = null

  try {
    const logs = await getGromkaLogs()
    devices.value = logs.map(parseDeviceData)
  } catch (err) {
    console.error('Ошибка загрузки устройств:', err)
    error.value = 'Не удалось загрузить устройства. Попробуйте позже.'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Неизвестно'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    return 'Только что'
  } else if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'} назад`
  } else if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const openDeviceDetail = (deviceId) => {
  router.push({
    path: '/devices',
    query: { deviceId }
  })
}

const goBackToList = () => {
  router.push({
    path: '/devices',
    query: {}
  })
}

onMounted(() => {
  loadDevices()
})
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

.devices-view {
  min-height: 100vh;
  padding: 2rem;
  background: $color-gray-100;
}

.devices-view__header {
  margin-bottom: 3rem;
}

.devices-view__title {
  font-size: 3.6rem;
  font-weight: 700;
  color: $color-gray-700;
  margin-bottom: 2rem;
}

.devices-view__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: $color-white;
  border-radius: 1.2rem;
  padding: 2rem;
  box-shadow: 0 0.2rem 1rem rgba($color-black, 0.05);
}

.stat-card__value {
  font-size: 3.6rem;
  font-weight: 700;
  color: $color-primary;
  margin-bottom: 0.5rem;
}

.stat-card__label {
  font-size: 1.6rem;
  color: $color-gray-600;
}

.devices-view__loading,
.devices-view__error,
.devices-view__empty {
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

.empty-state {
  text-align: center;
}

.empty-state__icon {
  font-size: 8rem;
  margin-bottom: 1rem;
}

.empty-state__text {
  font-size: 2.4rem;
  color: $color-gray-600;
}

.devices-view__filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.devices-view__search {
  flex: 1;
  min-width: 200px;
}

.devices-view__filter {
  min-width: 180px;
}

.devices-view__list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.device-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.device-group__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: $color-gray-200;
  border-radius: 0.8rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.device-group__time {
  font-size: 1.6rem;
  font-weight: 700;
  color: $color-gray-700;
}

.device-group__count {
  font-size: 1.4rem;
  color: $color-gray-600;
  font-weight: 500;
}

.device-group__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.device-card {
  background: $color-white;
  border-radius: 1.2rem;
  padding: 2rem;
  box-shadow: 0 0.2rem 1rem rgba($color-black, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-0.4rem);
    box-shadow: 0 0.4rem 2rem rgba($color-black, 0.1);
  }
}

.device-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid $color-gray-200;
}

.device-card__id {
  font-size: 1.8rem;
  font-weight: 700;
  color: $color-gray-700;
  word-break: break-all;
}

.device-card__badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.device-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.8rem;
  border-radius: 0.6rem;
  gap: 0.4rem;

  svg {
    width: 1.6rem;
    height: 1.6rem;
    flex-shrink: 0;
  }

  &--flashlight {
    background: rgba($color-vibrant-orange, 0.15);
    color: $color-vibrant-orange;
  }

  &--audio {
    background: rgba($color-vibrant-purple, 0.15);
    color: $color-vibrant-purple;
  }

  &--screen {
    background: rgba($color-primary, 0.15);
    color: $color-primary;
  }
}

.device-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.device-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.4rem;
}

.device-info-item__label {
  color: $color-gray-600;
  font-weight: 500;
}

.device-info-item__value {
  color: $color-gray-700;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

@include layout-mobile {
  .devices-view {
    padding: 1rem;
  }

  .devices-view__title {
    font-size: 2.4rem;
  }

  .devices-view__stats {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .stat-card__value {
    font-size: 2.8rem;
  }

  .devices-view__filters {
    flex-direction: column;
  }

  .devices-view__search,
  .devices-view__filter {
    width: 100%;
  }

  .device-group__items {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .device-card {
    padding: 1.5rem;
  }

  .device-card__header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

