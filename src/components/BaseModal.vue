<template>
  <transition name="fade">
    <div class="base-modal" v-if="modalType">
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useMainStore } from '@/stores/main';
import { storeToRefs } from 'pinia';

const mainStore = useMainStore();
const { modalType } = storeToRefs(mainStore);
</script>

<style scoped>
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
}

.modal-content {
  background-color: white;
  padding: 4rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
