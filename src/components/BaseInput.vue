<template>
  <input
    type="text"
    class="input-item"
    :placeholder="placeholder"
    :value="value"
    @input="handleInput"
  />
</template>

<script setup>
defineProps({
  placeholder: {
    type: String,
    default: '',
  },
  value: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['handleInput'])

const handleInput = (event) => {
  emit('handleInput', event)
}
</script>

<style scoped lang="scss">
@import '@/assets/scss/variables.scss';

.input-item {
  width: 100%;
  border: 0.2rem solid $color-primary;
  border-radius: 1.5rem;
  font-size: 2.8rem;
  padding: 2.5rem 3.5rem;
  outline: none;
  color: $color-primary;
  font-family: $font-default;
  font-weight: $font-weight-medium;
  box-sizing: border-box;
  background-color: $color-white;

  &::placeholder {
    color: $color-primary;
    opacity: 0.5;
  }

  @include layout-mobile {
    border: 0.2rem solid $color-primary;
    border-radius: 1.5rem;
    font-size: 2.8rem;
    padding: 2.5rem 3.5rem;
  }
}
</style>
