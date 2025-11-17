import { ref } from 'vue'

/**
 * Composable для управления формой с валидацией
 * Управляет значениями полей, ошибками и анимацией shake
 */
export function useFormValidation(fields = {}) {
  // Инициализируем значения полей
  const values = ref({})
  const errors = ref({})
  const shakeFields = ref({})

  // Инициализируем начальные значения
  Object.keys(fields).forEach((key) => {
    values.value[key] = fields[key].initialValue || ''
    errors.value[key] = ''
    shakeFields.value[key] = false
  })

  /**
   * Валидирует поле по правилам
   */
  const validateField = (fieldName, value, rules) => {
    if (!rules) return ''

    // Проверка на обязательность
    if (rules.required && !value?.trim()) {
      return rules.requiredMessage || `Поле обязательно для заполнения`
    }

    // Дополнительные правила валидации можно добавить здесь
    // Например: min, max, pattern и т.д.

    return ''
  }

  /**
   * Валидирует все поля формы
   */
  const validate = (validationRules = {}) => {
    let isValid = true

    // Сбрасываем ошибки и shake
    Object.keys(fields).forEach((key) => {
      errors.value[key] = ''
      shakeFields.value[key] = false
    })

    // Валидируем каждое поле
    Object.keys(fields).forEach((key) => {
      const fieldConfig = fields[key]
      const value = values.value[key]
      const rules = validationRules[key] || fieldConfig.rules || {}

      const error = validateField(key, value, rules)

      if (error) {
        errors.value[key] = error
        shakeFields.value[key] = true
        isValid = false
      }
    })

    // Автоматически убираем shake через 500ms
    if (!isValid) {
      setTimeout(() => {
        Object.keys(shakeFields.value).forEach((key) => {
          shakeFields.value[key] = false
        })
      }, 500)
    }

    return isValid
  }

  /**
   * Обработчик изменения значения поля
   */
  const handleFieldChange = (fieldName, value) => {
    values.value[fieldName] = value
    // Очищаем ошибку при изменении поля
    if (errors.value[fieldName]) {
      errors.value[fieldName] = ''
    }
  }

  /**
   * Сбрасывает форму
   */
  const reset = () => {
    Object.keys(fields).forEach((key) => {
      values.value[key] = fields[key].initialValue || ''
      errors.value[key] = ''
      shakeFields.value[key] = false
    })
  }

  return {
    values,
    errors,
    shakeFields,
    validate,
    handleFieldChange,
    reset,
  }
}

