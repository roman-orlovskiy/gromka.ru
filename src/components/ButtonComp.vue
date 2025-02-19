<template>
  <button :class="buttonClass">
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mod: {
    type: String,
    default: '',
    oneOf: ['secondary'],
  },
})

const buttonClass = computed(() => {
  return `button ${props.mod ? `button--mod-${props.mod}` : ''}`
})
</script>

<style lang="scss" scoped>
.button {
  font-size: 3.5rem;
  padding: 1rem 2rem;
  background-color: $color-primary;
  color: $color-white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: opacity 0.3s;
  box-shadow: 0 0 10px 0 rgba($color-primary, 0.5);

  &--mod-secondary {
    background-color: $color-secondary;
    box-shadow: 0 0 10px 0 rgba($color-secondary, 0.5);
  }

  &:hover {
    opacity: 0.7;
  }
}
</style>
