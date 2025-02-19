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

      <div class="demo__editor-field" :style="fieldStyle">
        <div class="demo__editor-item" v-for="i in itemCount" :key="i"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputComp from '@/components/InputComp.vue'

const rows = ref(6)
const columns = ref(20)

const itemCount = computed(() => rows.value * columns.value)
const fieldStyle = computed(() => ({
  gridTemplateRows: `repeat(${rows.value}, 1fr)`,
  gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
}))
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

  &__editor-field {
    display: grid;
    gap: 0.2rem;
  }
}
</style>
