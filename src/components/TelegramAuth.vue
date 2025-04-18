<template>
  <div class="telegram-auth">
    <div class="telegram-auth__container" ref="authContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { saveUser } from '@/services/api'
import { useMainStore } from '@/stores/main'
import { storeToRefs } from 'pinia'

const authContainer = ref(null)
const mainStore = useMainStore()
const { user } = storeToRefs(mainStore)


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

  window.onTelegramAuth = async (userData) => {
    const response = await saveUser(userData)
    console.log(response, 'onTelegramAuth')
    user.value = response.data
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
