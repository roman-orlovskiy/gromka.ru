<template>
  <div class="pary">
    <div class="pary__content">
      <div class="pary__title">
        Поддержи Пари НН<br />
        и учавствуй в розыгрыше
      </div>
      <div class="pary__inputs-row">
        <BaseInput
          placeholder="Ряд"
          :value="rowValue"
          @handleInput="handleRowInput"
          :error="errors.row"
          :show-shake="shakeFields.row"
          type="number"
        />
        <BaseInput
          placeholder="Место"
          :value="seatValue"
          @handleInput="handleSeatInput"
          :error="errors.seat"
          :show-shake="shakeFields.seat"
          type="number"
        />
      </div>
      <BaseSelect
        :options="sectorOptions"
        :value="selectedSector"
        placeholder="Сектор"
        @handleChange="handleSectorChange"
        :error="errors.sector"
        :show-shake="shakeFields.sector"
      />
      <div class="pary__instructions">
        <div class="pary__instruction-item">
          <div>
            <div class="pary__instruction-number">1</div>
          </div>
          <div class="pary__instruction-text">
            <b>Отключи автояркость</b> на телефоне
          </div>
        </div>
        <div class="pary__instruction-item">
          <div>
            <div class="pary__instruction-number">2</div>
          </div>
          <div class="pary__instruction-text">
            Включи на телефоне <b>яркость&nbsp;на&nbsp;максимум</b>
          </div>
        </div>
        <div class="pary__instruction-item">
          <div>
            <div class="pary__instruction-number">3</div>
          </div>
          <div class="pary__instruction-text">
            Нажми "Начать" и <b>разверни&nbsp;экран&nbsp;к&nbsp;полю</b>
          </div>
        </div>
        <div class="pary__instruction-item">
          <div>
            <div class="pary__instruction-number">4</div>
          </div>
          <div class="pary__instruction-text">
            Все телефоны вместе образуют красивую картину на стадионе
          </div>
        </div>
      </div>

      <div class="pary__button">
        <BaseButton @click="handleStart">Начать</BaseButton>
      </div>
    </div>

    <transition name="fade">
      <div class="pary__layer" v-if="isLayerVisible">
        <div class="pary__close-button" @click="handleCloseLayer">
          <CloseIcon />
        </div>

        <transition name="fade">
          <div class="pary__instructions" v-if="isInstructionVisible">
            <div class="pary__instruction-item">
              <div>
                <div class="pary__instruction-number">1</div>
              </div>
              <div class="pary__instruction-text">
                <b>Отключи автояркость</b> на телефоне
              </div>
            </div>
            <div class="pary__instruction-item">
              <div>
                <div class="pary__instruction-number">2</div>
              </div>
              <div class="pary__instruction-text">
                Включи на телефоне <b>яркость&nbsp;на&nbsp;максимум</b>
              </div>
            </div>
            <div class="pary__instruction-item">
              <div>
                <div class="pary__instruction-number">3</div>
              </div>
              <div class="pary__instruction-text">
                <b>Разверни&nbsp;экран&nbsp;к&nbsp;полю</b>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import BaseButton from '@/components/BaseButton.vue'
import CloseIcon from '@/components/icons/CloseIcon.vue'
import { ref } from 'vue'

const rowValue = ref('')
const seatValue = ref('')
const selectedSector = ref('')
const isLayerVisible = ref(false)
const isInstructionVisible = ref(true)

const shakeFields = ref({
  row: false,
  seat: false,
  sector: false,
})
const errors = ref({
  row: '',
  seat: '',
  sector: '',
})

