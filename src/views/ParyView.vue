<template>
  <div class="pary">
    <div class="pary__content">
      <div class="pary__title">Поддержи Пари НН</div>
      <BaseInput placeholder="Введите текст" :value="inputValue" @handleInput="handleInput" />
    </div>
  </div>
</template>

<script setup>
import BaseInput from '@/components/BaseInput.vue'
import { ref } from 'vue'

const inputValue = ref('')

const handleInput = (event) => {
  inputValue.value = event.target.value
}
</script>

<style scoped lang="scss">
.pary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 3rem 2rem 6rem 2rem;
  min-height: 100%;

  &__title {
    font-size: 4.2rem;
    font-weight: $font-weight-bold;
    color: $color-primary;
    margin-bottom: 2rem;
    width: 100%;
    text-align: center;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    max-width: 120rem;
  }
}
</style>
