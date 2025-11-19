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

      <div class="editor__color-picker">
        <div
          class="editor__color-option editor__color-option--black"
          :class="{ 'editor__color-option--active': selectedColor === COLOR_BLACK }"
          @click="selectColor(COLOR_BLACK)"
        ></div>
        <div
          class="editor__color-option editor__color-option--white"
          :class="{ 'editor__color-option--active': selectedColor === COLOR_WHITE }"
          @click="selectColor(COLOR_WHITE)"
        ></div>
        <div
          class="editor__color-option editor__color-option--special"
          :class="{ 'editor__color-option--active': selectedColor === COLOR_SPECIAL }"
          @click="selectColor(COLOR_SPECIAL)"
        >
          ✧
        </div>
        <div
          class="editor__color-option editor__color-option--clear"
          :class="{ 'editor__color-option--active': selectedColor === COLOR_CLEAR }"
          @click="selectColor(COLOR_CLEAR)"
        ></div>
        <button class="editor__color-apply" type="button" @click="applyColorToAll">
          Применить ко всем
        </button>
        <button class="editor__color-invert" type="button" @click="invertColors">
          Инверсия
        </button>
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
                :class="getDotClass(rowIndex, placeIndex)"
                @click="handleDotClick(rowIndex, placeIndex)"
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
                <span v-if="isSpecialDot(rowIndex, placeIndex)" class="editor__dot-symbol">✧</span>
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

      <div class="editor__timeline">
        <div class="editor__timeline-controls">
          <button class="editor__timeline-export" type="button" @click="downloadTimelineData">
            Выгрузить JSON
          </button>
          <InputComp
            class="editor__timeline-input"
            :value="timelineCountInput"
            placeholder="Кадры"
            type="number"
            mod="black"
            :maxlength="2"
            :max="99"
            @handleInput="handleTimelineCountInput"
          />
        </div>
        <div class="editor__timeline-blocks">
          <button
            v-for="blockIndex in timelineBlocks"
            :key="`timeline-block-${blockIndex}`"
            class="editor__timeline-block"
            :class="getTimelineBlockClass(blockIndex)"
            type="button"
            @click="selectTimeline(blockIndex)"
          >
            {{ blockIndex + 1 }}
          </button>
        </div>
        <div class="editor__timeline-code">
          <textarea
            v-model="timelineCode"
            class="editor__timeline-textarea"
            spellcheck="false"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import InputComp from '@/components/InputComp.vue'

const STORAGE_KEY = 'editor-config'
const COLOR_BLACK = 0
const COLOR_WHITE = 1
const COLOR_SPECIAL = -1
const COLOR_CLEAR = null

const rowsInput = ref('6')
const placesInput = ref('14')
const timelineCountInput = ref('10')
const hoveredDot = ref(null)
const gridRowsData = ref([])
const selectedColor = ref(COLOR_BLACK)
const timelineIndex = ref(0)
const seatStates = ref({})
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

const timelineCount = computed(() => {
  const value = parseInt(timelineCountInput.value, 10)
  if (isNaN(value) || value < 1) return 10
  return Math.min(value, 99)
})

const timelineBlocks = computed(() => Array.from({ length: timelineCount.value }, (_, index) => index))

