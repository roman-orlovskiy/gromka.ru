<template>
  <div class="demo">
    <div class="demo__editor">
      <div class="demo__editor-inputs">
        <InputComp />
        <InputComp />
      </div>
      <div class="demo__editor-item"></div>
    </div>
  </div>
</template>

<script setup>
import InputComp from '@/components/InputComp.vue'
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;

  &__editor {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  &__editor-item {
    width: 2rem;
    height: 3.5rem;
    background-color: $color-white;
    border-radius: 0.2rem;
    border: 1px solid $color-gray-300;
  }

  &__editor-inputs {
    display: flex;
    gap: 2rem;

    & > input {
      width: 10rem;
    }
  }
}
</style>
