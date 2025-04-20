<template>
  <div class="auth-view">
    <h1 class="auth-view__title">Авторизация</h1>
    <TelegramAuth v-if="!isUserLoaded" />

    <div v-if="isUserLoaded" class="auth-view__content">
      <div class="auth-view__avatar">
        <img :src="user.photo_url" alt="avatar" />
      </div>
      <BaseInput :value="user.first_name" @input="handleFirstNameInput" placeholder="Имя" />
      <BaseInput :value="user.last_name" @input="handleLastNameInput" placeholder="Фамилия" />
      <BaseInput
        :disabled="true"
        :value="user.tg_username"
        placeholder="Телеграм"
        mask="t.me/"
        :error="tgUsernameError"
      />

      <div class="auth-view__logout">
        <BaseButton @click="mainStore.logout">Выйти</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import TelegramAuth from '@/components/TelegramAuth.vue'
import { useMainStore } from '@/stores/main'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
const mainStore = useMainStore()
const { user, isUserLoaded } = storeToRefs(mainStore)
import { updateUser } from '@/services/api'
import { ref, onMounted } from 'vue'

let updateTimeout
const tgUsernameError = ref('')

const debounceUpdateUser = () => {
  clearTimeout(updateTimeout)
  updateTimeout = setTimeout(() => {
    updateUser(user.value)
  }, 1000)
}

console.log(user.value)

const handleFirstNameInput = (event) => {
  user.value.first_name = event.target.value

  if (user.value.first_name) {
    debounceUpdateUser()
  }
}

const handleLastNameInput = (event) => {
  user.value.last_name = event.target.value

  if (user.value.last_name) {
    debounceUpdateUser()
  }
}

const emptyTgUsernameError = 'У вас не установлен username в профиле Telegram'

onMounted(() => {
  if (!user.value.tg_username) {
    tgUsernameError.value = emptyTgUsernameError
  }
})
</script>

<style scoped lang="scss">
.auth-view {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 2rem;
  min-height: 100%;
  font-size: 2rem;
  padding: 2rem;

  &__avatar {
    width: 10rem;
    height: 10rem;
    border-radius: 50%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__title {
    font-size: 5rem;
    font-weight: 700;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  &__logout {
    margin-top: 2rem;
  }
}
</style>
