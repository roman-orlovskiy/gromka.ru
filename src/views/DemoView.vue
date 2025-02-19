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

      <div class="demo__editor-field">
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

      <div class="demo__editor-color">
        <InputComp id="color" label="Цвет" type="color" v-model="color" />
      </div>

      <!-- <button @click="printPicture" class="demo__editor-button">Вывести рисунок</button> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InputComp from '@/components/InputComp.vue'
import spartak from '@/assets/data/paints/spartak.json'
import dynamo from '@/assets/data/paints/dynamo.json'

const rows = ref(9)
const columns = ref(22)
const color = ref('#FF0000')

const paints = {
  spartak,
  dynamo,
}

const getItemStyle = (row, column) => {
  return {
    backgroundColor: paintData.value[`${row}_${column}`],
  }
}

const paintData = ref(paints.dynamo)

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

  &__editor-row {
    display: flex;
    gap: 0.2rem;
  }

  &__editor-field {
    display: flex;
    flex-direction: column;
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
