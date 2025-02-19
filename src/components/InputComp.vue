<template>
  <div class="input-wrapper">
    <label class="input__label" v-if="label" :for="id">{{ label }}</label>

    <input
      :id="id"
      :class="inputClass"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="handleInput"
      :style="inputStyle"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
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
  label: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const inputClass = computed(() => {
  return `input ${props.mod ? `input--mod-${props.mod}` : ''}`
})

const inputStyle = computed(() => {
  return props.type === 'color' ? { backgroundColor: props.modelValue } : {}
})

function handleInput(event) {
  let value = event.target.value
  if (props.type === 'number') {
    value = Number(value)
  }
  emit('update:modelValue', value)
}
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

  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  &__label {
    font-size: 2.5rem;
    font-weight: 600;
  }
}
</style>
