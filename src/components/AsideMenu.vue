<template>
  <div class="aside-menu">
    <div class="aside-menu__item">
      <router-link to="/">Главная</router-link>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.aside-menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20rem;
  background-color: $color-white;
  z-index: 1000;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
}
</style>
