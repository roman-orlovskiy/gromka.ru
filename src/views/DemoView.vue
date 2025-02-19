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
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InputComp from '@/components/InputComp.vue'

const rows = ref(6)
const columns = ref(20)

const getItemStyle = (row, column) => {
  return {
    backgroundColor: paintData.value[`${row}_${column}`],
  }
}

const spartakPaints = {
  '1_1': '#FF0000', // Красный
  '1_2': '#FF0000',
  '1_3': '#FFFFFF', // Белый
  '1_4': '#FF0000',
  '1_5': '#FF0000',
  // Добавьте остальные пиксели
  '2_1': '#FF0000',
  '2_2': '#FFFFFF',
  '2_3': '#FF0000',
  '2_4': '#FFFFFF',
  '2_5': '#FF0000',
  // Продолжайте для всех строк и столбцов
  // ...
  '6_20': '#FF0000',
}

const paintData = ref(spartakPaints)
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
  }

  &__editor-inputs {
    display: flex;
    justify-content: center;
    gap: 2rem;
    width: 100%;
  }

  &__editor-input {
    width: 15rem;
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
}
</style>
