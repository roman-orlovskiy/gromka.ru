import { ref } from 'vue';
import { defineStore } from 'pinia';
import { saveUser } from '@/services/api';
export const useMainStore = defineStore('main', () => {
  const modalType = ref(null);
  const signature = ref(null);
  const startAppParam = ref(null);

  const openModal = (type) => {
    console.log('openModal', type);
    modalType.value = type;
  };

  const closeModal = () => {
    modalType.value = null;
  };

  // Функция для получения данных пользователя из Telegram
  const getTelegramUser = async () => {
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      signature.value = window.Telegram.WebApp.initDataUnsafe.signature;
      if (user) {
        console.log('Telegram User:', user);
        console.log('Telegram Init Data:', window.Telegram.WebApp.initDataUnsafe);
        console.log('Signature:', signature.value);
        const userData = await saveUser(user);
        console.log('User:', userData);
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
  };
});
