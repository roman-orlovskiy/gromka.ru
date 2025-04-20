import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { saveUser, getUser } from '@/services/api';

export const useMainStore = defineStore('main', () => {
  const modalType = ref(null);
  const signature = ref(null);
  const startAppParam = ref(null);
  const user = ref({});

  const isUserLoaded = computed(() => user.value?.id);

  const openModal = (type) => {
    console.log('openModal', type);
    modalType.value = type;
  };

  const closeModal = () => {
    modalType.value = null;
  };

  const getUserFromApi = async () => {
    const response = await getUser();
    user.value = response.data;
    console.log('getUserFromApi:', response.data);
  };

  // Функция для получения данных пользователя из Telegram
  const getTelegramUser = async () => {
    if (user.value?.id) {
      return;
    }

    if (window.Telegram && window.Telegram.WebApp) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      signature.value = window.Telegram.WebApp.initDataUnsafe.signature;
      if (tgUser) {
        console.log('Telegram User:', tgUser);
        console.log('Telegram Init Data:', window.Telegram.WebApp.initDataUnsafe);
        console.log('Signature:', signature.value);
        tgUser.hash = window.Telegram.WebApp.initDataUnsafe.hash;
        const response = await saveUser(tgUser);
        user.value = response.data;
        console.log('getTelegramUser:', response.data);
      }
    }
  };

  const getStartAppParam = () => {
    if (window.Telegram && window.Telegram.WebApp) {
      startAppParam.value = window.Telegram.WebApp.initDataUnsafe.start_param;
      console.log('StartApp Param:', startAppParam.value);

      if (startAppParam.value === 'auth') {
        openModal('auth')
      }
    } else {
      console.log('Сайт запущен вне Telegram.');
    }
  };

  return {
    modalType,
    openModal,
    closeModal,
    getTelegramUser,
    signature,
    startAppParam,
    getStartAppParam,
    user,
    getUserFromApi,
    isUserLoaded,
  };
});
