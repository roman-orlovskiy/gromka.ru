<template>
  <div class="loading">
    <div class="loading__spinner"></div>
  </div>
</template>

<style lang="scss" scoped>
.loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  &__spinner {
    width: 8rem;
    height: 8rem;
    border: 1rem solid $color-secondary-dark;
    border-top: 1rem solid $color-secondary-light;
    border-radius: 50%;
    animation: spin 1.3s linear infinite;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