const validateFields = () => {
  let isValid = true
  errors.value = {
    row: '',
    seat: '',
    sector: '',
  }
  shakeFields.value = {
    row: false,
    seat: false,
    sector: false,
  }

  if (!rowValue.value.trim()) {
    errors.value.row = 'Введите ряд'
    shakeFields.value.row = true
    isValid = false
  }

  if (!seatValue.value.trim()) {
    errors.value.seat = 'Введите место'
    shakeFields.value.seat = true
    isValid = false
  }

  if (!selectedSector.value) {
    errors.value.sector = 'Выберите сектор'
    shakeFields.value.sector = true
    isValid = false
  }

  if (!isValid) {
    setTimeout(() => {
      shakeFields.value = {
        row: false,
        seat: false,
        sector: false,
      }
    }, 500)
  }

  return isValid
}

const handleRowInput = (event) => {
  rowValue.value = event.target.value
  errors.value.row = ''
}

const handleSeatInput = (event) => {
  seatValue.value = event.target.value
  errors.value.seat = ''
}

const handleSectorChange = (event) => {
  selectedSector.value = event.target.value
  errors.value.sector = ''
}

let instructionTimeout = null

const handleStart = () => {
  if (validateFields()) {
    isLayerVisible.value = true
    enterFullscreen()

    clearTimeout(instructionTimeout)
    instructionTimeout = setTimeout(() => {
      isInstructionVisible.value = false
    }, 4000)
  }
}

const enterFullscreen = () => {
  const element = document.documentElement
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  }
}

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

const handleCloseLayer = () => {
  isLayerVisible.value = false
  clearTimeout(instructionTimeout)
  exitFullscreen()
}

const sectorOptions = ref([
  { label: 'A101', value: 'A101' },
  { label: 'A102', value: 'A102' },
  { label: 'A103', value: 'A103' },
  { label: 'A104', value: 'A104' },
  { label: 'A105', value: 'A105' },
  { label: 'A106', value: 'A106' },
  { label: 'A107', value: 'A107' },
  { label: 'B120', value: 'B120' },
  { label: 'B121', value: 'B121' },
  { label: 'B122', value: 'B122' },
  { label: 'B123', value: 'B123' },
  { label: 'B124', value: 'B124' },
  { label: 'C113', value: 'C113' },
  { label: 'C114', value: 'C114' },
  { label: 'C115', value: 'C115' },
  { label: 'C116', value: 'C116' },
  { label: 'C117', value: 'C117' },
  { label: 'C118', value: 'C118' },
  { label: 'C119', value: 'C119' },
  { label: 'D108', value: 'D108' },
  { label: 'D109', value: 'D109' },
  { label: 'D110', value: 'D110' },
  { label: 'D111', value: 'D111' },
  { label: 'D112', value: 'D112' },
])
</script>

<style scoped lang="scss">
.pary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1.5rem 2rem 6rem 2rem;
  min-height: 100%;

  &__title {
    font-size: 2.5rem;
    font-weight: $font-weight-bold;
    color: $color-primary;
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
    gap: 1.5rem;
    width: 100%;
    max-width: 120rem;
  }

  &__inputs-row {
    display: flex;
    gap: 1.5rem;
    width: 100%;
    max-width: 40rem;
  }

  &__instructions {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 2rem;
    width: 100%;
    max-width: 40rem;
  }

  &__instruction-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__instruction-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.4rem;
    height: 3.4rem;
    background-color: $color-primary;
    color: $color-white;
    border-radius: 50%;
    font-weight: $font-weight-bold;
    font-size: 1.6rem;
  }

  &__instruction-text {
    font-size: 1.6rem;
    color: $color-gray-700;

    b {
      font-weight: $font-weight-bold;
    }
  }

  &__layer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: $color-pary;
    z-index: 1000;
    border: 5px solid $color-white;
    color: $color-white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;

    & .pary__instruction-text {
      color: $color-white;
    }

    & .pary__instruction-item {
      &:last-child {
        & .pary__instruction-text {
          font-size: 2.5rem;
        }
      }
    }

    &--info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
    }
  }

  &__close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 3.2rem;
      height: 3.2rem;
      fill: rgba($color-white, 0.5);
    }
  }
}
</style>
