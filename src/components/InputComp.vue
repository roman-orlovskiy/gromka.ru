<template>
  <input
    :class="inputClass"
    :type="type"
    :placeholder="placeholder"
    :value="value"
    @input="handleInput"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mod: {
    type: String,
    default: '',
    oneOf: ['secondary'],
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  value: {
    type: String,
    default: '',
  },
})

const inputClass = computed(() => {
  return `input ${props.mod ? `input--mod-${props.mod}` : ''}`
})
</script>

<style lang="scss" scoped>
.input {
  width: 100%;
  font-size: 3.5rem;
  padding: 1rem 2rem;
  background-color: $color-white;
  color: $color-primary;
  border: 1px solid $color-primary;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: opacity 0.3s;
  box-shadow: 0 0 10px 0 rgba($color-primary, 0.5);

  &--mod-secondary {
    background-color: $color-white;
    border: 1px solid $color-secondary;
    box-shadow: 0 0 10px 0 rgba($color-secondary, 0.5);
  }

  &:hover {
    opacity: 0.7;
  }
}
</style>
