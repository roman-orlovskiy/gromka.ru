<template>
  <div class="app">
    <RouterView />
    <RightMenu v-if="!isParyPage" />

    <BaseModal
      v-if="modalType"
    />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import RightMenu from '@/components/RightMenu.vue'
import BaseModal from '@/components/BaseModal.vue';

import { useMainStore } from './stores/main';
import { storeToRefs } from 'pinia';

const mainStore = useMainStore();
const { modalType } = storeToRefs(mainStore)

const isParyPage = true;
</script>

<style lang="scss">
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;

  & > div:first-child {
    flex: 1;
    background: linear-gradient(135deg,
    $color-vibrant-blue 0%,
    $color-vibrant-purple 35%,
    $color-vibrant-pink 65%,
    $color-vibrant-orange 100%
  );
  }

  @include layout-aspect-mobile {
    flex-direction: column;
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
  font-family: $font-default !important;
  font-weight: $font-weight-medium;
  color: $color-black;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  font-size: vh(10);
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

//fade transition
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
