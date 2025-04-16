<template>
  <transition name="fade">
    <div class="base-modal" v-if="modalType">
      <div class="base-modal__content">
        <div
          v-if="modalType === 'login'"
          class="base-modal__content-inner"
        >
          <h2 class="base-modal__title">Авторизация</h2>
          <p class="base-modal__description">
            Для авторизации перейдите в телеграм-приложение
            <a :href="link" target="_blank">@gromkaBot/events</a>
          </p>

          <a :href="link" target="_blank">
            <BaseButton>Войти</BaseButton>
          </a>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useMainStore } from '@/stores/main';
import { storeToRefs } from 'pinia';
import BaseButton from '@/components/BaseButton.vue';
const mainStore = useMainStore();
const { modalType } = storeToRefs(mainStore);

const link = 'https://t.me/gromkaDevBot/events?startapp=auth';
</script>

<style scoped lang="scss">
.base-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;

  &__content {
    background-color: white;
    padding: 4rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 40rem;

    a {
      color: $color-primary;
      text-decoration: underline;
    }
  }

  &__content-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.6rem;
  }

  &__title {
    font-size: 3rem;
    font-weight: 400;
    text-align: center;
  }

  &__description {
    font-size: 1.9rem;
    font-weight: 400;
    text-align: center;
  }
}
</style>
