<template>
  <div class="performance">
    <!-- Hero Section -->
    <section class="performance__hero">
      <h1 class="performance__title">Gromka  – платформа для перформансов</h1>
      <p class="performance__subtitle">Рисуйте динамические картины с помощью экранов телефонов</p>
      <div class="performance__hero-video">
        <video class="performance__video" autoplay loop muted src="/videos/gromka.mp4" type="video/mp4">
        Ваш браузер не поддерживает видео.
      </video>
    </div>
      <button @click="scrollToProject" class="performance__cta-link">
        <ButtonComp mod="secondary">Что это за проект</ButtonComp>
      </button>
    </section>

    <!-- What is it Section -->
    <section id="what-is-project" class="performance__section performance__section--gradient-1">
      <div class="performance__container">
        <h2 class="performance__section-title">Что это за проект?</h2>
        <div class="performance__content">
          <div class="performance__text">
            <p>Платформа для создания интерактивных световых перформансов с помощью мобильных устройств зрителей. Каждый телефон становится частью единого визуального шоу, формируя динамичные световые картины.</p>
            <ul class="performance__list">
              <li>● <strong>Разноцветные картины</strong> через экраны смартфонов</li>
              <li>● <strong>Динамичные эффекты</strong> с помощью экранов или фонариков</li>
              <li>● <strong>Синхронные волны</strong> света по всему залу или стадиону</li>
            </ul>
          </div>
          <div class="performance__image-container">
            <img
              src="@/assets/images/home/1.webp"
              alt="Световое шоу на стадионе с экранами телефонов"
              class="performance__image"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Video Section -->
    <section class="performance__demo">
      <div class="performance__video-block">
        <div class="performance__video-container" @click="toggleVideo">
        <video
          ref="verticalVideo"
            class="performance__vertical-video"
          src="/videos/demo.mp4"
          type="video/mp4"
          loop
        >
          Ваш браузер не поддерживает видео.
        </video>
        <button
          v-if="!isVideoPlaying"
            class="performance__play-button"
        >
          {{ videoStarted ? '▶ Продолжить' : '▶ Запустить видео' }}
        </button>
        <button
          v-else
            class="performance__pause-button"
        >
          ⏸ Пауза
        </button>
      </div>
    </div>
    </section>

    <!-- Advantages Section -->
    <section class="performance__section performance__section--gradient-2">
      <div class="performance__container">
        <h2 class="performance__section-title">Преимущества</h2>
        <div class="performance__grid">
          <div class="performance__card">
            <div class="performance__card-icon">▲</div>
            <h3 class="performance__card-title">Масштабируемость</h3>
            <p>От небольших залов до стадионов</p>
          </div>
          <div class="performance__card">
            <div class="performance__card-icon">◆</div>
            <h3 class="performance__card-title">Простота участия</h3>
            <p>Переход по ссылке и ввод номера места/геолокации</p>
          </div>
          <div class="performance__card">
            <div class="performance__card-icon">★</div>
            <h3 class="performance__card-title">Визуальный эффект</h3>
            <p>Тысячи экранов создают синхронное световое шоу</p>
          </div>
          <div class="performance__card">
            <div class="performance__card-icon">◉</div>
            <h3 class="performance__card-title">Гибкость</h3>
            <p>Адаптация под концерты, спектакли, митинги, спортивные мероприятия</p>
          </div>
          <div class="performance__card performance__card--highlighted">
            <div class="performance__card-icon">■</div>
            <h3 class="performance__card-title">Монетизация</h3>
            <p>Через рекламу и брендированные активности</p>
          </div>
          <div class="performance__card">
            <div class="performance__card-icon">●</div>
            <h3 class="performance__card-title">Взаимодействие</h3>
            <p>Через браузер или ТГ бот с последующей монетизацией</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stadium Photo Section -->
    <section class="performance__section performance__section--stadium">
      <div class="performance__container">
        <h2 class="performance__section-title">Реальный запуск на стадионе Спартак</h2>
        <div class="performance__stadium-block">
          <div class="performance__image-container performance__image-container--large">
            <img
              src="@/assets/images/home/spartak.webp"
              alt="Реальный запуск на стадионе Спартак"
              class="performance__image"
            />
          </div>
          <div class="performance__stadium-info">
            <p>Даже при неполной посадке можно создавать<br>визуальные волны или мерцания на стадионе.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Target Audience Section -->
    <section class="performance__section performance__section--gradient-3">
      <div class="performance__container">
        <h2 class="performance__section-title">Для кого этот проект?</h2>
        <div class="performance__grid performance__grid--two-cols">
          <div class="performance__target-card">
            <div class="performance__target-icon">♪</div>
            <h3>Организаторы концертов и фестивалей</h3>
            <p>Создание уникального светового опыта для зрителей</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">◈</div>
            <h3>Спортивные клубы и стадионы</h3>
            <p>Усиление атмосферы на матчах и спортивных мероприятиях</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">◐</div>
            <h3>Театральные постановки</h3>
            <p>Интеграция зрителей в спектакль</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">▶</div>
            <h3>Маркетологи и бренды</h3>
            <p>Нестандартные рекламные форматы</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">◆</div>
            <h3>Политические организации</h3>
            <p>Флешмобы и митинги с массовым участием</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">◉</div>
            <h3>Общественные мероприятия</h3>
            <p>Создание запоминающихся визуальных эффектов</p>
          </div>
        </div>
      </div>
    </section>

    <!-- What is it like Section -->
    <section class="performance__section performance__section--gradient-4">
      <div class="performance__container">
        <h2 class="performance__section-title">На что это может быть похоже?</h2>
        <div class="performance__comparison">
          <div class="performance__comparison-item">
            <div class="performance__image-placeholder">
              <span>Xylobands на концертах Coldplay</span>
            </div>
            <h3>Световые шоу на стадионах</h3>
            <p>Браслеты Xylobands на концертах Coldplay</p>
          </div>
          <div class="performance__comparison-item">
            <div class="performance__image-placeholder">
              <span>Дрон-шоу в небе</span>
            </div>
            <h3>Дроны-шоу</h3>
            <p>Но с использованием мобильных устройств зрителей</p>
          </div>
          <div class="performance__comparison-item">
            <div class="performance__image-placeholder">
              <span>Интерактивный перформанс</span>
            </div>
            <h3>Интерактивные перформансы</h3>
            <p>С активным участием зрителей</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Goal Section -->
    <section class="performance__section performance__section--accent">
      <div class="performance__container">
        <h2 class="performance__section-title">Наша цель</h2>
        <div class="performance__goal">
          <p class="performance__goal-text">
            Создать инновационный инструмент для организации массовых интерактивных шоу,
            увеличивая вовлеченность зрителей и открывая новые возможности для рекламы и брендирования.
          </p>
        </div>
      </div>
    </section>


    <!-- Monetization Section -->
    <section class="performance__section performance__section--success">
      <div class="performance__container">
        <h2 class="performance__section-title">Монетизация</h2>
        <div class="performance__grid performance__grid--four-cols">
          <div class="performance__monetization-card">
            <div class="performance__monetization-icon">◆</div>
            <h3>Спецпроекты</h3>
            <p>2-3 млн за перформанс</p>
          </div>
          <div class="performance__monetization-card">
            <div class="performance__monetization-icon">◉</div>
            <h3>Рекламные интеграции</h3>
            <p>Брендированные активности</p>
          </div>
          <div class="performance__monetization-card">
            <div class="performance__monetization-icon">■</div>
            <h3>Сувениры и реклама</h3>
            <p>Продажа через платформу</p>
          </div>
          <div class="performance__monetization-card">
            <div class="performance__monetization-icon">▲</div>
            <h3>Фрибеты и ставки</h3>
            <p>На текущее мероприятие</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="performance__section performance__section--primary">
      <div class="performance__container">
        <h2 class="performance__section-title">Команда разработки</h2>
        <div class="performance__team">
          <div class="performance__team-item">
            <div class="performance__team-icon">◆</div>
            <h3>Фронтенд-разработчик</h3>
            <p>Постоянный член команды</p>
          </div>
          <div class="performance__team-item">
            <div class="performance__team-icon">◉</div>
            <h3>Бэкенд-разработчик</h3>
            <p>Периодически подключается к проекту</p>
          </div>
        </div>
    </div>
    </section>

    <!-- CTA Section -->
    <section class="performance__cta">
      <div class="performance__container">
        <h2 class="performance__cta-title">Готовы создать незабываемое шоу?</h2>
        <p class="performance__cta-text">Напишите нам и мы сделаем перформанс под вашу площадку</p>
        <a href="https://t.me/orlovskiy_rl" target="_blank" class="performance__cta-link">
          <ButtonComp>Написать в Telegram</ButtonComp>
        </a>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'

