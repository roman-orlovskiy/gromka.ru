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

    <div class="home__video-block">
      <div class="home__video-container" @click="toggleVideo">
        <video
          ref="verticalVideo"
          class="home__vertical-video"
          src="/videos/demo.mp4"
          type="video/mp4"
          loop
        >
          Ваш браузер не поддерживает видео.
        </video>
        <button
          v-if="!isVideoPlaying"
          class="home__play-button"
        >
          {{ videoStarted ? '▶ Продолжить' : '▶ Запустить видео' }}
        </button>
        <button
          v-else
          class="home__pause-button"
        >
          ⏸ Пауза
        </button>
      </div>
    </div>

    <div class="home__description">
      Напишите нам и мы сделаем перформанс под конкретную площадку.
    </div>

    <a href="https://t.me/orlovskiy_rl" target="_blank" class="home__button">
      <ButtonComp> Написать </ButtonComp>
    </a>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'

const verticalVideo = ref(null)
const isVideoPlaying = ref(false)
const videoStarted = ref(false)

const toggleVideo = () => {
  if (verticalVideo.value) {
    if (isVideoPlaying.value) {
      verticalVideo.value.pause()
      isVideoPlaying.value = false
    } else {
      verticalVideo.value.play()
      isVideoPlaying.value = true
      videoStarted.value = true
    }
  }
}
</script>
<style lang="scss" scoped>
.home {
  flex: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 3rem 1rem;

  @include layout-aspect-mobile {
    padding: 2rem 1rem;
  }

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

  &__video-block {
    width: 100%;
    max-width: 42rem;
    margin: 3rem 0;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    border-radius: 2rem;
    box-shadow: 0 1rem 3rem rgba($color-black, 0.3);

    @include layout-aspect-mobile {
      padding: 1rem;
      margin: 2rem 0;
    }
  }

  &__video-container {
    width: 100%;
    position: relative;
    margin: 0 auto;
    background-color: $color-black;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 0.5rem 0.5rem rgba($color-black, 0.5);

    @include layout-aspect-mobile {
      max-width: 100%;
    }
  }

  &__vertical-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__play-button,
  &__pause-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 1.5rem 3rem;
    font-size: 1.8rem;
    font-weight: $font-weight-bold;
    color: $color-white;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0.5rem 1.5rem rgba($color-black, 0.3);
    pointer-events: none;
    white-space: nowrap;

    &:hover {
      transform: translate(-50%, -50%) scale(1.05);
      box-shadow: 0 0.7rem 2rem rgba($color-black, 0.4);
    }

    &:active {
      transform: translate(-50%, -50%) scale(0.98);
    }

    @include layout-aspect-mobile {
      padding: 1rem 2rem;
      font-size: 1.5rem;
    }
  }

  &__pause-button {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &__video-container:hover &__pause-button {
    opacity: 1;
  }
}
</style>
