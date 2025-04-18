<template>
  <div class="telegram-auth">
    <div class="telegram-auth__container" ref="authContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const authContainer = ref(null)


onMounted(() => {
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.dataset.telegramLogin = 'gromkaDevBot'
  script.dataset.size = 'large'
  script.dataset.radius = '7'
  script.dataset.onauth = 'onTelegramAuth(user)'
  script.dataset.requestAccess = 'write'

  if (authContainer.value) {
    authContainer.value.appendChild(script)
  }

  window.onTelegramAuth = (user) => {
    console.log(user)
  }
})
</script>

<style lang="scss">
.telegram-auth {
  display: flex;
  justify-content: center;

  @include layout-aspect-mobile {
    right: 0;
  }
}
</style>
