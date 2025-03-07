<template>
  <div class="right-menu">
    <RouterLink
      v-for="item in menuItems"
      :key="item.text"
      :to="item.to"
      class="right-menu__item"
      :class="{ 'right-menu__item--active': isActive(item.name) }"
    >
      <component :is="item.icon" />
      {{ item.text }}
    </RouterLink>
  </div>
</template>

<script setup>
import MainIcon from '@/components/icons/MainIcon.vue'
import PerfIcon from '@/components/icons/PerfIcon.vue'
import DemoIcon from '@/components/icons/DemoIcon.vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const isActive = (name) => {
  console.log(route, name)
  return route.name === name
}

const menuItems = [
  {
    icon: MainIcon,
    text: 'События',
    to: '/',
    name: 'home',
  },
  {
    icon: PerfIcon,
    text: 'Перформансы',
    to: '/performances',
    name: 'performances',
  },
  {
    icon: DemoIcon,
    text: 'Демо',
    to: '/demo',
    name: 'demo',
  },
]
</script>

<style lang="scss">
.right-menu {
  width: 20rem;
  height: 100%;
  background-color: $color-white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-radius: 3rem 0 0 3rem;
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

    &:first-child {
      border-radius: 3rem 0 0 0;
    }

    &:hover {
      box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.1);
    }

    &--active {
      background-color: $color-primary-light;
    }

    svg {
      width: 2.5rem;

      path {
        fill: $color-primary;
      }
    }
  }
}
</style>
