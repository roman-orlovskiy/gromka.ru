<template>
  <div class="home">
    <h1 class="home__title">Громка – платформа для перформансов</h1>
    <div class="home__description">Рисуйте динамические картины с помощью экранов телефонов.</div>
    <div class="home__card">
      <video class="home__video" autoplay loop muted src="/video/gromka.mp4" type="video/mp4">
        Ваш браузер не поддерживает видео.
      </video>
    </div>
  </div>
</template>

<script setup></script>
<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  &__title {
    font-size: 3rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1rem;
    text-align: center;
  }

  &__description {
    font-size: 1.5rem;
    font-weight: $font-weight-medium;
    margin-bottom: 2rem;
    text-align: center;
  }

  &__card {
    width: 64rem;
    height: 36rem;
    background-color: $color-white;
    border-radius: 1rem;
    border: 1px solid $color-secondary;
    box-shadow: 0 0 1rem 0 rgba($color-black, 0.5);
    overflow: hidden;
  }

  &__video {
    width: 100%;
    height: 100%;
    border-radius: 1rem;
  }
}
</style>
