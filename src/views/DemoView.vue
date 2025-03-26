<template>
  <div class="demo">
    <div class="demo__description">
      Перед вами схематично часть трибуны футбольного стадиона.
      <br />
      С помощью телефонов болельщиков вы можете нарисовать на трибуне любой рисунок.
      <br /><br />
      Примеры рисунков:
    </div>

    <div class="demo__editor-examples">
      <div @click="selectPaint('paryNN')" class="demo__editor-example demo__editor-example--paryNN">
        <span>Пари НН</span>
      </div>

      <div
        @click="selectPaint('spartak')"
        class="demo__editor-example demo__editor-example--spartak"
      >
        <span>Спартак</span>
      </div>

      <div @click="selectPaint('dynamo')" class="demo__editor-example demo__editor-example--dynamo">
        <span>Динамо</span>
      </div>

      <div @click="selectPaint('clear')" class="demo__editor-example demo__editor-example--clear">
        <span>Чистый лист</span>
      </div>
    </div>

    <div class="demo__editor">
      <div class="demo__editor-inputs">
        <div class="demo__editor-input">
          <InputComp id="rows" label="Строки" type="number" v-model="rows" />
        </div>
        <div class="demo__editor-input">
          <InputComp id="columns" label="Столбцы" type="number" v-model="columns" />
        </div>
      </div>

      <div class="demo__editor-zoom">* Можно зумить и перемещать рисунок</div>
      <div class="demo__editor-field-wrapper">
        <div class="demo__editor-tools">
          <div
            class="demo__editor-tool"
            :class="{ 'demo__editor-tool--active': drawingMode === 'pencil' }"
            @click="drawingMode = 'pencil'"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 3C17.2626 2.73735 17.5744 2.52901 17.9176 2.38687C18.2608 2.24473 18.6286 2.17157 19 2.17157C19.3714 2.17157 19.7392 2.24473 20.0824 2.38687C20.4256 2.52901 20.7374 2.73735 21 3C21.2626 3.26264 21.471 3.57444 21.6131 3.9176C21.7553 4.26077 21.8284 4.62856 21.8284 5C21.8284 5.37143 21.7553 5.73923 21.6131 6.08239C21.471 6.42555 21.2626 6.73735 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div
            class="demo__editor-tool"
            :class="{ 'demo__editor-tool--active': drawingMode === 'hand' }"
            @click="drawingMode = 'hand'"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M13.5001 3.75C13.9143 3.75 14.2501 4.08579 14.2501 4.5V7.5V12.75H15.7501V7.5C15.7501 7.08579 16.0858 6.75 16.5001 6.75C16.9143 6.75 17.2501 7.08579 17.2501 7.5V15C17.2501 17.8995 14.8996 20.25 12.0001 20.25V21.75C15.728 21.75 18.7501 18.7279 18.7501 15V7.5C18.7501 6.25736 17.7427 5.25 16.5001 5.25C16.2371 5.25 15.9846 5.29512 15.7501 5.37803V4.5C15.7501 3.25736 14.7427 2.25 13.5001 2.25C12.4625 2.25 11.5889 2.95235 11.3289 3.90757C11.0724 3.80589 10.7927 3.75 10.5001 3.75C9.25742 3.75 8.25006 4.75736 8.25006 6V12.5344L7.77377 11.5689L7.77221 11.5657C7.21726 10.4539 5.86607 10.0024 4.75422 10.5574C3.65214 11.1075 3.1989 12.4399 3.7315 13.546L5.03741 16.7808L5.06205 16.8354C6.16787 19.047 7.45919 20.2994 8.73651 20.9857C10.0096 21.6696 11.194 21.75 12.0001 21.75V20.25C11.3061 20.25 10.4069 20.1803 9.44641 19.6643C8.49439 19.1528 7.40758 18.1618 6.41695 16.191L5.11239 12.9597L5.08798 12.9055C4.903 12.5349 5.05349 12.0845 5.4241 11.8995C5.79428 11.7147 6.24405 11.8646 6.42944 12.2343L8.32743 16.0818L9.75004 15.75V14.25H9.75006V6C9.75006 5.58579 10.0858 5.25 10.5001 5.25C10.9143 5.25 11.2501 5.58579 11.2501 6V12.75H12.7501V6V4.5C12.7501 4.08579 13.0858 3.75 13.5001 3.75Z"
                fill="#080341"
              />
            </svg>
          </div>
        </div>
        <div
          class="demo__editor-field-container"
          @wheel.prevent="handleWheel"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
          @touchstart="startDrag"
          @touchmove="onDrag"
          @touchend="stopDrag"
        >
          <div class="demo__editor-field" :style="fieldStyle">
            <div class="demo__editor-row" v-for="i in rows" :key="i">
              <div
                class="demo__editor-item"
                v-for="j in columns"
                :key="j"
                :style="getItemStyle(i, j)"
                @click="selectColor(i, j)"
                @mouseover="handleItemMouseOver(i, j)"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="demo__editor-color">
        <InputComp id="color" label="Цвет" type="color" v-model="color" />
        <div class="demo__editor-color-actions">
          <button class="demo__editor-color-add" @click="addBasicColor">Добавить</button>
        </div>
        <div class="demo__editor-basic-colors">
          <div
            v-for="(basicColor, index) in basicColors"
            :key="index"
            class="demo__editor-basic-color"
            :style="{ backgroundColor: basicColor }"
            @click="color = basicColor"
          ></div>
        </div>
      </div>

      <button @click="printPicture" class="demo__editor-button">Вывести рисунок</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputComp from '@/components/InputComp.vue'

