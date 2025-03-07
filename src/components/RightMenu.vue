<template>
  <div class="right-menu">
    <RouterLink v-for="item in menuItems" :key="item.text" :to="item.to" class="right-menu__item">
      <component :is="item.icon" />
      {{ item.text }}
    </RouterLink>
  </div>
</template>

<script setup>
import MainIcon from '@/components/icons/MainIcon.vue'
import PerfIcon from '@/components/icons/PerfIcon.vue'
import { RouterLink } from 'vue-router'

const menuItems = [
  {
    icon: MainIcon,
    text: 'События',
    to: '/',
  },
  {
    icon: PerfIcon,
    text: 'Перформансы',
    to: '/performances',
  },
  {
    icon: MainIcon,
    text: 'Демо',
    to: '/demo',
  },
]
</script>

<style lang="scss">
.right-menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20rem;
  background-color: $color-white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-radius: 3rem;
  font-size: 1.5rem;

  &__item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1rem 1rem 2.3rem;
    border-bottom: 1px solid $color-gray-200;
    cursor: pointer;
    text-decoration: none;
    color: $color-black;

    &:hover {
      box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.1);
    }

    svg {
      width: 2.5rem;
    }
  }
}
</style>
