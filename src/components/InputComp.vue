<template>
  <div class="input-comp">
    <div class="input-comp__wrapper">
      <div class="input-comp__input-wrapper">
        <span v-if="mask" class="input-comp__mask" :class="{ 'input-comp__mask--black': mod === 'black' }">{{ mask }}</span>
        <input
          class="input-comp__item"
          :class="{
            'input-comp__item--error': error,
            'input-comp__item--shake': showShake,
            'input-comp__item--mask': mask,
            'input-comp__item--black': mod === 'black',
          }"
          :type="type"
          :placeholder="placeholder"
          :value="value"
          :maxlength="maxlength"
          @input="handleInput"
          :disabled="disabled"
        />
        <div v-if="disabled" class="input-comp__overlay"></div>
      </div>
      <div v-if="error" class="input-comp__error">{{ error }}</div>
      <div v-if="value" class="input-comp__placeholder" :class="{ 'input-comp__placeholder--black': mod === 'black' }">{{ placeholder }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
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
  mod: {
    type: String,
    default: '',
  },
  maxlength: {
    type: [String, Number],
    default: null,
  },
  max: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['handleInput'])

const handleInput = (event) => {
  let inputValue = event.target.value

  // Для числовых инпутов применяем валидацию
  if (props.type === 'number') {
    // Ограничиваем по maxlength
    if (props.maxlength && inputValue.length > props.maxlength) {
      inputValue = inputValue.slice(0, props.maxlength)
      event.target.value = inputValue
    }

    // Ограничиваем по максимальному значению
    if (props.max !== null) {
      const maxValue = typeof props.max === 'string' ? parseInt(props.max, 10) : props.max
      const numValue = parseInt(inputValue, 10)
      if (!isNaN(numValue) && numValue > maxValue) {
        inputValue = String(maxValue)
        event.target.value = inputValue
      }
    }
  } else {
    // Для текстовых инпутов ограничиваем только по maxlength
    if (props.maxlength && inputValue.length > props.maxlength) {
      inputValue = inputValue.slice(0, props.maxlength)
      event.target.value = inputValue
    }
  }

  emit('handleInput', event)
}
</script>

<style scoped lang="scss">
.input-comp {
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

    &--black {
      border-color: $color-black;
      color: $color-black;

      &::placeholder {
        color: $color-black;
        opacity: 0.5;
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

    &--black {
      color: $color-black;
    }
  }

  &__mask {
    &--black {
      color: $color-black;
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