import paryNN from '@/assets/data/paints/pary_nn.json'
import spartak from '@/assets/data/paints/spartak.json'
import dynamo from '@/assets/data/paints/dynamo.json'

const rows = ref(21)
const columns = ref(35)
const color = ref('#61aede')
const basicColors = ref(['#61aede', '#ffffff'])
const scale = ref(0.3)
const drawingMode = ref('pencil')
const position = ref({ x: 26.6640625, y: 14.890625 })
const isDragging = ref(false)
const isPencilDragging = ref(false)
const dragStart = ref({ ...position.value })

const generateParyNNPattern = () => {
  const pattern = {}
  const blueColor = '#61aede'

  for (let row = 1; row <= rows.value; row++) {
    const isBlue = (row >= 1 && row <= 4) || (row >= 9 && row <= 13) || (row >= 18 && row <= 21)
    for (let col = 1; col <= columns.value; col++) {
      // Чередуем синие и белые ряды
      pattern[`${row}_${col}`] = isBlue ? blueColor : ''
    }
  }

  return pattern
}

const paints = {
  paryNN,
  spartak,
  dynamo,
}

const fieldStyle = computed(() => ({
  transform: `translate(${position.value.x / 10}rem, ${position.value.y / 10}rem) scale(${scale.value})`,
  transformOrigin: '0 0',
  cursor: isDragging.value ? 'grabbing' : 'grab',
}))

const getItemStyle = (row, column) => {
  return {
    backgroundColor: paintData.value[`${row}_${column}`],
  }
}

const paintData = ref(paints.paryNN)

const selectColor = (row, column) => {
  if (drawingMode.value === 'pencil') {
    paintData.value[`${row}_${column}`] = color.value
  }
}

const handleItemMouseOver = (row, column) => {
  if (drawingMode.value === 'pencil' && isPencilDragging.value) {
    paintData.value[`${row}_${column}`] = color.value
  }
}

const addBasicColor = () => {
  if (!basicColors.value.includes(color.value)) {
    basicColors.value.push(color.value)
  }
}

const printPicture = () => {
  console.log(JSON.stringify(paintData.value))
}

const selectPaint = (paint) => {
  if (paint === 'clear') {
    paintData.value = {}
    return
  }

  paintData.value = paints[paint]
}

const handleWheel = (e) => {
  const delta = e.deltaY * -0.01
  const newScale = Math.min(Math.max(0.3, scale.value + delta), 3)
  scale.value = newScale
}

