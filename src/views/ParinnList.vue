<template>
  <div class="parinn">
    <div class="parinn__content">
      <h1 class="parinn__title">Список Parinn</h1>
      <div v-if="loading" class="parinn__loading">Загрузка...</div>
      <div v-else-if="error" class="parinn__error">{{ error }}</div>
      <div class="parinn__fullwidth" v-else>
        <ul class="parinn__list">
          <li v-for="item in parinnItems" :key="item.id" class="parinn__item">
            <div class="parinn__item-info">
              <div class="parinn__item-details">
                <div class="parinn__item-detail">
                  <span class="parinn__item-label">Сектор</span>
                  <span class="parinn__item-value">{{ item.sector || '-' }}</span>
                </div>
                <div class="parinn__item-detail">
                  <span class="parinn__item-label">Ряд</span>
                  <span class="parinn__item-value">{{ item.row || '-' }}</span>
                </div>
                <div class="parinn__item-detail">
                  <span class="parinn__item-label">Место</span>
                  <span class="parinn__item-value">{{ item.seat || '-' }}</span>
                </div>
              </div>
            </div>
            <button class="parinn__delete-button" @click="handleDelete(item.id)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </li>
        </ul>

        <BaseButton class="parinn__copy-button" @click="copyToClipboard">
          Копировать все
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getParinn, deleteParinn } from '@/services/api'
import BaseButton from '@/components/BaseButton.vue'

const parinnItems = ref([])
const loading = ref(true)
const error = ref(null)

const parseId = (id) => {
  const parts = id.split('__')
  return {
    sector: parts[0] || '-',
    row: parts[1] || '-',
    seat: parts[2] || '-'
  }
}

const formatItemText = (item) => {
  return `${item.sector} ${item.row} ${item.seat}`
}

const copyToClipboard = async () => {
  const text = [
    'Список победителей',
    'Сектор Ряд Место',
    ...parinnItems.value.map(formatItemText)
  ].join('\n')
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Ошибка при копировании:', err)
  }
}

const fetchParinn = async () => {
  try {
    loading.value = true
    const items = await getParinn()
    const shuffled = items.sort(() => Math.random() - 0.5)
    const selectedItems = shuffled.slice(0, 5)
    parinnItems.value = selectedItems.map(item => ({
      ...item,
      ...parseId(item.id)
    }))
  } catch (err) {
    error.value = 'Ошибка при загрузке данных'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await deleteParinn(id)
    parinnItems.value = parinnItems.value.filter(item => item.id !== id)
  } catch (err) {
    error.value = 'Ошибка при удалении'
    console.error(err)
  }
}

onMounted(async () => {
  await fetchParinn()
})
</script>

<style scoped lang="scss">
.parinn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1.5rem 2rem 6rem 2rem;
  min-height: 100%;

  &__fullwidth {
    width: 100%;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 1.5rem;
    width: 100%;
    max-width: 60rem;
  }

  &__title {
    font-size: 2.3rem;
    font-weight: $font-weight-bold;
    color: $color-primary;
    margin-bottom: 1rem;
    width: 100%;
    text-align: center;
    line-height: 1.2;
  }

  &__list {
    width: 100%;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem;
    margin: 0.5rem 0;
    background-color: #f5f5f5;
    border-radius: 0.4rem;
    font-size: 1.8rem;
    color: $color-gray-700;
  }

  &__item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__item-text {
    font-weight: $font-weight-bold;
    font-size: 1.8rem;
  }

  &__item-details {
    display: flex;
    gap: 2rem;
    font-size: 1.6rem;
    color: $color-gray-600;
    margin-bottom: 0.3rem;
  }

  &__item-detail {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 4.5rem;
  }

  &__item-label {
    font-size: 1.4rem;
    color: $color-gray-500;
    margin-bottom: 0.2rem;
  }

  &__item-value {
    font-weight: $font-weight-bold;
    font-size: 1.8rem;
  }

  &__delete-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.4rem;
    height: 2.4rem;
    padding: 0;
    margin-left: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    color: $color-gray-700;
    transition: color 0.2s ease;

    &:hover {
      color: $color-error;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__loading,
  &__error {
    font-size: 1.6rem;
    color: $color-gray-700;
  }

  &__error {
    color: $color-error;
  }

  &__copy-button {
    margin-top: 1.5rem;
    align-self: flex-start;
  }
}
</style>
