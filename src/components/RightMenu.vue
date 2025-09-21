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
          <span>{{ isUserLoaded ? user.first_name : 'Войти' }}</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import MainIcon from '@/components/icons/MainIcon.vue'
import AuthIcon from '@/components/icons/AuthIcon.vue'
import FlashlightIcon from '@/components/icons/FlashlightIcon.vue'
import { RouterLink, useRoute } from 'vue-router'
import { useMainStore } from '@/stores/main'
import { storeToRefs } from 'pinia'

const mainStore = useMainStore()
const { user, isUserLoaded } = storeToRefs(mainStore)

const route = useRoute()

const isActive = (name) => {
  console.log(route, name)
  return route.name === name
}

const menuItems = [
  {
    icon: MainIcon,
    text: 'Главная',
    to: '/',
    name: 'home',
  },
  {
    icon: FlashlightIcon,
    text: 'Фонарик',
    to: '/flashlight',
    name: 'flashlight',
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
    height: 8rem;
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
      border-bottom: none;

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
      background-color: $color-secondary-light;
      color: $color-black;
      border-radius: 0;
      font-size: 2rem;
      display: none;

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

      @include layout-aspect-mobile {
        &:first-child {
          border-radius: 0;
        }
      }
    }
  }
}
</style>
