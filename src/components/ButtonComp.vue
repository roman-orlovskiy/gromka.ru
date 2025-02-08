<template>
  <button class="button">
    Нажми меня
  </button>
</template>

<script setup></script>

<style lang="scss" scoped>
.button {
  font-size: 1.5rem;
  padding: 1rem 2rem;
  background-color: $color-secondary;
  color: $color-white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: $color-primary-dark;
  }
}
</style>
