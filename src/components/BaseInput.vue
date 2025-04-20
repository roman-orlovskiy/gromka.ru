<template>
  <div class="base-input">
    <div class="base-input__wrapper">
      <input
        type="text"
        class="base-input__item"
        :class="{ 'base-input__item--error': error, 'base-input__item--shake': showShake }"
        :placeholder="placeholder"
        :value="value"
        @input="handleInput"
      />
      <div v-if="error" class="base-input__error">{{ error }}</div>
      <div v-if="value" class="base-input__placeholder">{{ placeholder }}</div>
    </div>
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
  showShake: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['handleInput'])

const handleInput = (event) => {
  emit('handleInput', event)
}
</script>

<style scoped lang="scss">
.base-input {
  &__wrapper {
    width: 100%;
    position: relative;
  }

  &__item {
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

    @include layout-aspect-mobile {
      font-size: 1.8rem;
      padding: 0.7rem 1.4rem;
      border-radius: 0.7rem;
    }

    &::placeholder {
      color: $color-primary;
      opacity: 0.5;
      transition: all 0.3s ease;
    }

    &--error {
      border-color: $color-error;
    }

    &--shake {
      animation: shake 0.5s ease-in-out;
    }
  }

  &__placeholder {
    position: absolute;
    top: -1.5rem;
    left: 2rem;
    font-size: 1rem;
    color: $color-primary;
    transition: all 0.3s ease;
  }

  &__error {
    color: $color-error;
    font-size: 1.4rem;
    margin-top: 0.5rem;
    padding-left: 3rem;
  }
}
</style>
