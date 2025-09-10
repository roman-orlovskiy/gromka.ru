<template>
  <div class="admin">
    <ButtonComp @click="onBroadcastClick">Включить свет 40%</ButtonComp>
  </div>
  <div v-if="statusMessage" class="admin__status">{{ statusMessage }}</div>
  <div v-if="errorMessage" class="admin__error">{{ errorMessage }}</div>
</template>

<script setup>
import { ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import { broadcast } from '@/services/api'

const statusMessage = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const onBroadcastClick = async () => {
  statusMessage.value = ''
  errorMessage.value = ''
  isLoading.value = true
  try {
    await broadcast({ type: 'light-on', percentage: 40 })
    statusMessage.value = 'Сообщение отправлено'
  } catch (e) {
    console.error(e)
    errorMessage.value = 'Ошибка отправки'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.admin {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  text-align: center;
}
.admin__status {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba($color-success, 0.1);
  color: $color-success;
  padding: 0.5rem 1rem;
  border: 1px solid $color-success;
  border-radius: 0.5rem;
}
.admin__error {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba($color-error, 0.1);
  color: $color-error;
  padding: 0.5rem 1rem;
  border: 1px solid $color-error;
  border-radius: 0.5rem;
}
</style>


