<template>
  <div class="show">
    <div class="show__content">
      <div class="show__title">
        Введите ряд и место
      </div>
      <div class="show__inputs-row">
        <InputComp
          placeholder="Ряд"
          :value="values.row"
          @handleInput="(e) => handleFieldChange('row', e.target.value)"
          :error="errors.row"
          :show-shake="shakeFields.row"
          type="number"
        />
        <InputComp
          placeholder="Место"
          :value="values.seat"
          @handleInput="(e) => handleFieldChange('seat', e.target.value)"
          :error="errors.seat"
          :show-shake="shakeFields.seat"
          type="number"
        />
      </div>
      <div class="show__instructions">
        <div class="show__instruction-item">
          <div>
            <div class="show__instruction-number">1</div>
          </div>
          <div class="show__instruction-text">
            Включи на телефоне <b>яркость&nbsp;на&nbsp;максимум</b>
          </div>
        </div>
        <div class="show__instruction-item">
          <div>
            <div class="show__instruction-number">2</div>
          </div>
          <div class="show__instruction-text">
            Нажми "Начать" и <b>разверни&nbsp;экран&nbsp;к&nbsp;полю</b>
          </div>
        </div>
      </div>

      <div class="show__button">
        <ButtonComp mode="big" @click="handleStart">Начать</ButtonComp>
      </div>
    </div>

    <transition name="fade">
      <div class="show__layer" v-if="isLayerVisible">
        <div class="show__close-button" @click="handleCloseLayer">
          <CloseIcon />
        </div>

        <transition name="fade">
          <div class="show__instructions" v-if="isInstructionVisible">
            <div class="show__instruction-item">
              <div>
                <div class="show__instruction-number">1</div>
              </div>
              <div class="show__instruction-text">
                Включи на телефоне <b>яркость&nbsp;на&nbsp;максимум</b>
              </div>
            </div>
            <div class="show__instruction-item">
              <div>
                <div class="show__instruction-number">2</div>
              </div>
              <div class="show__instruction-text">
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
import InputComp from '@/components/InputComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import CloseIcon from '@/components/icons/CloseIcon.vue'
import { useWakeLock } from '@/composables/useWakeLock'
import { useFullscreen } from '@/composables/useFullscreen'
import { useFormValidation } from '@/composables/useFormValidation'
import { useInstructionLayer } from '@/composables/useInstructionLayer'

// Управление формой
const { values, errors, shakeFields, validate, handleFieldChange } = useFormValidation({
  row: { initialValue: '' },
  seat: { initialValue: '' },
})

// Управление Wake Lock
const { requestWakeLock, releaseWakeLock } = useWakeLock()

// Управление Fullscreen
const { enterFullscreen, exitFullscreen } = useFullscreen()

// Управление слоем с инструкциями
const { isLayerVisible, isInstructionVisible, showLayer, hideLayer } = useInstructionLayer(4000)

// Правила валидации
const validationRules = {
  row: {
    required: true,
    requiredMessage: 'Введите ряд',
  },
  seat: {
    required: true,
    requiredMessage: 'Введите место',
  },
}

const handleStart = () => {
  if (validate(validationRules)) {
    showLayer()
    enterFullscreen()
    requestWakeLock()
  }
}

const handleCloseLayer = () => {
  hideLayer()
  exitFullscreen()
  releaseWakeLock()
}
</script>

<style scoped lang="scss">
.show {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 2rem 6rem 2rem;
  min-height: 100%;

  &__title {
    font-size: 2.3rem;
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
    animation: colorShift 1.5s infinite;
    z-index: 1000;
    color: $color-white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;

    & .show__instruction-text {
      color: $color-white;
    }

    & .show__instruction-item {
      &:last-child {
        & .show__instruction-text {
          font-size: 2.5rem;
        }
      }
    }
  }

  &__close-button {
    position: absolute;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
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

  &__button {
    margin-top: 2rem;
  }
}

@keyframes colorShift {
  0% {
    background-color: $color-pary;
  }
  50% {
    background-color: $color-primary;
  }
  100% {
    background-color: $color-pary;
  }
}
</style>

