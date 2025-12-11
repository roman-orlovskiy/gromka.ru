<template>
  <div class="heart-overlay">
    <div class="heart-overlay__backdrop" />

    <div class="heart-overlay__content">
      <div class="heart-overlay__heart">
        <svg
          class="heart-overlay__svg"
          viewBox="0 0 60 54"
          shape-rendering="crispEdges"
          role="presentation"
          aria-hidden="true"
        >
          <!-- Белая заливка -->
          <g class="heart-overlay__fill">
            <rect x="6" y="12" width="6" height="6" />
            <rect x="12" y="12" width="6" height="6" />
            <rect x="18" y="12" width="6" height="6" />
            <rect x="6" y="18" width="6" height="6" />
            <rect x="12" y="18" width="6" height="6" />
            <rect x="18" y="18" width="6" height="6" />
            <rect x="24" y="18" width="6" height="6" />
            <rect x="30" y="18" width="6" height="6" />
            <rect x="36" y="12" width="6" height="6" />
            <rect x="42" y="12" width="6" height="6" />
            <rect x="48" y="12" width="6" height="6" />
            <rect x="36" y="18" width="6" height="6" />
            <rect x="42" y="18" width="6" height="6" />
            <rect x="48" y="18" width="6" height="6" />
            <rect x="6" y="24" width="6" height="6" />
            <rect x="12" y="24" width="6" height="6" />
            <rect x="18" y="24" width="6" height="6" />
            <rect x="24" y="24" width="6" height="6" />
            <rect x="30" y="24" width="6" height="6" />
            <rect x="36" y="24" width="6" height="6" />
            <rect x="42" y="24" width="6" height="6" />
            <rect x="48" y="24" width="6" height="6" />
            <rect x="12" y="30" width="6" height="6" />
            <rect x="18" y="30" width="6" height="6" />
            <rect x="24" y="30" width="6" height="6" />
            <rect x="30" y="30" width="6" height="6" />
            <rect x="36" y="30" width="6" height="6" />
            <rect x="42" y="30" width="6" height="6" />
            <rect x="18" y="36" width="6" height="6" />
            <rect x="24" y="36" width="6" height="6" />
            <rect x="30" y="36" width="6" height="6" />
            <rect x="36" y="36" width="6" height="6" />
            <rect x="24" y="42" width="6" height="6" />
            <rect x="30" y="42" width="6" height="6" />
          </g>

          <!-- Красный контур -->
          <g class="heart-overlay__border">
            <!-- Верхняя часть -->
            <rect x="12" y="6" width="6" height="6" />
            <rect x="18" y="6" width="6" height="6" />
            <rect x="6" y="6" width="6" height="6" />
            <rect x="36" y="6" width="6" height="6" />
            <rect x="42" y="6" width="6" height="6" />
            <rect x="48" y="6" width="6" height="6" />

            <!-- Боковые стороны -->
            <rect x="0" y="12" width="6" height="6" />
            <rect x="0" y="18" width="6" height="6" />
            <rect x="0" y="24" width="6" height="6" />
            <rect x="24" y="12" width="6" height="6" />
            <rect x="30" y="12" width="6" height="6" />
            <rect x="54" y="12" width="6" height="6" />
            <rect x="54" y="18" width="6" height="6" />
            <rect x="54" y="24" width="6" height="6" />

            <!-- Нижняя часть -->
            <rect x="6" y="30" width="6" height="6" />
            <rect x="12" y="36" width="6" height="6" />
            <rect x="18" y="42" width="6" height="6" />
            <rect x="24" y="48" width="6" height="6" />
            <rect x="30" y="48" width="6" height="6" />
            <rect x="36" y="42" width="6" height="6" />
            <rect x="42" y="36" width="6" height="6" />
            <rect x="48" y="30" width="6" height="6" />
          </g>
        </svg>

        <div class="heart-overlay__message" v-html="messageHtml" />
      </div>

      <div v-if="showStartButton && isStartButtonVisible" class="heart-overlay__button">
        <ButtonComp mod="red" @click="handleStartClick">Нажмите для старта</ButtonComp>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'

defineProps({
  messageHtml: {
    type: String,
    required: true
  },
  showStartButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['start'])

const isStartButtonVisible = ref(true)

const handleStartClick = () => {
  isStartButtonVisible.value = false
  emit('start')
}
</script>

<style scoped lang="scss">
@import '@/assets/scss/variables.scss';

.heart-overlay {
  position: absolute;
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
    background: rgba($color-white, 0.6);
    backdrop-filter: blur(2px);
  }

  &__content {
    position: relative;
    width: 90vw;
    max-width: 90vw;
    display: flex;
    flex-direction: column;
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

  &__fill rect {
    fill: $color-white;
  }

  &__border rect {
    fill: $color-show-red;
  }

  &__message {
    position: absolute;
    text-align: center;
    font-weight: 700;
    font-size: clamp(1.98rem, 3.6vw, 3.6rem);
    color: $color-black;
    line-height: 1.2;
    text-shadow: 0 0.2rem 1rem rgba($color-black, 0.15);
    pointer-events: none;
    padding-top: 0.9rem;
  }

  &__button {
    margin-top: 2rem;
    pointer-events: auto;
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

