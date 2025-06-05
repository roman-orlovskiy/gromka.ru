<template>
  <div class="home">
    <h1 class="home__title">Игровые виджеты для вашего сайта</h1>
    <ul class="home__description">
      <li>Легко интегрируйте игровые виджеты на свой сайт</li>
      <li>Увеличьте вовлеченность пользователей с помощью интерактивных игр</li>
      <li>Простая настройка и быстрый запуск</li>
    </ul>
    <div class="home__buttons">
      <ButtonComp class="home__button" mod="gradient-3">Играть</ButtonComp>
      <ButtonComp class="home__button" mod="gradient-5">Каталог виджетов</ButtonComp>
    </div>
  </div>
</template>

<script setup>
import ButtonComp from '@/components/ButtonComp.vue'
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
    text-align: left;
    font-size: 2.2rem;
    line-height: 1.6;
    margin-bottom: 3rem;
    padding-left: 10rem;
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
  }

  &__button {
    min-width: 200px;
  }
}
</style>
