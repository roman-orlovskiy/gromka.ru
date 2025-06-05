<template>
  <div class="carousel">
    <swiper
      :modules="[SwiperAutoplay, SwiperPagination, SwiperNavigation]"
      :slides-per-view="1"
      :space-between="30"
      :loop="true"
      :allow-touch-move="false"
      :autoplay="{
        delay: 3000,
        disableOnInteraction: true,
        disableOnMouseEnter: true,
      }"
      :pagination="{
        clickable: true,
      }"
      :navigation="true"
      class="carousel__swiper"
    >
      <swiper-slide v-for="(slide, index) in slides" :key="index" class="carousel__slide">
        <div class="carousel__content">
          <component
            :is="slide.component"
            v-bind="slide.props"
            class="carousel__component"
          />
          <h3 class="carousel__title">{{ slide.title }}</h3>
          <p class="carousel__description">{{ slide.description }}</p>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import ButtonComp from '@/components/ButtonComp.vue'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const SwiperAutoplay = Autoplay
const SwiperPagination = Pagination
const SwiperNavigation = Navigation

const slides = [
  {
    component: ButtonComp,
    props: {
      mod: 'gradient-3',
      text: 'Начать игру'
    },
    title: 'Игровые виджеты',
    description: 'Увлекательные игры для вашего сайта'
  },
  {
    component: ButtonComp,
    props: {
      mod: 'gradient-5',
      text: 'Интегрировать'
    },
    title: 'Простая интеграция',
    description: 'Быстрое внедрение на любой сайт'
  },
  {
    component: ButtonComp,
    props: {
      mod: 'gradient-4',
      text: 'Узнать больше'
    },
    title: 'Увеличение вовлеченности',
    description: 'Привлекайте больше пользователей'
  }
]
</script>

<style lang="scss">
.carousel {
  width: 100%;
  max-width: 75rem;
  margin: 0 auto;
  padding: 2rem 0;

  &__swiper {
    width: 100%;
    height: 25rem;
    border-radius: 0.75rem;
    overflow: hidden;
  }

  &__slide {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    text-align: center;
    padding: 2rem;
    color: $color-white;
  }

  &__component {
    margin-bottom: 2rem;
  }

  &__title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  &__description {
    font-size: 1.2rem;
    opacity: 0.9;
  }

  .swiper-button-next,
  .swiper-button-prev {
    color: $color-white !important;
    background: transparent !important;
    width: 3rem !important;
    height: 3rem !important;
    transition: all 0.3s ease !important;

    &::after {
      font-size: 2.5rem !important;
      font-weight: bold !important;
      color: $color-white !important;
    }

    &:hover {
      color: rgba($color-white, 0.8) !important;
      transform: scale(1.1) !important;

      &::after {
        color: rgba($color-white, 0.8) !important;
      }
    }
  }

  .swiper-pagination {
    .swiper-pagination-bullet {
      width: 0.75rem !important;
      height: 0.75rem !important;
      background: $color-white !important;
      opacity: 0.5 !important;
      transition: all 0.3s ease !important;

      &-active {
        opacity: 1 !important;
        transform: scale(1.2) !important;
      }
    }
  }

  .swiper-button-disabled {
    opacity: 0.35 !important;
    cursor: auto !important;
    pointer-events: none !important;
  }
}
</style>
