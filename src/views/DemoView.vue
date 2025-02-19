<template>
  <div class="demo">
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

      <button @click="printPicture" class="demo__editor-button">Вывести рисунок</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InputComp from '@/components/InputComp.vue'
import spartak from '@/assets/data/paints/spartak.json'

const rows = ref(9)
const columns = ref(22)
const color = ref('#FF0000')

const getItemStyle = (row, column) => {
  return {
    backgroundColor: paintData.value[`${row}_${column}`],
  }
}

const paintData = ref(spartak)

const selectColor = (row, column) => {
  paintData.value[`${row}_${column}`] = color.value
}

const printPicture = () => {
  console.log(JSON.stringify(paintData.value))
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
}
</style>
