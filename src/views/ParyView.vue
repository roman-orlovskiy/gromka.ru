<template>
  <div class="pary">
    <h1>Пари НН</h1>
    <BaseInput placeholder="Введите текст" :value="inputValue" @handleInput="handleInput" />
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
  padding: 2rem;

  h1 {
    color: $color-primary;
    font-size: 3.2rem;
    margin-bottom: 2rem;
    font-weight: $font-weight-bold;
  }
}
</style>
