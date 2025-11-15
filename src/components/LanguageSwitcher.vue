<template>
  <div class="language-switcher">
    <button
      @click="setLanguage('ru')"
      class="language-switcher__button"
      :class="{ 'language-switcher__button--active': currentLang === 'ru' }"
      :title="t('performance.language.switch')"
    >
      RU
    </button>
    <button
      @click="setLanguage('en')"
      class="language-switcher__button"
      :class="{ 'language-switcher__button--active': currentLang === 'en' }"
      :title="t('performance.language.switch')"
    >
      EN
    </button>
  </div>
</template>

<script setup>
import { useI18n } from '@/composables/useI18n'

const { t, currentLang, setLanguage } = useI18n()
</script>

<style lang="scss" scoped>
.language-switcher {
  display: flex;
  gap: 0.5rem;
  background: rgba($color-vibrant-orange, 0.95);
  border: 3px solid rgba($color-vibrant-orange, 0.5);
  border-radius: 3rem;
  padding: 0.5rem;
  box-shadow: 0 0.4rem 1.2rem rgba($color-vibrant-orange, 0.4);
  backdrop-filter: blur(10px);
  margin: 0 0 2rem 0;
  width: fit-content;

  @include layout-aspect-mobile {
    margin: 1rem auto;
    gap: 0.4rem;
    padding: 0.4rem;
  }

  &__button {
    padding: 0.8rem 1.6rem;
    font-size: 1.6rem;
    font-weight: $font-weight-bold;
    color: $color-white;
    background: transparent;
    border: none;
    border-radius: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;

    @include layout-aspect-mobile {
      padding: 0.6rem 1.2rem;
      font-size: 1.4rem;
    }

    &:hover {
      background: rgba($color-white, 0.2);
    }

    &--active {
      background: rgba($color-white, 0.3);
      color: $color-white;
      font-weight: $font-weight-extra-bold;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}
</style>

