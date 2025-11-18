<template>
  <div class="editor">
    <div class="editor__container">
      <h1 class="editor__title">Редактор</h1>

      <div class="editor__controls">
        <div class="editor__control">
          <InputComp
            :value="rowsInput"
            placeholder="Количество рядов"
            type="number"
            mod="black"
            :maxlength="2"
            :max="99"
            @handleInput="handleRowsInput"
          />
        </div>
        <div class="editor__control">
          <InputComp
            :value="placesInput"
            placeholder="Количество мест"
            type="number"
            mod="black"
            :maxlength="2"
            :max="99"
            @handleInput="handlePlacesInput"
          />
        </div>
      </div>

      <div class="editor__grid-wrapper">
        <div class="editor__grid" :style="gridStyle">
          <div
            v-for="(row, rowIndex) in gridRows"
            :key="`row-${rowIndex}`"
            class="editor__row"
          >
            <div
              v-for="(place, placeIndex) in row"
              :key="`place-${rowIndex}-${placeIndex}`"
              class="editor__dot"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputComp from '@/components/InputComp.vue'

const rowsInput = ref('6')
const placesInput = ref('14')

const rows = computed(() => {
  const value = parseInt(rowsInput.value, 10)
  if (isNaN(value) || value < 1) return 6
  return Math.min(value, 99)
})

const places = computed(() => {
  const value = parseInt(placesInput.value, 10)
  if (isNaN(value) || value < 1) return 14
  return Math.min(value, 99)
})

const gridRows = computed(() => {
  return Array.from({ length: rows.value }, () =>
    Array.from({ length: places.value }, () => null)
  )
})

const gridStyle = computed(() => {
  return {
    gridTemplateColumns: `repeat(${places.value}, 1fr)`,
  }
})

const handleRowsInput = (event) => {
  rowsInput.value = event.target.value
}

const handlePlacesInput = (event) => {
  placesInput.value = event.target.value
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

.editor {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 2rem;
}

.editor__container {
  max-width: 80rem;
  width: 100%;
  background: $color-white;
  border-radius: 1rem;
  padding: 2rem;
}

.editor__title {
  font-size: 3.6rem;
  font-weight: $font-weight-bold;
  color: $color-gray-700;
  margin-bottom: 4rem;
  text-align: center;
}

.editor__controls {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  justify-content: center;
  flex-wrap: wrap;
}

.editor__control {
  min-width: 15rem;
  max-width: 18rem;
  width: 100%;
}

.editor__grid-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: $color-gray-100;
  border-radius: 0.75rem;
  overflow-x: auto;
}

.editor__grid {
  display: grid;
  gap: 1rem;
  width: fit-content;
}

.editor__row {
  display: contents;
}

.editor__dot {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: $color-gray-400;
  cursor: pointer;
  transition: all 0.2s ease;

  @include hover {
    &:hover {
      background: $color-gray-400;
      transform: scale(1.1);
    }
  }
}

@include layout-mobile {
  .editor {
    padding: 1rem;
  }

  .editor__container {
    padding: 1.5rem;
  }

  .editor__title {
    font-size: 2.4rem;
  }

  .editor__controls {
    flex-direction: column;
    gap: 1.5rem;
  }

  .editor__control {
    max-width: 100%;
  }

  .editor__grid-wrapper {
    padding: 1.5rem;
  }

  .editor__grid {
    gap: 0.75rem;
  }

  .editor__dot {
    width: 2rem;
    height: 2rem;
  }
}
</style>

