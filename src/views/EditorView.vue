<template>
  <div class="editor">
    <div class="editor__container">
      <h1 class="editor__title">Редактор</h1>

      <div class="editor__controls">
        <div class="editor__control">
          <InputComp
            :value="rowsInput"
            placeholder="Рядов"
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
            placeholder="Мест"
            type="number"
            mod="black"
            :maxlength="2"
            :max="99"
            @handleInput="handlePlacesInput"
          />
        </div>
      </div>

      <div class="editor__grid-wrapper">
        <div class="editor__grid-container">
          <div class="editor__buttons-column editor__buttons-column--left">
            <button
              v-for="(row, rowIndex) in gridRows"
              :key="`left-button-${rowIndex}`"
              class="editor__add-button"
              @click="addPlaceToRow(rowIndex)"
              type="button"
            >
              +
            </button>
          </div>
          <div class="editor__dots-container">
            <div
              v-for="(row, rowIndex) in gridRows"
              :key="`row-${rowIndex}`"
              class="editor__row"
            >
              <div
                v-for="(place, placeIndex) in row"
                :key="`place-${rowIndex}-${placeIndex}`"
                class="editor__dot"
                @mouseenter="hoveredDot = { row: rowIndex + 1, place: placeIndex + 1 }"
                @mouseleave="hoveredDot = null"
              >
                <Transition name="tooltip">
                  <div
                    v-if="hoveredDot && hoveredDot.row === rowIndex + 1 && hoveredDot.place === placeIndex + 1"
                    class="editor__tooltip"
                  >
                    Ряд {{ rowIndex + 1 }}, Место {{ placeIndex + 1 }}
                  </div>
                </Transition>
              </div>
            </div>
          </div>
          <div class="editor__buttons-column editor__buttons-column--right">
            <button
              v-for="(row, rowIndex) in gridRows"
              :key="`right-button-${rowIndex}`"
              class="editor__add-button"
              @click="addPlaceToRowEnd(rowIndex)"
              type="button"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import InputComp from '@/components/InputComp.vue'

const STORAGE_KEY = 'editor-config'

const rowsInput = ref('6')
const placesInput = ref('14')
const hoveredDot = ref(null)
const gridRowsData = ref([])
const isLoaded = ref(false)

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

// Инициализация данных сетки
const initializeGrid = () => {
  const currentRows = gridRowsData.value.length
  const targetRows = rows.value
  const targetPlaces = places.value

  // Добавляем или удаляем ряды
  if (targetRows > currentRows) {
    for (let i = currentRows; i < targetRows; i++) {
      gridRowsData.value.push(Array.from({ length: targetPlaces }, () => null))
    }
  } else if (targetRows < currentRows) {
    gridRowsData.value = gridRowsData.value.slice(0, targetRows)
  }

  // Обновляем количество мест в каждом ряду (только добавляем, не удаляем)
  gridRowsData.value.forEach((row) => {
    const currentPlaces = row.length
    if (targetPlaces > currentPlaces) {
      for (let i = currentPlaces; i < targetPlaces; i++) {
        row.push(null)
      }
    }
    // Не удаляем места, если их больше targetPlaces - они были добавлены вручную
  })
}

const gridRows = computed(() => {
  initializeGrid()
  return gridRowsData.value
})

const addPlaceToRow = (rowIndex) => {
  if (rowIndex >= 0 && rowIndex < gridRowsData.value.length) {
    gridRowsData.value[rowIndex].unshift(null)
    saveToLocalStorage()
  }
}

const addPlaceToRowEnd = (rowIndex) => {
  if (rowIndex >= 0 && rowIndex < gridRowsData.value.length) {
    gridRowsData.value[rowIndex].push(null)
    saveToLocalStorage()
  }
}

const handleRowsInput = (event) => {
  rowsInput.value = event.target.value
}

const handlePlacesInput = (event) => {
  placesInput.value = event.target.value
}

// Сохранение конфигурации в localStorage
const saveToLocalStorage = () => {
  if (!isLoaded.value) return // Не сохраняем до завершения загрузки

  try {
    const config = {
      rows: rowsInput.value,
      places: placesInput.value,
      gridRowsData: gridRowsData.value.map(row => row.length)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (error) {
    console.error('Ошибка при сохранении в localStorage:', error)
  }
}

// Загрузка конфигурации из localStorage
const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const config = JSON.parse(saved)

      if (config.rows) {
        rowsInput.value = config.rows
      }

      if (config.places) {
        placesInput.value = config.places
      }

      if (config.gridRowsData && Array.isArray(config.gridRowsData)) {
        // Восстанавливаем структуру рядов с сохраненным количеством мест
        gridRowsData.value = config.gridRowsData.map(placesCount =>
          Array.from({ length: placesCount }, () => null)
        )
      }
    }
    isLoaded.value = true
  } catch (error) {
    console.error('Ошибка при загрузке из localStorage:', error)
    isLoaded.value = true
  }
}

// Отслеживание изменений для автоматического сохранения
watch([rowsInput, placesInput], () => {
  saveToLocalStorage()
}, { deep: true })

watch(gridRowsData, () => {
  saveToLocalStorage()
}, { deep: true })

// Загрузка при монтировании компонента
onMounted(() => {
  loadFromLocalStorage()
})
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
  min-width: 10rem;
  max-width: 12rem;
  width: 100%;
}

.editor__grid-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  background: $color-gray-100;
  border-radius: 0.75rem;
  overflow-x: auto;
}

.editor__grid-container {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  width: 100%;
}

.editor__buttons-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-shrink: 0;
  justify-content: flex-start;
  padding-top: 0.25rem;
}

.editor__dots-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.editor__row {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}

.editor__add-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: transparent;
  color: $color-primary;
  border: 0.2rem solid $color-primary;
  font-size: 2rem;
  font-weight: $font-weight-bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  @include hover {
    &:hover {
      color: $color-primary-dark;
      border-color: $color-primary-dark;
      transform: scale(1.1);
    }
  }
}

.editor__dot {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: $color-gray-400;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  @include hover {
    &:hover {
      background: $color-gray-400;
      transform: scale(1.1);
    }
  }
}

.editor__tooltip {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  background: $color-white;
  color: $color-black;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 1.2rem;
  white-space: nowrap;
  box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.15);
  z-index: 10;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 0.5rem solid transparent;
    border-top-color: $color-white;
  }
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-enter-from {
  opacity: 0;
}

.tooltip-leave-to {
  opacity: 0;
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
    padding: 3rem 1.5rem;
  }

  .editor__grid-container {
    gap: 1rem;
  }

  .editor__buttons-column {
    gap: 0.75rem;
  }

  .editor__dots-container {
    gap: 0.75rem;
  }

  .editor__row {
    gap: 0.75rem;
  }

  .editor__dot {
    width: 2rem;
    height: 2rem;
  }

  .editor__add-button {
    width: 2rem;
    height: 2rem;
    font-size: 1.6rem;
  }

  .editor__tooltip {
    font-size: 1rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>

