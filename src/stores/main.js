import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { saveUser, getUser } from '@/services/api';

export const useMainStore = defineStore('main', () => {
  const modalType = ref(null);
  const signature = ref(null);
  const startAppParam = ref(null);
  const user = ref({});

  const isUserLoaded = computed(() => user.value?.id);
  const tgUsernameError = computed(() => {
    if (isUserLoaded.value && !user.value?.tg_username) {
      return 'Настройте логин в телеграм и перезайдите'
    }
    return ''
  })

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
    if (window.Telegram && window.Telegram.WebApp) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      signature.value = window.Telegram.WebApp.initDataUnsafe.signature;
      if (tgUser) {
        const initData = window.Telegram.WebApp.initDataUnsafe;
        console.log('Telegram Init Data:', initData);
        console.log('Signature:', signature.value);
        tgUser.hash = initData.hash;
        const response = await saveUser({
          auth_date: initData.auth_date,
          first_name: tgUser.first_name,
          hash: initData.hash,
          id: tgUser.id,
          last_name: tgUser.last_name,
          photo_url: tgUser.photo_url,
          username: tgUser.username,
        });
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
    tgUsernameError,
  };
});
