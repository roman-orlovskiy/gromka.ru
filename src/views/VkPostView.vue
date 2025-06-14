<template>
  <div class="vk-post">
    <div class="vk-post__content">
      <div class="vk-post__title">
        Новое событие
      </div>

      <div class="vk-post__inputs-row">
        <InputComp
          placeholder="Место проведения"
          :value="fieldValue"
          @handleInput="handleFieldInput"
          :error="errors.field"
          :show-shake="shakeFields.field"
        />
      </div>

      <div class="vk-post__inputs-row">
        <InputComp
          placeholder="Адрес"
          :value="addressValue"
          @handleInput="handleAddressInput"
          :error="errors.address"
          :show-shake="shakeFields.address"
        />
      </div>

      <div class="vk-post__inputs-row">
        <SelectComp
          :options="dateOptions"
          :value="selectedDate"
          placeholder="Дата"
          @handleChange="handleDateChange"
          :error="errors.date"
          :show-shake="shakeFields.date"
        />
      </div>

      <div class="vk-post__inputs-row">
        <SelectComp
          :options="hoursOptions"
          :value="selectedHour"
          placeholder="Часы"
          @handleChange="handleHourChange"
          :error="errors.hour"
          :show-shake="shakeFields.hour"
        />
        <SelectComp
          :options="minutesOptions"
          :value="selectedMinute"
          placeholder="Минуты"
          @handleChange="handleMinuteChange"
          :error="errors.minute"
          :show-shake="shakeFields.minute"
        />
      </div>

      <div class="vk-post__inputs-row">
        <SelectComp
          :options="durationOptions"
          :value="durationValue"
          placeholder="Продолжительность"
          @handleChange="handleDurationChange"
          :error="errors.duration"
          :show-shake="shakeFields.duration"
        />
      </div>

      <div class="vk-post__inputs-row">
        <InputComp
          placeholder="Количество мест"
          :value="spotsValue"
          @handleInput="handleSpotsInput"
          :error="errors.spots"
          :show-shake="shakeFields.spots"
          type="number"
        />
      </div>

      <div class="vk-post__inputs-row">
        <InputComp
          placeholder="Стоимость"
          :value="priceValue"
          @handleInput="handlePriceInput"
          :error="errors.price"
          :show-shake="shakeFields.price"
          type="number"
        />
      </div>

      <div class="vk-post__inputs-row">
        <InputComp
          placeholder="Имя"
          :value="contactNameValue"
          @handleInput="handleContactNameInput"
          :error="errors.contactName"
          :show-shake="shakeFields.contactName"
        />
      </div>

      <div class="vk-post__inputs-row">
        <InputComp
          placeholder="Контакт (вк, тг, телефон)"
          :value="contactValue"
          @handleInput="handleContactInput"
          :error="errors.contact"
          :show-shake="shakeFields.contact"
        />
      </div>

      <div class="vk-post__button">
        <ButtonComp mode="big" @click="handleSubmit">Опубликовать</ButtonComp>
      </div>
    </div>
  </div>
</template>

<script setup>
import InputComp from '@/components/InputComp.vue'
import SelectComp from '@/components/SelectComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import { ref, computed } from 'vue'
import { vkPost } from '@/services/api'

// Значения полей
const fieldValue = ref('')
const addressValue = ref('')
const selectedDate = ref('')
const selectedHour = ref('')
const selectedMinute = ref('')
const durationValue = ref('')
const spotsValue = ref('')
const priceValue = ref('')
const contactNameValue = ref('')
const contactValue = ref('')

// Состояние ошибок
const errors = ref({
  field: '',
  address: '',
  date: '',
  hour: '',
  minute: '',
  duration: '',
  spots: '',
  price: '',
  contactName: '',
  contact: ''
})

// Состояние анимации тряски
const shakeFields = ref({
  field: false,
  address: false,
  date: false,
  hour: false,
  minute: false,
  duration: false,
  spots: false,
  price: false,
  contactName: false,
  contact: false
})

// Генерация опций для дат (ближайшие 7 дней)
const dateOptions = computed(() => {
  const options = []
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    options.push({
      label: `${day}.${month}`,
      value: `${day}.${month}`
    })
  }

  return options
})

// Опции для часов
const hoursOptions = computed(() => {
  return Array.from({ length: 24 }, (_, i) => ({
    label: String(i).padStart(2, '0'),
    value: String(i).padStart(2, '0')
  }))
})

// Опции для минут (с шагом 5)
const minutesOptions = computed(() => {
  return Array.from({ length: 12 }, (_, i) => ({
    label: String(i * 5).padStart(2, '0'),
    value: String(i * 5).padStart(2, '0')
  }))
})

// Опции для продолжительности
const durationOptions = ref([
  { label: '1 час', value: '1 час' },
  { label: '1 час 30 мин', value: '1 час 30 мин' },
  { label: '2 часа', value: '2 часа' }
])

