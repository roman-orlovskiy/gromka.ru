<template>
  <div class="home">
    <h1 class="home__title">грОмка – платформа для перформансов</h1>
    <div class="home__description">Рисуйте динамические картины с помощью экранов телефонов.</div>
    <div class="home__card">
      <video class="home__video" autoplay loop muted src="/videos/gromka.mp4" type="video/mp4">
        Ваш браузер не поддерживает видео.
      </video>
    </div>

    <router-link to="/parinn" target="_blank" class="home__button">
      <ButtonComp mod="secondary"> Посмотреть демо </ButtonComp>
    </router-link>

    <div class="home__description">
      Напишите нам и мы сделаем перформанс под конкретную площадку.
    </div>

    <a href="https://t.me/orlovskiy_rl" target="_blank" class="home__button">
      <ButtonComp> Написать </ButtonComp>
    </a>
  </div>
</template>

<script setup>
import ButtonComp from '@/components/ButtonComp.vue'
</script>
<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;

  &__title {
    font-size: 3rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1rem;
    text-align: center;

    @include layout-aspect-mobile {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
  }

  &__description {
    font-size: 2rem;
    font-weight: $font-weight-medium;
    margin-bottom: 1rem;
    margin-top: 2rem;
    text-align: center;

    @include layout-aspect-mobile {
      font-size: 1.7rem;
      margin-bottom: 0.5rem;
    }
  }

  &__card {
    width: 90%;
    max-width: 64rem;
    height: 36rem;
    background-color: $color-white;
    border-radius: 1rem;
    border: 1px solid $color-secondary;
    box-shadow: 0 0 1rem 0 rgba($color-black, 0.5);
    overflow: hidden;
    margin-bottom: 3rem;

    @include layout-aspect-mobile {
      height: 20rem;
      margin-bottom: 1rem;
    }
  }

  &__video {
    width: 100%;
    height: 100%;
    border-radius: 1rem;
  }
}
</style>
