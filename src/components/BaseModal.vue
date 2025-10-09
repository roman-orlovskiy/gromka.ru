<template>
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
        <div
          v-if="modalType === 'demo'"
          class="base-modal__phone"
        >
          <DemoPerfView />
        </div>
      </div>
    </div>
</template>

<script setup>
import { useMainStore } from '@/stores/main';
import { storeToRefs } from 'pinia';
import ModalLogin from '@/components/ModalLogin.vue';
import DemoPerfView from '@/views/DemoPerfView.vue';

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
    border-radius: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

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

  &__phone {
    background-color: #1a1a1a;
    border-radius: 3rem;
    padding: 2rem 1rem;
    width: 42rem;
    max-width: 95vw;
    height: 85vh;
    max-height: 90rem;
    box-shadow: 0 2rem 6rem rgba(0, 0, 0, 0.8),
                0 0 0 1rem #2a2a2a,
                0 0 0 1.2rem #1a1a1a;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    @include layout-aspect-mobile {
      width: 95vw;
      height: 90vh;
      border-radius: 2rem;
      padding: 1.5rem 0.8rem;
    }

    // Верхняя "челка" телефона
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 15rem;
      height: 2.5rem;
      background: #1a1a1a;
      border-radius: 0 0 2rem 2rem;
      z-index: 10;

      @include layout-aspect-mobile {
        width: 12rem;
        height: 2rem;
      }
    }

    // Динамик
    &::after {
      content: '';
      position: absolute;
      top: 0.8rem;
      left: 50%;
      transform: translateX(-50%);
      width: 6rem;
      height: 0.6rem;
      background: #333;
      border-radius: 0.3rem;
      z-index: 11;

      @include layout-aspect-mobile {
        width: 5rem;
        height: 0.5rem;
      }
    }

    // Контент внутри телефона
    :deep(.demo) {
      height: 100%;
      border-radius: 2rem;
      overflow-y: auto;
      background: linear-gradient(135deg, #FF9F1C 0%, #FFB84D 30%, #FFFFFF 70%, #FFB84D 100%);

      @include layout-aspect-mobile {
        border-radius: 1.5rem;
      }
    }
  }
}
</style>
