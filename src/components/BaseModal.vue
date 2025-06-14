<template>
  <transition name="fade">
    <div
      class="base-modal"
      v-if="modalType"
      @click="handleCloseModal"
    >
      <div
        class="base-modal__content"
        @click.stop
      >
        <div
          v-if="modalType === 'login'"
          class="base-modal__content-inner"
        >
          <ModalLogin />
        </div>
        <div
          v-if="modalType === 'vkpost'"
          class="base-modal__content-inner"
        >
          Пост № {{modalParams.post_id}} успешно создан

          <p>
            <a
              :href="`https://vk.com/foot_nn?w=wall-138155699_${modalParams.post_id}`"
              target="_blank"
              class="vk-post__modal-link"
            >
              Открыть пост
            </a>
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useMainStore } from '@/stores/main';
import { storeToRefs } from 'pinia';
import ModalLogin from '@/components/ModalLogin.vue';

const mainStore = useMainStore();
const { modalType, modalParams } = storeToRefs(mainStore);

const handleCloseModal = () => {
  mainStore.closeModal();
};
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
    width: 90%;
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
    font-size: 3rem;
    text-align: center;
  }

  &__title {
    font-size: 3rem;
    font-weight: 400;
    text-align: center;

    @include layout-aspect-mobile {
      font-size: 2.4rem;
    }
  }

  &__description {
    font-size: 1.9rem;
    font-weight: 400;
    text-align: center;

    @include layout-aspect-mobile {
      font-size: 1.5rem;
    }
  }
}
</style>
