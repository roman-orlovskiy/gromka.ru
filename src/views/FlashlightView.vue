<template>
  <div class="flashlight">
    <ButtonComp mod="gradient-1">Начать</ButtonComp>

    <div class="flashlight__devices">
      <div class="flashlight__device" v-for="device in devices" :key="device.deviceId">
        {{ device }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import ButtonComp from '@/components/ButtonComp.vue';
import { useCamera } from '@/composables/useCamera';
const { devices, getDevices } = useCamera()

onMounted(async () => {
  await getDevices()
  console.log(devices.value)
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/variables.scss' as const;

.flashlight {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, const.$color-vibrant-mint, const.$color-vibrant-orange);
  color: const.$color-white;
}
</style>
