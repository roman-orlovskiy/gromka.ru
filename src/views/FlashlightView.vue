<template>
  <div class="flashlight">
    <ButtonComp mod="gradient-1">Начать</ButtonComp>
  </div>
</template>

<script setup>
import ButtonComp from '@/components/ButtonComp.vue';
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
