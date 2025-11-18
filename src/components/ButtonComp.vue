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
    default: 'secondary',
    oneOf: [
      'secondary',
      'gradient-1',
      'gradient-2',
      'gradient-3',
      'gradient-4',
      'gradient-5',
      'gradient-6',
      'gradient-7',
      'spartak',
      'outline'
    ],
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

  &--mod-gradient-1 {
    background: linear-gradient(45deg, $color-vibrant-blue, $color-vibrant-purple);
    box-shadow: 0 0 10px 0 rgba($color-vibrant-blue, 0.5);
  }

  &--mod-gradient-2 {
    background: linear-gradient(45deg, $color-vibrant-purple, $color-vibrant-pink);
    box-shadow: 0 0 10px 0 rgba($color-vibrant-purple, 0.5);
  }

  &--mod-gradient-3 {
    background: linear-gradient(45deg, $color-vibrant-pink, $color-vibrant-orange);
    box-shadow: 0 0 10px 0 rgba($color-vibrant-pink, 0.5);
  }

  &--mod-gradient-4 {
    background: linear-gradient(45deg, $color-vibrant-orange, $color-vibrant-teal);
    box-shadow: 0 0 10px 0 rgba($color-vibrant-orange, 0.5);
  }

  &--mod-gradient-5 {
    background: linear-gradient(45deg, $color-vibrant-teal, $color-vibrant-mint);
    box-shadow: 0 0 10px 0 rgba($color-vibrant-teal, 0.5);
  }

  &--mod-gradient-6 {
    background: linear-gradient(45deg, $color-vibrant-mint, $color-vibrant-coral);
    box-shadow: 0 0 10px 0 rgba($color-vibrant-mint, 0.5);
  }

  &--mod-gradient-7 {
    background: linear-gradient(45deg, $color-vibrant-coral, $color-vibrant-lavender);
    box-shadow: 0 0 10px 0 rgba($color-vibrant-coral, 0.5);
  }

  &--mod-spartak {
    background-color: $color-spartak;
    box-shadow: 0 0 10px 0 rgba($color-spartak, 0.5);
  }

  &--mod-outline {
    background-color: $color-white;
    color: $color-black;
    border: 0.2rem solid $color-black;
    box-shadow: none;
  }

  &:hover {
    opacity: 0.7;
  }
}
</style>
