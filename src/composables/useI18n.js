import { ref, computed } from 'vue'

// Определение языка браузера
const getBrowserLanguage = () => {
  const lang = navigator.language || navigator.userLanguage
  return lang.startsWith('ru') ? 'ru' : 'en'
}

// Загрузка переводов
const translations = {
  ru: () => import('@/locales/ru.js').then(m => m.default),
  en: () => import('@/locales/en.js').then(m => m.default)
}

// Состояние
const currentLang = ref(localStorage.getItem('language') || getBrowserLanguage())
const translationsData = ref({})

// Загрузка переводов при инициализации
const loadTranslations = async (lang) => {
  if (!translationsData.value[lang]) {
    translationsData.value[lang] = await translations[lang]()
  }
}

// Инициализация
loadTranslations(currentLang.value)

export const useI18n = () => {
  // Создаем реактивную функцию t, которая зависит от currentLang
  const t = (key, params = {}) => {
    // Используем currentLang.value для реактивности
    const lang = currentLang.value
    const keys = key.split('.')
    let value = translationsData.value[lang]
    
    // Если переводы еще не загружены, возвращаем ключ
    if (!value) {
      return key
    }
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        console.warn(`Translation key "${key}" not found for language "${lang}"`)
        return key
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value for "${key}" is not a string`)
      return key
    }
    
    // Замена параметров
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match
    })
  }

  const setLanguage = async (lang) => {
    if (lang !== 'ru' && lang !== 'en') {
      console.warn(`Unsupported language: ${lang}`)
      return
    }
    
    await loadTranslations(lang)
    currentLang.value = lang
    localStorage.setItem('language', lang)
  }

  const toggleLanguage = async () => {
    const newLang = currentLang.value === 'ru' ? 'en' : 'ru'
    await setLanguage(newLang)
  }

  return {
    t,
    currentLang: computed(() => currentLang.value),
    setLanguage,
    toggleLanguage
  }
}

