<template>
  <button 
    @click="toggleLanguage" 
    class="language-switcher" 
    :title="t('performance.language.switch')"
  >
    {{ currentLang === 'ru' ? 'EN' : 'RU' }}
  </button>
</template>

<script setup>
import { useI18n } from '@/composables/useI18n'

const { t, currentLang, toggleLanguage } = useI18n()
</script>

<style lang="scss" scoped>
.language-switcher {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 10000;
  width: 5rem;
  height: 5rem;
  background: rgba($color-white, 0.95);
  border: 3px solid rgba($color-black, 0.3);
  border-radius: 50%;
  font-size: 1.6rem;
  font-weight: $font-weight-bold;
  color: $color-black;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 0.4rem 1.2rem rgba($color-black, 0.3);
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba($color-white, 1);
    transform: scale(1.15);
    box-shadow: 0 0.6rem 2rem rgba($color-black, 0.4);
    border-color: rgba($color-black, 0.5);
  }

  &:active {
    transform: scale(0.9);
  }

  @include layout-aspect-mobile {
    top: 1rem;
    right: 1rem;
    width: 4.5rem;
    height: 4.5rem;
    font-size: 1.4rem;
  }
}
</style>

