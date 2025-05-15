<template>
  <div class="parinn">
    <div class="parinn__content">
      <h1 class="parinn__title">Список Parinn</h1>
      <div v-if="loading" class="parinn__loading">Загрузка...</div>
      <div v-else-if="error" class="parinn__error">{{ error }}</div>
      <ul v-else class="parinn__list">
        <li v-for="item in parinnItems" :key="item.id" class="parinn__item">
          {{ formatId(item.id) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getParinn } from '@/services/api'

const parinnItems = ref([])
const loading = ref(true)
const error = ref(null)

const formatId = (id) => {
  return id.replace(/_/g, ' ')
}

const fetchParinn = async () => {
  try {
    loading.value = true
    parinnItems.value = await getParinn()
  } catch (err) {
    error.value = 'Ошибка при загрузке данных'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchParinn)
</script>

<style scoped lang="scss">
.parinn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1.5rem 2rem 6rem 2rem;
  min-height: 100%;

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
    padding: 1rem;
    margin: 0.5rem 0;
    background-color: #f5f5f5;
    border-radius: 0.4rem;
    font-size: 1.6rem;
    color: $color-gray-700;
  }

  &__loading,
  &__error {
    font-size: 1.6rem;
    color: $color-gray-700;
  }

  &__error {
    color: $color-error;
  }
}
</style>
