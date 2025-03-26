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

      <div class="demo__editor-color">
        <InputComp id="color" label="Цвет" type="color" v-model="color" />
      </div>

      <!-- <button @click="printPicture" class="demo__editor-button">Вывести рисунок</button> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputComp from '@/components/InputComp.vue'
import spartak from '@/assets/data/paints/spartak.json'
import dynamo from '@/assets/data/paints/dynamo.json'
import paryNN from '@/assets/data/paints/pary_nn.json'

const rows = ref(21)
const columns = ref(34)
const color = ref('#FF0000')
const scale = ref(0.3)
const position = ref({ x: 105.171875, y: 9.25 })
const isDragging = ref(false)
const dragStart = ref({ ...position.value })

const generateParyNNPattern = () => {
  const pattern = {}
  const blueColor = '#61aede'

  for (let row = 1; row <= rows.value; row++) {
    for (let col = 1; col <= columns.value; col++) {
      // Чередуем синие и белые ряды
      pattern[`${row}_${col}`] = row % 2 === 0 ? blueColor : ''
    }
  }

  return pattern
}

const paints = {
  paryNN: generateParyNNPattern(),
  spartak,
  dynamo,
}

const fieldStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${scale.value})`,
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
  paintData.value[`${row}_${column}`] = color.value
}

/*const printPicture = () => {
  console.log(JSON.stringify(paintData.value))
}*/

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
  isDragging.value = true
  const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
  const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY
  dragStart.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y,
  }
}

const onDrag = (e) => {
  if (!isDragging.value) return
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
  min-height: 100%;

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

  &__editor-field-container {
    width: 60rem;
    height: 25rem;
    overflow: hidden;
    border: 1px solid $color-gray-300;
    border-radius: 0.2rem;
    position: relative;
    background-color: $color-white;
    cursor: pointer;
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

  &__description {
    font-size: 2rem;
    font-weight: $font-weight-medium;
    margin-bottom: 1rem;
    margin-top: 2rem;
    text-align: center;

    @include layout-aspect-mobile {
      font-size: 1.7rem;
      margin-bottom: 0.5rem;
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
  }
}
</style>