// Обработчики ввода
const handleFieldInput = (event) => {
  fieldValue.value = event.target.value
  errors.value.field = ''
}

const handleAddressInput = (event) => {
  addressValue.value = event.target.value
  errors.value.address = ''
}

const handleDateChange = (event) => {
  selectedDate.value = event.target.value
  errors.value.date = ''
}

const handleHourChange = (event) => {
  selectedHour.value = event.target.value
  errors.value.hour = ''
}

const handleMinuteChange = (event) => {
  selectedMinute.value = event.target.value
  errors.value.minute = ''
}

const handleDurationChange = (event) => {
  durationValue.value = event.target.value
  errors.value.duration = ''
}

const handleSpotsInput = (event) => {
  spotsValue.value = event.target.value
  errors.value.spots = ''
}

const handlePriceInput = (event) => {
  priceValue.value = event.target.value
  errors.value.price = ''
}

const handleContactNameInput = (event) => {
  contactNameValue.value = event.target.value
  errors.value.contactName = ''
}

const handleContactInput = (event) => {
  contactValue.value = event.target.value
  errors.value.contact = ''
}

// Валидация полей
const validateFields = () => {
  let isValid = true
  errors.value = {
    field: '',
    address: '',
    date: '',
    hour: '',
    minute: '',
    duration: '',
    spots: '',
    price: '',
    contactName: '',
    contact: ''
  }
  shakeFields.value = {
    field: false,
    address: false,
    date: false,
    hour: false,
    minute: false,
    duration: false,
    spots: false,
    price: false,
    contactName: false,
    contact: false
  }

  if (!fieldValue.value.trim()) {
    errors.value.field = 'Введите место проведения'
    shakeFields.value.field = true
    isValid = false
  }

  if (!addressValue.value.trim()) {
    errors.value.address = 'Введите адрес'
    shakeFields.value.address = true
    isValid = false
  }

  if (!selectedDate.value) {
    errors.value.date = 'Выберите дату'
    shakeFields.value.date = true
    isValid = false
  }

  if (!selectedHour.value) {
    errors.value.hour = 'Выберите час'
    shakeFields.value.hour = true
    isValid = false
  }

  if (!selectedMinute.value) {
    errors.value.minute = 'Выберите минуты'
    shakeFields.value.minute = true
    isValid = false
  }

  if (!durationValue.value.trim()) {
    errors.value.duration = 'Введите продолжительность'
    shakeFields.value.duration = true
    isValid = false
  }

  if (!spotsValue.value.trim()) {
    errors.value.spots = 'Введите количество мест'
    shakeFields.value.spots = true
    isValid = false
  }

  if (!priceValue.value.trim()) {
    errors.value.price = 'Введите стоимость'
    shakeFields.value.price = true
    isValid = false
  }

  if (!contactNameValue.value.trim()) {
    errors.value.contactName = 'Введите имя'
    shakeFields.value.contactName = true
    isValid = false
  }

  if (!contactValue.value.trim()) {
    errors.value.contact = 'Введите контакт'
    shakeFields.value.contact = true
    isValid = false
  }

  if (!isValid) {
    setTimeout(() => {
      shakeFields.value = {
        field: false,
        address: false,
        date: false,
        hour: false,
        minute: false,
        duration: false,
        spots: false,
        price: false,
        contactName: false,
        contact: false
      }
    }, 500)
  }

  return isValid
}

// Отправка формы
const handleSubmit = async () => {
  if (validateFields()) {
    const postData = {
      field: fieldValue.value,
      address: addressValue.value,
      date: selectedDate.value,
      time: `${selectedHour.value}:${selectedMinute.value}`,
      duration: durationValue.value,
      spots: spotsValue.value,
      price: `${priceValue.value}₽`,
      contactName: contactNameValue.value,
      contact: contactValue.value
    }

    try {
      await vkPost(postData)
      // Очистка формы после успешной отправки
      fieldValue.value = ''
      addressValue.value = ''
      selectedDate.value = ''
      selectedHour.value = ''
      selectedMinute.value = ''
      durationValue.value = ''
      spotsValue.value = ''
      priceValue.value = ''
      contactNameValue.value = ''
      contactValue.value = ''
    } catch (error) {
      console.error('Ошибка при отправке поста:', error)
    }
  }
}
</script>

<style scoped lang="scss">
.vk-post {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1.5rem 2rem 6rem 2rem;

  &__title {
    font-size: 4.3rem;
    font-weight: $font-weight-bold;
    color: $color-white;
    margin-bottom: 1rem;
    width: 100%;
    text-align: center;
    line-height: 1.2;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 2.5rem;
    width: 100%;
    max-width: 120rem;
  }

  &__inputs-row {
    display: flex;
    gap: 1.5rem;
    width: 100%;
    max-width: 40rem;
  }

  &__button {
    margin-top: 2rem;
  }
}
</style>
