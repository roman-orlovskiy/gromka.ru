<template>
  <div class="select">
    <div class="select__header" @click="toggleDropdown">
      <span class="select__current">{{ currentLabel || placeholder }}</span>
      <span class="select__arrow" :class="{ 'select__arrow--active': isOpen }"></span>
    </div>
    <div class="select__dropdown" v-show="isOpen">
      <div
        v-for="option in options"
        :key="option.value"
        class="select__option"
        :class="{ 'select__option--active': value === option.value }"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
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
const isOpen = ref(false)

const currentLabel = computed(() => {
  const selectedOption = props.options.find((option) => option.value === props.value)
  return selectedOption ? selectedOption.label : ''
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option) => {
  emit('handleChange', { target: { value: option.value } })
  isOpen.value = false
}

// Закрываем дропдаун при клике вне компонента
const handleClickOutside = (event) => {
  if (!event.target.closest('.select')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.select {
  position: relative;
  width: 100%;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    cursor: pointer;
  }

  &__current {
    color: $color-primary;
  }

  &__arrow {
    width: 2rem;
    height: 2rem;
    background-image: $icon-chevron-down;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    transition: transform 0.3s ease;

    &--active {
      transform: rotate(180deg);
    }
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: 27rem;
    overflow-y: auto;
    background-color: $color-white;
    border: 0.2rem solid $color-primary;
    border-radius: 1.5rem;
    margin-top: 0.5rem;
    z-index: 1000;
  }

  &__option {
    padding: 1rem 3rem;
    font-size: 2.8rem;
    color: $color-primary;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgba($color-primary, 0.1);
    }

    &--active {
      background-color: rgba($color-primary, 0.1);
    }
  }

  @include layout-mobile {
    &__header {
      border: 0.2rem solid $color-primary;
      border-radius: 1.5rem;
      font-size: 2.8rem;
    }
  }
}
</style>
