<template>
  <div class="carousel">
    <swiper
      :modules="[SwiperAutoplay, SwiperPagination]"
      :slides-per-view="1"
      :space-between="30"
      :loop="true"
      :autoplay="{
        delay: 3000,
        disableOnInteraction: false,
      }"
      :pagination="{
        clickable: true,
      }"
      class="carousel__swiper"
    >
      <swiper-slide v-for="(slide, index) in slides" :key="index" class="carousel__slide">
        <img :src="slide.image" :alt="slide.title" class="carousel__image" />
        <div class="carousel__content">
          <h3 class="carousel__title">{{ slide.title }}</h3>
          <p class="carousel__description">{{ slide.description }}</p>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const SwiperAutoplay = Autoplay
const SwiperPagination = Pagination

const slides = [
  {
    image: '/images/slide1.jpg',
    title: 'Игровые виджеты',
    description: 'Увлекательные игры для вашего сайта'
  },
  {
    image: '/images/slide2.jpg',
    title: 'Простая интеграция',
    description: 'Быстрое внедрение на любой сайт'
  },
  {
    image: '/images/slide3.jpg',
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
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    color: white;
  }

  &__title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  &__description {
    font-size: 1.2rem;
    opacity: 0.9;
  }
}

:deep() {
  .swiper-pagination-bullet {
    background: white;
    opacity: 0.5;

    &-active {
      opacity: 1;
    }
  }
}
</style>
