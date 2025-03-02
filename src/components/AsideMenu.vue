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
  gap: 10px;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 200px;
  background-color: $color-white;
  z-index: 1000;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
