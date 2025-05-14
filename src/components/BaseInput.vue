<template>
  <div class="base-input">
    <div class="base-input__wrapper">
      <div class="base-input__input-wrapper">
        <span v-if="mask" class="base-input__mask">{{ mask }}</span>
        <input
          class="base-input__item"
          :class="{
            'base-input__item--error': error,
            'base-input__item--shake': showShake,
            'base-input__item--mask': mask,
          }"
          :type="type"
          :placeholder="placeholder"
          :value="value"
          @input="handleInput"
          :disabled="disabled"
        />
        <div v-if="disabled" class="base-input__overlay"></div>
      </div>
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
  mask: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'text',
  },
})

const emit = defineEmits(['handleInput'])

const handleInput = (event) => {
  emit('handleInput', event)
}
</script>

<style scoped lang="scss">
.base-input {
  width: 100%;
  &__wrapper {
    width: 100%;
    position: relative;
  }

  &__mask {
    position: absolute;
    top: 3rem;
    left: 2rem;
    transform: translateY(-50%);
    font-size: 2.8rem;
    color: $color-primary;
    opacity: 0.8;
    pointer-events: none;

    @include layout-aspect-mobile {
      font-size: 1.8rem;
      top: 2rem;
    }
  }

  &__input-wrapper {
    position: relative;
  }

  &__item {
    width: 100%;
    border: 0.2rem solid $color-primary;
    border-radius: 1.5rem;
    font-size: 2.8rem;
    padding: 1rem 2rem;
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

    &--mask {
      padding-left: 10rem;

      @include layout-aspect-mobile {
        padding-left: 6rem;
      }
    }
  }

  &__placeholder {
    position: absolute;
    top: -2rem;
    left: 2rem;
    font-size: 1.4rem;
    color: $color-primary;
    transition: all 0.3s ease;

    @include layout-aspect-mobile {
      font-size: 1.2rem;
      left: 1.6rem;
    }
  }

  &__error {
    color: $color-error;
    font-size: 1.4rem;
    margin-top: 0.5rem;
    padding-left: 3rem;

    @include layout-aspect-mobile {
      font-size: 1.2rem;
      padding-left: 2rem;
    }
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    pointer-events: none;
    border-radius: 1.5rem;

    @include layout-aspect-mobile {
      border-radius: 0.7rem;
    }
  }
}
</style>
