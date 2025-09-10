<template>
  <div class="spartak">
    <div class="spartak__content">
      <div class="spartak__title">Разверни экран к полю</div>

      <div class="spartak__instructions">
        <div class="spartak__instruction-item">
          <div>
            <div class="spartak__instruction-number">1</div>
          </div>
          <div class="spartak__instruction-text">
            Включи на телефоне <b>яркость&nbsp;на&nbsp;максимум</b>
          </div>
        </div>
        <div class="spartak__instruction-item">
          <div>
            <div class="spartak__instruction-number">2</div>
          </div>
          <div class="spartak__instruction-text">
            Нажми "Начать" и <b>разверни&nbsp;экран&nbsp;к&nbsp;полю</b>
          </div>
        </div>
      </div>

      <div class="spartak__button">
        <ButtonComp mod="spartak" @click="handleStart">Начать</ButtonComp>
      </div>
    </div>

    <transition name="fade">
      <div class="spartak__layer" v-if="isLayerVisible">
        <div class="spartak__close-button" @click="handleCloseLayer">
          <CloseIcon />
        </div>

        <transition name="fade">
          <div class="spartak__instructions" v-if="isInstructionVisible">
            <div class="spartak__instruction-item">
              <div>
                <div class="spartak__instruction-number">1</div>
              </div>
              <div class="spartak__instruction-text">
                Включи на телефоне <b>яркость&nbsp;на&nbsp;максимум</b>
              </div>
            </div>
            <div class="spartak__instruction-item">
              <div>
                <div class="spartak__instruction-number">2</div>
              </div>
              <div class="spartak__instruction-text">
                <b>Разверни&nbsp;экран&nbsp;к&nbsp;полю</b>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import ButtonComp from '@/components/ButtonComp.vue'
import CloseIcon from '@/components/icons/CloseIcon.vue'
import { ref, onBeforeUnmount } from 'vue'
import { connectConnectionsWS } from '@/services/api'

const isLayerVisible = ref(false)
const isInstructionVisible = ref(true)
let wakeLock = null

// WebSocket instance
let ws = null

// Converts Blob or string to text (universal fallback)
const blobToText = async (data) => {
  if (typeof data === 'string') return data
  if (data && typeof data.text === 'function') return await data.text()
  return await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsText(data)
  })
}

const requestWakeLock = async () => {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
    }
  } catch (err) {
    console.error('Ошибка при запросе Wake Lock:', err)
  }
}

const releaseWakeLock = async () => {
  if (wakeLock) {
    try {
      await wakeLock.release()
      wakeLock = null
    } catch (err) {
      console.error('Ошибка при освобождении Wake Lock:', err)
    }
  }
}

let instructionTimeout = null

const handleStart = () => {
  isLayerVisible.value = true
  isInstructionVisible.value = true
  enterFullscreen()
  requestWakeLock()

  // Open WS connection
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    try {
      console.log('Connecting to WS')
      ws = connectConnectionsWS()
      ws.onopen = () => {
        console.log('WS connected')
        ws.send('ping');
      }
      ws.onmessage = async (event) => {
        const message = await blobToText(event.data)
        console.log('WS message:', message)
      }
      ws.onerror = (event) => {
        console.error('WS error:', event)
      }
      ws.onclose = () => {
        console.log('WS closed')
      }
    } catch (e) {
      console.error('Не удалось открыть WebSocket:', e)
    }
  }

  clearTimeout(instructionTimeout)
  instructionTimeout = setTimeout(() => {
    isInstructionVisible.value = false
  }, 7000)
}

const enterFullscreen = () => {
  const element = document.documentElement
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  }
}

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

const handleCloseLayer = () => {
  isLayerVisible.value = false
  clearTimeout(instructionTimeout)
  exitFullscreen()
  releaseWakeLock()

  // Close WS connection
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
  ws = null
}

onBeforeUnmount(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
  ws = null
  clearTimeout(instructionTimeout)
  releaseWakeLock()
})
</script>

<style scoped lang="scss">
.spartak {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 2rem 6rem 2rem;
  min-height: 100%;
  background-color: $color-gray-100;

  &__title {
    font-size: 2.3rem;
    font-weight: $font-weight-bold;
    color: $color-spartak;
    margin-bottom: 1rem;
    width: 100%;
    text-align: center;
    line-height: 1.2;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    width: 100%;
    max-width: 120rem;
  }

  &__instructions {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 2rem;
    width: 100%;
    max-width: 40rem;
  }

  &__instruction-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__instruction-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.4rem;
    height: 3.4rem;
    background-color: $color-spartak;
    color: $color-white;
    border-radius: 50%;
    font-weight: $font-weight-bold;
    font-size: 1.6rem;
  }

  &__instruction-text {
    font-size: 1.6rem;
    color: $color-gray-700;

    b {
      font-weight: $font-weight-bold;
    }
  }

  &__layer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: $color-spartak;
    animation: spartakColorShift 2.2s infinite;
    z-index: 1000;
    color: $color-white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;

    & .spartak__instruction-text {
      color: $color-white;
    }

    & .spartak__instruction-item {
      &:last-child {
        & .spartak__instruction-text {
          font-size: 2.5rem;
        }
      }
    }

    &--info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
    }
  }

  &__close-button {
    position: absolute;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 3.2rem;
      height: 3.2rem;
      fill: rgba($color-white, 0.5);
    }
  }

  &__button {
    margin-top: 2rem;
  }
}

@keyframes spartakColorShift {
  0% {
    background-color: $color-spartak;
  }
  25% {
    background-color: $color-spartak;
  }
  70% {
    background-color: $color-white;
  }
  100% {
    background-color: $color-spartak;
  }
}
</style>


