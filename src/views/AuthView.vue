<template>
  <div class="auth-view">
    <h1 class="auth-view__title">Авторизация</h1>
    <TelegramAuth />
  </div>
</template>

<script setup>
import TelegramAuth from '@/components/TelegramAuth.vue'
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