const currentTimelineSeats = computed(() => {
  const timelineKey = timelineIndex.value
  return Object.entries(seatStates.value).reduce((acc, [seatKey, timelines]) => {
    if (Array.isArray(timelines) && timelines[timelineKey] !== undefined) {
      acc[seatKey] = timelines[timelineKey]
    }
    return acc
  }, {})
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

const selectColor = (color) => {
  selectedColor.value = color
}

const getSeatKey = (rowIndex, placeIndex) => `${rowIndex + 1}_${placeIndex + 1}`

const setSeatTimelineValue = (states, key, timelineKey, color) => {
  const seatTimeline = Array.isArray(states[key]) ? [...states[key]] : []
  seatTimeline[timelineKey] = color
  states[key] = seatTimeline
}

const timelineCode = computed({
  get() {
    const timelineKey = timelineIndex.value
    const data = {}

    Object.entries(seatStates.value).forEach(([seatKey, timelines]) => {
      if (!Array.isArray(timelines)) return
      const color = timelines[timelineKey]
      if (color === undefined || color === COLOR_CLEAR) return
      data[seatKey] = color
    })

    return JSON.stringify(data, null, 2)
  },
  set(value) {
    try {
      const parsed = JSON.parse(value)
      if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') return

      const timelineKey = timelineIndex.value
      const updatedSeatStates = { ...seatStates.value }

      Object.entries(parsed).forEach(([seatKey, color]) => {
        if (![COLOR_BLACK, COLOR_WHITE, COLOR_CLEAR, COLOR_SPECIAL].includes(color)) return
        setSeatTimelineValue(updatedSeatStates, seatKey, timelineKey, color)
      })

      seatStates.value = updatedSeatStates
      saveToLocalStorage()
    } catch (error) {
      console.error('Невалидный JSON таймлайна:', error)
    }
  }
})

const timelineExportData = computed(() => {
  const frames = Array.from({ length: timelineCount.value }, (_, frameIndex) => {
    const seats = {}

    Object.entries(seatStates.value).forEach(([seatKey, timelines]) => {
      if (!Array.isArray(timelines)) return
      const color = timelines[frameIndex]
      if (color === undefined || color === COLOR_CLEAR) return
      seats[seatKey] = color
    })

    return {
      index: frameIndex,
      seats
    }
  })

  return {
    meta: {
      rows: rows.value,
      places: places.value,
      timelineCount: timelineCount.value,
      grid: gridRowsData.value.map(row => row.length)
    },
    frames
  }
})

const handleDotClick = (rowIndex, placeIndex) => {
  const key = getSeatKey(rowIndex, placeIndex)
  const timelineKey = timelineIndex.value
  const updatedSeatStates = { ...seatStates.value }

  setSeatTimelineValue(updatedSeatStates, key, timelineKey, selectedColor.value)
  seatStates.value = updatedSeatStates
  saveToLocalStorage()
}

const downloadTimelineData = () => {
  if (typeof window === 'undefined') return

  try {
    const exportBase = timelineExportData.value
    const payload = {
      ...exportBase,
      meta: {
        ...exportBase.meta,
        generatedAt: new Date().toISOString()
      }
    }

    const fileContent = JSON.stringify(payload, null, 2)
    const blob = new Blob([fileContent], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    link.href = url
    link.download = `scenes-export-${timestamp}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Ошибка при выгрузке таймлайна:', error)
  }
}

const getDotClass = (rowIndex, placeIndex) => {
  const key = getSeatKey(rowIndex, placeIndex)
  const color = currentTimelineSeats.value[key]
  if (color === undefined || color === COLOR_CLEAR) return null

  if (color === COLOR_BLACK) return 'editor__dot--black'
  if (color === COLOR_WHITE) return 'editor__dot--white'
  if (color === COLOR_SPECIAL) return 'editor__dot--special'
  return null
}

const isSpecialDot = (rowIndex, placeIndex) => {
  const key = getSeatKey(rowIndex, placeIndex)
  return currentTimelineSeats.value[key] === COLOR_SPECIAL
}

const handleRowsInput = (event) => {
  rowsInput.value = event.target.value
}

const handlePlacesInput = (event) => {
  placesInput.value = event.target.value
}

const handleTimelineCountInput = (event) => {
  timelineCountInput.value = event.target.value
}

const selectTimeline = (index) => {
  if (index >= 0 && index < timelineCount.value) {
    timelineIndex.value = index
    saveToLocalStorage()
  }
}

const getTimelineBlockClass = (blockIndex) => {
  return blockIndex === timelineIndex.value ? 'editor__timeline-block--active' : null
}

const applyColorToAll = () => {
  const color = selectedColor.value
  const timelineKey = timelineIndex.value
  const updatedSeatStates = { ...seatStates.value }

  gridRowsData.value.forEach((row, rowIndex) => {
    row.forEach((_, placeIndex) => {
      const key = getSeatKey(rowIndex, placeIndex)
      setSeatTimelineValue(updatedSeatStates, key, timelineKey, color)
    })
  })

  seatStates.value = updatedSeatStates
  saveToLocalStorage()
}

const invertColors = () => {
  const timelineKey = timelineIndex.value
  const updatedSeatStates = { ...seatStates.value }

  Object.entries(updatedSeatStates).forEach(([key, timelines]) => {
    if (!Array.isArray(timelines)) return
    const currentColor = timelines[timelineKey]

    if (currentColor === COLOR_BLACK) {
      setSeatTimelineValue(updatedSeatStates, key, timelineKey, COLOR_WHITE)
    } else if (currentColor === COLOR_WHITE) {
      setSeatTimelineValue(updatedSeatStates, key, timelineKey, COLOR_BLACK)
    }
  })

  seatStates.value = updatedSeatStates
  saveToLocalStorage()
}

// Сохранение конфигурации в localStorage
const saveToLocalStorage = () => {
  if (!isLoaded.value) return // Не сохраняем до завершения загрузки

  try {
    const config = {
      rows: rowsInput.value,
      places: placesInput.value,
      gridRowsData: gridRowsData.value.map(row => row.length),
      seatStates: seatStates.value,
      timelineIndex: timelineIndex.value,
      selectedColor: selectedColor.value,
      timelineCount: timelineCountInput.value
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

      if (config.seatStates && typeof config.seatStates === 'object') {
        seatStates.value = config.seatStates
      }

      if (typeof config.timelineIndex === 'number') {
        timelineIndex.value = config.timelineIndex
      }

      if ([COLOR_BLACK, COLOR_WHITE, COLOR_CLEAR, COLOR_SPECIAL].includes(config.selectedColor)) {
        selectedColor.value = config.selectedColor
      }

      if (config.timelineCount) {
        timelineCountInput.value = config.timelineCount
      }
    }
    isLoaded.value = true
  } catch (error) {
    console.error('Ошибка при загрузке из localStorage:', error)
    isLoaded.value = true
  }
}

// Отслеживание изменений для автоматического сохранения
watch([rowsInput, placesInput, timelineCountInput], () => {
  saveToLocalStorage()
}, { deep: true })

watch(gridRowsData, () => {
  saveToLocalStorage()
}, { deep: true })

watch(seatStates, () => {
  saveToLocalStorage()
}, { deep: true })

watch(timelineCount, (newCount) => {
  if (timelineIndex.value >= newCount) {
    timelineIndex.value = Math.max(0, newCount - 1)
  }
})

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

.editor__timeline {
  margin-top: 3rem;
  background: $color-white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor__timeline-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.editor__timeline-input {
  max-width: 12rem;
  width: 100%;
  flex: 1 1 12rem;
}

.editor__timeline-export {
  padding: 0.8rem 1.6rem;
  background: $color-primary;
  color: $color-white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.4rem;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  @include hover {
    &:hover {
      background: $color-primary-dark;
      transform: translateY(-0.1rem);
    }
  }
}

.editor__timeline-blocks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(4rem, 1fr));
  gap: 0.8rem;
}

.editor__timeline-block {
  padding: 0.8rem 0.4rem;
  border: 0.2rem solid $color-gray-300;
  border-radius: 0.5rem;
  background: $color-gray-100;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: $font-weight-medium;
  color: $color-gray-700;
  transition: all 0.2s ease;

  @include hover {
    &:hover {
      border-color: $color-primary;
      color: $color-primary;
    }
  }

  &--active {
    background: $color-primary;
    border-color: $color-primary;
    color: $color-white;
    box-shadow: 0 0.4rem 1rem rgba($color-primary, 0.25);

    @include hover {
      &:hover {
        color: $color-white;
        border-color: $color-primary;
      }
    }
  }
}

.editor__timeline-code {
  display: flex;
  flex-direction: column;
}

.editor__timeline-textarea {
  width: 100%;
  min-height: 16rem;
  border: 0.2rem solid $color-gray-300;
  border-radius: 0.5rem;
  padding: 1rem;
  font-family: 'Roboto Mono', monospace;
  font-size: 1.3rem;
  line-height: 1.5;
  color: $color-gray-700;
  resize: vertical;
  background: $color-gray-100;

  &:focus {
    border-color: $color-primary;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba($color-primary, 0.15);
  }
}

.editor__color-picker {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.editor__color-option {
  width: 3rem;
  height: 3rem;
  border-radius: 0.4rem;
  border: 0.2rem solid transparent;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;

  &--black {
    background: $color-black;
  }

  &--white {
    background: $color-white;
    border: 0.2rem solid $color-gray-300;
  }

  &--special {
    background: $color-gray-500;
    color: $color-white;
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &--clear {
    background: $color-gray-200;
    position: relative;
  }

  &--active {
    border-color: $color-primary;
    transform: scale(1.08);
  }
}

.editor__color-apply {
  padding: 0.8rem 1.6rem;
  background: $color-primary;
  color: $color-white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.4rem;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  @include hover {
    &:hover {
      background: $color-primary-dark;
      transform: translateY(-0.1rem);
    }
  }
}

.editor__color-invert {
  padding: 0.8rem 1.6rem;
  background: $color-white;
  color: $color-black;
  border: 0.2rem solid $color-black;
  border-radius: 0.5rem;
  font-size: 1.4rem;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;

  @include hover {
    &:hover {
      background: $color-black;
      color: $color-white;
      transform: translateY(-0.1rem);
    }
  }
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

  &--black {
    background: $color-black;
  }

  &--white {
    background: $color-white;
    border: 0.1rem solid $color-gray-400;
  }

  &--special {
    background: $color-gray-500;
    color: $color-white;
  }
}

.editor__dot-symbol {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -52%);
  font-size: 1.4rem;
  color: inherit;
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

  .editor__timeline {
    margin-top: 1.5rem;
    padding: 1.5rem;
  }

  .editor__timeline-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .editor__timeline-export {
    width: 100%;
    text-align: center;
  }

  .editor__timeline-blocks {
    grid-template-columns: repeat(auto-fit, minmax(3.5rem, 1fr));
    gap: 0.6rem;
  }

  .editor__timeline-textarea {
    min-height: 12rem;
  }

  .editor__color-picker {
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .editor__color-option {
    width: 2.5rem;
    height: 2.5rem;
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

