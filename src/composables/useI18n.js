import { ref, computed } from 'vue'

// Определение языка браузера
const getBrowserLanguage = () => {
  const lang = navigator.language || navigator.userLanguage
  return lang.startsWith('ru') ? 'ru' : 'en'
}

// Получение языка из URL параметра (поддержка hash routing)
const getLanguageFromUrl = () => {
  // Проверяем query параметры в основной части URL
  const urlParams = new URLSearchParams(window.location.search)
  let langParam = urlParams.get('lang')
  
  // Если не нашли, проверяем hash часть (для hash routing)
  if (!langParam && window.location.hash) {
    const hashMatch = window.location.hash.match(/[?&]lang=([^&]+)/)
    if (hashMatch) {
      langParam = hashMatch[1]
    }
  }
  
  if (langParam === 'ru' || langParam === 'en') {
    return langParam
  }
  return null
}

// Загрузка переводов
const translations = {
  ru: () => import('@/locales/ru.js').then(m => m.default),
  en: () => import('@/locales/en.js').then(m => m.default)
}

// Определение начального языка с приоритетом: URL > localStorage > браузер
const getInitialLanguage = () => {
  const urlLang = getLanguageFromUrl()
  if (urlLang) {
    return urlLang
  }
  const storedLang = localStorage.getItem('language')
  if (storedLang === 'ru' || storedLang === 'en') {
    return storedLang
  }
  return getBrowserLanguage()
}

// Состояние
const currentLang = ref(getInitialLanguage())
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

  // Обновление URL с параметром lang (поддержка hash routing)
  const updateUrlLanguage = (lang) => {
    try {
      const currentHash = window.location.hash || '#/'
      let newHash = currentHash
      
      // Если используется hash routing, обновляем параметр в hash части
      if (currentHash.includes('?')) {
        // Параметры уже есть в hash
        const hashParts = currentHash.split('?')
        const hashPath = hashParts[0]
        const hashParams = new URLSearchParams(hashParts[1] || '')
        hashParams.set('lang', lang)
        newHash = `${hashPath}?${hashParams.toString()}`
      } else {
        // Параметров нет в hash, добавляем
        newHash = `${currentHash}?lang=${lang}`
      }
      
      // Обновляем hash через history API (без перезагрузки страницы)
      const newUrl = window.location.pathname + window.location.search + newHash
      window.history.replaceState({}, '', newUrl)
    } catch (e) {
      // Если не удалось обновить URL (например, в некоторых окружениях), просто игнорируем
      console.warn('Could not update URL:', e)
    }
  }

  const setLanguage = async (lang) => {
    if (lang !== 'ru' && lang !== 'en') {
      console.warn(`Unsupported language: ${lang}`)
      return
    }
    
    await loadTranslations(lang)
    currentLang.value = lang
    localStorage.setItem('language', lang)
    updateUrlLanguage(lang)
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

