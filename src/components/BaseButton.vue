<template>
  <button
    class="button-item"
    :class="buttonClass"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const emit = defineEmits(['click'])

const props = defineProps({
  mode: {
    type: String,
    default: 'default',
    oneOf: ['default', 'big'],
  },
})

const handleClick = (event) => {
  emit('click', event)
}

const buttonClass = computed(() => ({
  [`button-item--mode-${props.mode}`]: props.mode,
}))
</script>

<style scoped lang="scss">
.button-item {
  width: 100%;
  border: none;
  border-radius: 1.5rem;
  font-size: 2.8rem;
  padding: 1rem 3rem;
  outline: none;
  color: $color-white;
  font-family: $font-default;
  font-weight: $font-weight-medium;
  box-sizing: border-box;
  background-color: $color-primary;
  cursor: pointer;
  transition: opacity 0.2s ease;

  @include layout-aspect-mobile {
    font-size: 1.8rem;
    padding: 0.7rem 1.4rem;
    border-radius: 0.7rem;
  }

  &--mode-big {
    font-size: 4.2rem;
    padding: 2.5rem 4rem;

    @include layout-aspect-mobile {
      font-size: 2.7rem;
      padding: 1.3rem 2.6rem;
    }
  }

  &:hover {
    opacity: 0.9;
  }
}
</style>