const startDrag = (e) => {
  if (drawingMode.value === 'pencil') {
    isPencilDragging.value = true
    return
  }

  isDragging.value = true
  const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
  const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY
  dragStart.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y,
  }
}

const onDrag = (e) => {
  if (!isDragging.value || drawingMode.value === 'pencil') return
  e.preventDefault()
  const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX
  const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY
  position.value = {
    x: clientX - dragStart.value.x,
    y: clientY - dragStart.value.y,
  }
}

const stopDrag = () => {
  isDragging.value = false
  isPencilDragging.value = false
  console.log(position.value, scale.value)
}
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 2rem 0 6rem 0;
  overflow-y: auto;
  box-sizing: border-box;

  &__editor {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  &__editor-item {
    width: 2rem;
    height: 3.5rem;
    background-color: $color-white;
    border-radius: 0.2rem;
    border: 1px solid $color-gray-300;
    cursor: pointer;
  }

  &__editor-inputs {
    display: flex;
    justify-content: center;
    gap: 2rem;
    width: 100%;
  }

  &__editor-input {
    width: 10rem;
  }

  &__editor-field-wrapper {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  &__editor-tools {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 0.5rem;
  }

  &__editor-tool {
    width: 3.2rem;
    height: 3.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.2rem;
    border: 1px solid $color-gray-300;
    cursor: pointer;
    color: $color-gray-600;
    transition: all 0.2s ease;

    &:hover {
      background-color: $color-gray-100;
    }

    &--active {
      background-color: $color-gray-100;
      border-color: $color-gray-600;
      color: $color-secondary;
    }

    svg {
      width: 2.4rem;
      height: 2.4rem;
    }
  }

  &__editor-field-container {
    width: 48rem;
    height: 35rem;
    overflow: hidden;
    border: 1px solid $color-gray-300;
    border-radius: 0.2rem;
    position: relative;
    background-color: $color-white;
    cursor: pointer;

    @include layout-aspect-mobile {
      width: 28rem;
      height: 25.5rem;
    }
  }

  &__editor-zoom {
    font-size: 1.6rem;
    color: $color-black;
    margin-bottom: -1rem;
  }

  &__editor-field {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
    transition: transform 0.1s ease-out;
    user-select: none;
  }

  &__editor-row {
    display: flex;
    gap: 0.2rem;
  }

  &__editor-color {
    width: 15rem;
  }

  &__editor-color-actions {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  &__editor-color-add {
    background-color: $color-white;
    border: 1px solid $color-gray-300;
    border-radius: 0.2rem;
    padding: 0.5rem 1rem;
    font-size: 1.4rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: $color-gray-100;
    }
  }

  &__editor-basic-colors {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  &__editor-basic-color {
    width: 3rem;
    height: 3rem;
    border-radius: 0.2rem;
    border: 1px solid $color-gray-300;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  &__editor-button {
    background-color: $color-white;
    border: 1px solid $color-gray-300;
    border-radius: 0.2rem;
    padding: 1rem 2rem;
    font-size: 1.6rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: $color-gray-100;
    }
  }

  &__description {
    font-size: 2rem;
    font-weight: $font-weight-medium;
    margin-bottom: 1rem;
    margin-top: 2rem;
    text-align: center;

    @include layout-aspect-mobile {
      font-size: 1.7rem;
      padding-bottom: 0.5rem;
    }
  }

  &__editor-examples {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  &__editor-example {
    background-color: $color-white;
    border-radius: 0.2rem;
    border: 1px solid $color-gray-300;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    color: $color-white;
    font-size: 2.5rem;
    text-transform: uppercase;
    cursor: pointer;

    &--paryNN {
      background-color: #61aede;
    }

    &--spartak {
      background-color: #ff0000;
    }

    &--dynamo {
      background-color: #27579d;
    }

    &--clear {
      background-color: $color-white;
      color: $color-black;
    }

    @include layout-aspect-mobile {
      font-size: 0rem;
    }
  }
}
</style>
