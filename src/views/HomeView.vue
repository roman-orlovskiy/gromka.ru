<template>
  <div class="home">
    <h1 class="home__title">Игровые виджеты для вашего сайта</h1>
    <p class="home__description">
      Легко интегрируйте игровые виджеты на свой сайт.<br>
      Увеличьте вовлеченность пользователей с помощью интерактивных игр.<br>
      Простая настройка и быстрый запуск.
    </p>
    <div class="home__buttons">
      <BaseButton class="home__button">Играть</BaseButton>
      <BaseButton class="home__button">Каталог виджетов</BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/BaseButton.vue'
</script>

<style lang="scss">
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  color: $color-white;

  &__title {
    margin-bottom: 2rem;
    text-align: center;
    font-size: 4.4rem;
  }

  &__description {
    text-align: center;
    font-size: 2.2rem;
    line-height: 1.6;
    margin-bottom: 3rem;
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__button {
    min-width: 200px;
  }
}
</style>
