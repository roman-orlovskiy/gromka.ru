<template>
  <div class="input-wrapper">
    <input
      type="text"
      class="input-item"
      :class="{ 'input-item--error': error }"
      :placeholder="placeholder"
      :value="value"
      @input="handleInput"
    />
    <div v-if="error" class="input-error">{{ error }}</div>
  </div>
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
  error: {
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
.input-wrapper {
  width: 100%;
}

.input-item {
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

  &::placeholder {
    color: $color-primary;
    opacity: 0.5;
  }

  &--error {
    border-color: $color-error;
    animation: shake 0.5s ease-in-out;
  }

  @include layout-mobile {
    border: 0.2rem solid $color-primary;
    border-radius: 1.5rem;
    font-size: 2.8rem;
  }
}

.input-error {
  color: $color-error;
  font-size: 1.4rem;
  margin-top: 0.5rem;
  padding-left: 3rem;
}
</style>
