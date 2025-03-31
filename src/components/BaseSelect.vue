<template>
  <select class="select-item" :value="value" @change="handleChange">
    <option value="" disabled selected>{{ placeholder }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
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
  options: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['handleChange'])

const handleChange = (event) => {
  emit('handleChange', event)
}
</script>

<style scoped lang="scss">
.select-item {
  width: 100%;
  border: 0.2rem solid $color-primary;
  border-radius: 1.5rem;
  font-size: 2.8rem;
  padding: 1rem 3rem;
  outline: none;
  color: $color-primary;
  font-family: $font-default;
  font-weight: $font-weight-medium;
  box-sizing: border-box;
  background-color: $color-white;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 2rem;

  option {
    color: $color-primary;
    font-size: 2.8rem;
    padding: 1rem;
  }

  option:disabled {
    color: $color-primary;
    opacity: 0.5;
  }

  @include layout-mobile {
    border: 0.2rem solid $color-primary;
    border-radius: 1.5rem;
    font-size: 2.8rem;
  }
}
</style>
