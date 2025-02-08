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

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  min-height: 100%;
}

#app {
  height: 100%;
  min-height: 100%;
}
</style>
