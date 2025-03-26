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
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 13V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M4 13H20V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V13Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
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
  if (drawingMode.value === 'pencil') return
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
  console.log(position.value, scale.value)
}
</script>

<style lang="scss" scoped>
.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem 0;
  overflow-y: auto;

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
    width: 28rem;
    height: 25rem;
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
      padding-top: 10rem;
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
