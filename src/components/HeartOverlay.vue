<template>
  <div class="heart-overlay">
    <div class="heart-overlay__backdrop" />

    <div class="heart-overlay__content">
      <div class="heart-overlay__heart">
        <svg
          class="heart-overlay__svg"
          viewBox="0 0 32 30"
          shape-rendering="crispEdges"
          role="presentation"
          aria-hidden="true"
        >
          <path
            class="heart-overlay__shape"
            d="M16 30 L2 16 L2 8 L8 8 L8 2 L12 2 L12 8 L20 8 L20 2 L24 2 L24 8 L30 8 L30 16 Z"
          />
        </svg>

        <div class="heart-overlay__message" v-html="messageHtml" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  messageHtml: {
    type: String,
    required: true
  }
})
</script>

<style scoped lang="scss">
@import '@/assets/scss/variables.scss';

.heart-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  pointer-events: none;

  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgba($color-black, 0.25);
    backdrop-filter: blur(2px);
  }

  &__content {
    position: relative;
    width: 90vw;
    max-width: 90vw;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1;
  }

  &__heart {
    position: relative;
    width: 100%;
    max-width: 90vw;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: heart-pulse 1.8s ease-in-out infinite;
  }

  &__svg {
    width: 100%;
    height: auto;
  }

  &__shape {
    fill: $color-white;
    stroke: $color-show-red;
    stroke-width: 2;
  }

  &__message {
    position: absolute;
    text-align: center;
    font-weight: 700;
    font-size: clamp(2.2rem, 4vw, 4rem);
    color: $color-black;
    line-height: 1.2;
    text-shadow: 0 0.2rem 1rem rgba($color-black, 0.15);
    pointer-events: none;
  }
}

@keyframes heart-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>

