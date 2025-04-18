<template>
  <div class="right-menu">
    <div>
      <div class="right-menu__items">
        <RouterLink
          v-for="item in menuItems"
          :key="item.text"
          :to="item.to"
          class="right-menu__item"
          :class="{ 'right-menu__item--active': isActive(item.name) }"
        >
          <component :is="item.icon" />
          <span>{{ item.text }}</span>
        </RouterLink>
      </div>
    </div>

    <div>
      <div class="right-menu__items">
        <RouterLink
          to="/auth"
          class="right-menu__item right-menu__item--auth"
        >
          <AuthIcon />
          <span>Войти</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import MainIcon from '@/components/icons/MainIcon.vue'
import PerfIcon from '@/components/icons/PerfIcon.vue'
import DemoIcon from '@/components/icons/DemoIcon.vue'
import AuthIcon from '@/components/icons/AuthIcon.vue'
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @include layout-aspect-mobile {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 5rem;
    border-radius: 0;
  }

  &__items {
    display: flex;
    flex-direction: column;

    @include layout-aspect-mobile {
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }

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

    @include layout-aspect-mobile {
      flex: 1;
      justify-content: center;
      padding: 0;
      border-bottom: none;
      height: 100%;

      span {
        display: none;
      }

      &:first-child {
        border-radius: 0;
      }
    }

    svg {
      width: 2.5rem;

      path {
        fill: $color-primary;
      }
    }

    &--auth {
      background-color: $color-primary-light;
      color: $color-black;
      border-radius: 0;
      font-size: 2rem;

      &:first-child {
        border-radius: 0 0 0 3rem;
      }

      &:hover {
        box-shadow: 0 -1rem 1rem rgba(0, 0, 0, 0.1);
      }

      svg {
        width: 3.5rem;
        path {
          fill: $color-primary;
        }
      }
    }
  }
}
</style>
