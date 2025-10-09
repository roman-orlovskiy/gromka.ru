<template>
  <transition name="fade">
    <div v-if="isOpen" class="gallery" @click="closeGallery">
      <div class="gallery__content" @click.stop>
        <button class="gallery__close" @click="closeGallery">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <swiper
          :modules="modules"
          :initial-slide="initialSlide"
          :navigation="true"
          :pagination="{ clickable: true }"
          :keyboard="{ enabled: true }"
          :loop="true"
          class="gallery__swiper"
        >
          <swiper-slide v-for="(image, index) in images" :key="index">
            <div class="gallery__slide">
              <img :src="image.src" :alt="image.alt" class="gallery__image" />
              <div class="gallery__caption">{{ image.caption }}</div>
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  images: {
    type: Array,
    required: true
  },
  initialSlide: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

const modules = [Navigation, Pagination, Keyboard]

const closeGallery = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
.gallery {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;

  &__content {
    width: 90%;
    height: 90%;
    max-width: 120rem;
    position: relative;
  }

  &__close {
    position: absolute;
    top: 2rem;
    right: 2rem;
    width: 4rem;
    height: 4rem;
    border: none;
    background: rgba($color-white, 0.2);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    color: $color-white;
    z-index: 100;

    &:hover {
      background: rgba($color-white, 0.3);
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }

    svg {
      width: 2.4rem;
      height: 2.4rem;
    }

    @include layout-aspect-mobile {
      top: 1rem;
      right: 1rem;
      width: 3.5rem;
      height: 3.5rem;

      svg {
        width: 2rem;
        height: 2rem;
      }
    }
  }

  &__swiper {
    width: 100%;
    height: 100%;
  }

  &__slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 4rem;

    @include layout-aspect-mobile {
      padding: 2rem;
    }
  }

  &__image {
    max-width: 100%;
    max-height: calc(100% - 6rem);
    object-fit: contain;
    border-radius: 1rem;
  }

  &__caption {
    margin-top: 2rem;
    color: $color-white;
    font-size: 2rem;
    text-align: center;
    font-weight: $font-weight-medium;

    @include layout-aspect-mobile {
      font-size: 1.6rem;
      margin-top: 1rem;
    }
  }
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: $color-white;

  &::after {
    font-size: 3rem;

    @include layout-aspect-mobile {
      font-size: 2rem;
    }
  }
}

:deep(.swiper-pagination-bullet) {
  background: $color-white;
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
}
</style>