const verticalVideo = ref(null)
const isVideoPlaying = ref(false)
const videoStarted = ref(false)

const toggleVideo = () => {
  if (verticalVideo.value) {
    if (isVideoPlaying.value) {
      verticalVideo.value.pause()
      isVideoPlaying.value = false
    } else {
      verticalVideo.value.play()
      isVideoPlaying.value = true
      videoStarted.value = true
    }
  }
}

const scrollToProject = () => {
  const element = document.getElementById('what-is-project')
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}
</script>
<style lang="scss" scoped>
.performance {
  flex: auto;
  display: flex;
  flex-direction: column;
  width: 100%;

  /* Hero Section */
  &__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
    padding: 4rem 2rem;
    background: linear-gradient(-45deg, #667eea, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #667eea);
    background-size: 600% 600%;
    animation: gradientShift 12s ease infinite;
    color: $color-white;

  @include layout-aspect-mobile {
    padding: 2rem 1rem;
    }
  }

  &__title {
    font-size: 4rem;
    font-weight: $font-weight-extra-bold;
    margin-bottom: 1.5rem;
    text-align: center;
    text-shadow: 0 0.2rem 0.4rem rgba($color-black, 0.3);

    @include layout-aspect-mobile {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
  }

  &__subtitle {
    font-size: 2rem;
    font-weight: $font-weight-medium;
    margin-bottom: 3rem;
    text-align: center;
    opacity: 0.95;

    @include layout-aspect-mobile {
      font-size: 1.5rem;
      margin-bottom: 2rem;
    }
  }

  &__hero-video {
    width: 90%;
    max-width: 80rem;
    height: auto;
    aspect-ratio: 16/9;
    background-color: $color-black;
    border-radius: 1.5rem;
    border: 3px solid rgba($color-white, 0.3);
    box-shadow: 0 1rem 3rem rgba($color-black, 0.5);
    overflow: hidden;
    margin-bottom: 3rem;

    @include layout-aspect-mobile {
      width: 100%;
      margin-bottom: 2rem;
    }
  }

  &__video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Section Styles */
  &__section {
    padding: 5rem 2rem;

    @include layout-aspect-mobile {
      padding: 3rem 1rem;
    }

    &--gradient-1 {
      background: $gradient-section-1;
    }

    &--gradient-2 {
      background: $gradient-section-2;
    }

    &--gradient-3 {
      background: $gradient-section-3;
    }

    &--gradient-4 {
      background: $gradient-section-4;
    }

    &--gradient-5 {
      background: $gradient-section-5;
    }

    &--accent {
      background: $gradient-accent;
      color: $color-white;
    }

    &--success {
      background: $gradient-success;
      color: $color-white;
    }

    &--primary {
      background: $gradient-primary;
      color: $color-white;
    }

    &--dark {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: $color-white;
    }

    &--stadium {
      background: $gradient-red;
      color: $color-white;
    }
  }

  &__container {
    max-width: 120rem;
    margin: 0 auto;
  }

  &__section-title {
    font-size: 3.5rem;
    font-weight: $font-weight-bold;
    text-align: center;
    margin-bottom: 3rem;

    @include layout-aspect-mobile {
      font-size: 2.5rem;
      margin-bottom: 2rem;
    }
  }

  /* Content Grid */
  &__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;

    @include layout-aspect-mobile {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  &__text {
    font-size: 1.6rem;
    line-height: 1.8;

    p {
      margin-bottom: 1.5rem;
    }

    strong {
      font-weight: $font-weight-bold;
    }
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 2rem 0;

    li {
      padding: 1rem 0;
      font-size: 1.6rem;
      line-height: 1.6;
    }
  }

  /* Image Placeholders */
  &__image-placeholder {
    background: linear-gradient(135deg, rgba($color-white, 0.9) 0%, rgba($color-white, 0.7) 100%);
    border: 2px dashed $color-gray-400;
    border-radius: 1rem;
    padding: 3rem;
    min-height: 20rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: $color-gray-600;
    font-size: 1.4rem;
    font-weight: $font-weight-medium;

    &--large {
      min-height: 30rem;
    }

    @include layout-aspect-mobile {
      min-height: 15rem;
      padding: 2rem;

      &--large {
        min-height: 20rem;
      }
    }
  }

  /* Image Container */
  &__image-container {
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 0.5rem 2rem rgba($color-black, 0.2);
    background: $color-white;

    &--large {
      min-height: 30rem;
      box-shadow: 0 1rem 3rem rgba($color-black, 0.3);
      border: 2px solid rgba($color-spartak, 0.3);

      @include layout-aspect-mobile {
        min-height: 20rem;
      }
    }
  }

  &__image {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    min-height: 20rem;

    @include layout-aspect-mobile {
      min-height: 15rem;
    }
  }

  /* Demo Video */
  &__demo {
    padding: 2rem;
    background: $gradient-mint-teal;
  }

  &__video-block {
    width: 100%;
    max-width: 42rem;
    margin: 0 auto;
    padding: 1rem;

    @include layout-aspect-mobile {
      padding: 1rem;
    }
  }

  &__video-container {
    width: 100%;
    position: relative;
    margin: 0 auto;
    background: $gradient-mint-teal;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 0.5rem 0.5rem rgba($color-black, 0.5);
    cursor: pointer;
  }

  &__vertical-video {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  &__play-button,
  &__pause-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 1.5rem 3rem;
    font-size: 1.8rem;
    font-weight: $font-weight-bold;
    color: $color-white;
    background: $gradient-primary;
    border: none;
    border-radius: 5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0.5rem 1.5rem rgba($color-black, 0.3);
    pointer-events: none;
    white-space: nowrap;

    &:hover {
      transform: translate(-50%, -50%) scale(1.05);
      box-shadow: 0 0.7rem 2rem rgba($color-black, 0.4);
    }

    @include layout-aspect-mobile {
      padding: 1rem 2rem;
      font-size: 1.5rem;
    }
  }

  &__pause-button {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &__video-container:hover &__pause-button {
    opacity: 1;
  }

  /* Grid Layouts */
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;

    @include layout-aspect-mobile {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    &--two-cols {
      grid-template-columns: repeat(2, 1fr);

      @include layout-aspect-mobile {
        grid-template-columns: 1fr;
      }
    }

    &--four-cols {
      grid-template-columns: repeat(4, 1fr);

      @include layout-aspect-mobile {
        grid-template-columns: 1fr;
      }
    }
  }

  /* Cards */
  &__card {
    background: rgba($color-white, 0.95);
    border-radius: 1.5rem;
    padding: 2.5rem;
    box-shadow: 0 0.5rem 2rem rgba($color-black, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    text-align: center;

    &:hover {
      transform: translateY(-0.5rem);
      box-shadow: 0 1rem 3rem rgba($color-black, 0.2);
    }
  }

  &__card-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
  }

  &__card-title {
    font-size: 2rem;
    font-weight: $font-weight-bold;
    margin-bottom: 1rem;
    color: $color-black;
  }

  &__card p {
    font-size: 1.5rem;
    color: $color-gray-700;
    line-height: 1.6;
  }

  &__card--highlighted {
    background: linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #667eea, #ff6b6b);
    background-size: 600% 600%;
    animation: gradientShift 12s ease infinite;
    color: $color-white;
    border: 2px solid rgba($color-white, 0.3);

    .performance__card-title {
      color: $color-white;
      text-shadow: 0 0.1rem 0.3rem rgba($color-black, 0.3);
    }

    p {
      color: rgba($color-white, 0.9);
      text-shadow: 0 0.1rem 0.2rem rgba($color-black, 0.2);
    }
  }

  /* Stadium Block */
  &__stadium-block {
    background: $color-white;
    border-radius: 2rem;
    padding: 3rem;
    box-shadow: 0 1rem 3rem rgba($color-black, 0.3);
    border: 3px solid rgba($color-white, 0.8);
    text-align: center;
    max-width: 90rem;
    margin: 0 auto;

    @include layout-aspect-mobile {
      padding: 2rem;
      border-radius: 1.5rem;
    }
  }

  &__stadium-info {
    background: rgba($color-gray-100, 0.5);
    border-radius: 1rem;
    padding: 2rem;
    font-size: 2.2rem;
    line-height: 1.8;
    color: $color-black;
    margin-top: 2rem;

    @include layout-aspect-mobile {
      font-size: 1.8rem;
    }

    p {
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    strong {
      color: $color-spartak;
      font-weight: $font-weight-bold;
    }
  }

  /* Target Cards */
  &__target-card {
    background: rgba($color-white, 0.95);
    border-radius: 1.5rem;
    padding: 2.5rem;
    box-shadow: 0 0.5rem 2rem rgba($color-black, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-0.5rem);
    }

    h3 {
      font-size: 1.8rem;
      font-weight: $font-weight-bold;
      margin-bottom: 1rem;
      color: $color-black;
    }

    p {
      font-size: 1.5rem;
      color: $color-gray-700;
      line-height: 1.6;
    }
  }

  &__target-icon {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
  }

  /* Comparison */
  &__comparison {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;

    @include layout-aspect-mobile {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  &__comparison-item {
    text-align: center;

    h3 {
      font-size: 2rem;
      font-weight: $font-weight-bold;
      margin: 2rem 0 1rem;
      color: $color-black;
    }

    p {
      font-size: 1.5rem;
      color: $color-gray-700;
      line-height: 1.6;
    }
  }

  /* Goal */
  &__goal {
    max-width: 90rem;
    margin: 0 auto;
    text-align: center;
  }

  &__goal-text {
    font-size: 2.2rem;
    line-height: 1.8;
    font-weight: $font-weight-medium;

    @include layout-aspect-mobile {
      font-size: 1.8rem;
    }
  }


  /* Monetization Cards */
  &__monetization-card {
    background: rgba($color-white, 0.95);
    border-radius: 1.5rem;
    padding: 2.5rem;
    text-align: center;
    box-shadow: 0 0.5rem 2rem rgba($color-black, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-0.5rem);
    }

    h3 {
      font-size: 1.8rem;
      font-weight: $font-weight-bold;
      margin-bottom: 1rem;
      color: $color-black;
    }

    p {
      font-size: 1.5rem;
      color: $color-gray-700;
      line-height: 1.6;
    }
  }

  &__monetization-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
  }

  &__monetization-card--highlighted {
    background: linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #667eea, #ff6b6b);
    background-size: 600% 600%;
    animation: gradientShift 12s ease infinite;
    color: $color-white;
    border: 2px solid rgba($color-white, 0.3);

    h3 {
      color: $color-white;
      text-shadow: 0 0.1rem 0.3rem rgba($color-black, 0.3);
    }

    p {
      color: rgba($color-white, 0.9);
      text-shadow: 0 0.1rem 0.2rem rgba($color-black, 0.2);
    }
  }

  /* Team */
  &__team {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
    max-width: 80rem;
    margin: 0 auto;

    @include layout-aspect-mobile {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  &__team-item {
    background: rgba($color-white, 0.95);
    border-radius: 1.5rem;
    padding: 3rem;
    text-align: center;
    box-shadow: 0 0.5rem 2rem rgba($color-black, 0.1);

    h3 {
      font-size: 2rem;
      font-weight: $font-weight-bold;
      margin-bottom: 1rem;
      color: $color-black;
    }

    p {
      font-size: 1.5rem;
      color: $color-gray-700;
      line-height: 1.6;
    }
  }

  &__team-icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
  }

  /* CTA Section */
  &__cta {
    padding: 6rem 2rem;
    background: $gradient-hero;
    color: $color-white;
    text-align: center;

    @include layout-aspect-mobile {
      padding: 4rem 1rem;
    }
  }

  &__cta-title {
    font-size: 3.5rem;
    font-weight: $font-weight-extra-bold;
    margin-bottom: 1.5rem;

    @include layout-aspect-mobile {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
  }

  &__cta-text {
    font-size: 2rem;
    margin-bottom: 3rem;
    opacity: 0.95;

    @include layout-aspect-mobile {
      font-size: 1.6rem;
      margin-bottom: 2rem;
    }
  }

  &__cta-link {
    display: inline-block;
    text-decoration: none;
    transition: transform 0.3s ease;
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      transform: scale(1.05);
    }
  }
}

/* Gradient Animation */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  25% {
    background-position: 100% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  75% {
    background-position: 0% 100%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
