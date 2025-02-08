<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <RouterView />
  </div>
</template>

<style lang="scss">
.app {
  height: 100%;
  min-height: 100%;
  background-color: $color-primary-light;
}
</style>
