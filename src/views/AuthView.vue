<template>
  <div class="auth-view">
    <h1 class="auth-view__title">Авторизация</h1>
    <TelegramAuth v-if="!isUserLoaded" />

    <div v-if="isUserLoaded">
      <div>Добро пожаловать, {{ user.first_name }}</div>
      <div>
        <button @click="mainStore.logout">Выйти</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import TelegramAuth from '@/components/TelegramAuth.vue'
import { useMainStore } from '@/stores/main'
import { storeToRefs } from 'pinia'

const mainStore = useMainStore()
const { user, isUserLoaded } = storeToRefs(mainStore)
</script>

<style scoped lang="scss">
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  min-height: 100%;
  flex-direction: column;

  &__title {
    font-size: 5rem;
    font-weight: 700;
  }
}
</style>
