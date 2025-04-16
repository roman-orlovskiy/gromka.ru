<template>
  <button class="button-item" @click="handleClick">
    <slot></slot>
  </button>
</template>

<script setup>
const emit = defineEmits(['click'])

const handleClick = (event) => {
  emit('click', event)
}
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
    font-size: 1.7rem;
    padding: 1rem 2rem;
    border-radius: 1rem;
  }

  &:hover {
    opacity: 0.9;
  }

  @include layout-mobile {
    border-radius: 1.5rem;
    font-size: 2.8rem;
  }
}
</style>
