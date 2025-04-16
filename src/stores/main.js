import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useMainStore = defineStore('main', () => {
  const modalType = ref(null);

  const openModal = (type) => {
    console.log('openModal', type);
    modalType.value = type;
  };

  const closeModal = () => {
    modalType.value = null;
  };

  // Функция для получения данных пользователя из Telegram
  const getTelegramUser = () => {
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      if (user) {
        console.log('Telegram User:', user);
        console.log('Telegram Init Data:', window.Telegram.WebApp.initData);
      } else {
        console.log('Пользователь не найден в Telegram.');
      }
    } else {
      console.log('Сайт запущен вне Telegram.');
    }
  };

  return { modalType, openModal, closeModal, getTelegramUser };
});
