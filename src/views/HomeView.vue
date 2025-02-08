<template>
  <div class="home">
    <div class="home__card">
      <video
        class="home__video"
        autoplay
        loop
        :muted="!isSoundEnabled"
        src="/video/gromka.mp4"
        type="video/mp4"
      >
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

  &__card {
    width: 32rem;
    height: 18rem;
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
