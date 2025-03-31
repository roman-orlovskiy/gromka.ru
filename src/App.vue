<template>
  <div class="app">
    <RouterView />
    <RightMenu v-if="!isParyPage" />
  </div>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import RightMenu from '@/components/RightMenu.vue'

const route = useRoute()
const isParyPage = computed(() => route.name === 'parinn')
</script>

<style lang="scss">
.app {
  height: 100%;
  min-height: 100%;
  display: flex;

  & > div:first-child {
    flex: 1;
  }

  @include layout-aspect-mobile {
    flex-direction: column;
    padding-bottom: 5rem;
  }
}

html,
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow-x: hidden;
  font-family: $font-default !important;
  font-weight: $font-weight-medium;
  color: $color-black;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  font-size: vh(10);
  background-color: $color-primary-light;
  box-sizing: border-box;

  @include layout-aspect-tablet {
    font-size: vw(10);
  }

  @include layout-aspect-mobile {
    font-size: mvw(10);
  }

  *,
  *:before,
  *:after {
    margin: 0;
    padding: 0;
    border: 0;
    font-family: inherit;
    font-weight: inherit;
    vertical-align: baseline;
    box-sizing: border-box;
  }
}

#app {
  height: 100%;
  min-height: 100%;
}
</style>
