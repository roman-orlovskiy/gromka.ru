<template>
  <div class="performance">
    <!-- Hero Section -->
    <section class="performance__hero">
      <LanguageSwitcher />

      <h1 class="performance__title">{{ t('performance.title') }}</h1>
      <p class="performance__subtitle" v-html="subtitleHtml"></p>
      <div class="performance__hero-video">
        <video class="performance__video" autoplay loop muted src="/videos/gromka.mp4" type="video/mp4">
        {{ t('performance.videoNotSupported') }}
      </video>
    </div>
      <button @click="scrollToProject" class="performance__cta-link">
        <ButtonComp mod="secondary">{{ t('performance.ctaButton') }}</ButtonComp>
      </button>
    </section>

    <!-- What is it Section -->
    <section id="what-is-project" class="performance__section performance__section--gradient-1">
      <div class="performance__container">
        <div class="performance__content">
          <div class="performance__text">
            <p>{{ t('performance.whatIsProject.description') }}</p>
            <ul class="performance__list">
              <li>● <strong>{{ t('performance.whatIsProject.features.colorful') }}</strong></li>
              <li>● <strong>{{ t('performance.whatIsProject.features.dynamic') }}</strong></li>
              <li>● <strong>{{ t('performance.whatIsProject.features.waves') }}</strong></li>
            </ul>
          </div>
          <div class="performance__image-container">
            <img
              src="@/assets/images/home/1.webp"
              :alt="t('performance.whatIsProject.description')"
              class="performance__image"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Section -->
    <section class="performance__section performance__section--demo">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.demo.title') }}</h2>
        <p class="performance__demo-description">
          {{ t('performance.demo.description') }}
        </p>
      </div>
      <div class="performance__video-block">
        <div class="performance__video-container" @click="toggleVideo2">
          <video
            ref="verticalVideo2"
            class="performance__vertical-video"
            src="/videos/ai_presentation.mp4"
            type="video/mp4"
            loop
            @play="onVideoPlay2"
            @pause="onVideoPause2"
            @ended="onVideoEnded2"
          >
            {{ t('performance.videoNotSupported') }}
          </video>
          <button
            v-if="!isVideoPlaying2"
            class="performance__play-button"
          >
            {{ videoStarted2 ? t('performance.demo.continue') : t('performance.demo.play') }}
          </button>
          <button
            v-else
            class="performance__pause-button"
          >
            {{ t('performance.demo.pause') }}
          </button>
          <button
            class="performance__fullscreen-button"
            @click.stop="toggleFullscreen2"
            :title="t('performance.demo.fullscreen')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3m-5 13h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <button @click="openDemoModal" class="performance__demo-link">
        <ButtonComp>{{ t('performance.demo.button') }}</ButtonComp>
      </button>
    </section>

    <!-- Stadium Photo Section -->
    <section class="performance__section performance__section--stadium">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.stadium.title') }}</h2>
        <div class="performance__stadium-block">
          <div class="performance__stadium-preview">
            <div class="performance__image-container performance__image-container--large performance__image-container--clickable" @click="openSpartakGallery(0)">
              <img
                :src="spartakGalleryImages[0].src"
                :alt="spartakGalleryImages[0].alt"
                class="performance__image"
              />
              <button class="performance__arrow performance__arrow--left" @click="prevSpartakPhoto">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="performance__arrow performance__arrow--right" @click="nextSpartakPhoto">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="performance__stadium-info">
            <p>{{ t('performance.stadium.description') }}</p>
          </div>
        </div>
        <div class="performance__video-block">
          <div class="performance__video-container" @click="toggleVideo">
            <video
              ref="verticalVideo"
              class="performance__vertical-video"
              src="/videos/demo.mp4"
              type="video/mp4"
              loop
              @play="onVideoPlay"
              @pause="onVideoPause"
              @ended="onVideoEnded"
            >
              {{ t('performance.videoNotSupported') }}
            </video>
            <button
              v-if="!isVideoPlaying"
              class="performance__play-button"
            >
              {{ videoStarted ? t('performance.stadium.continue') : t('performance.stadium.play') }}
            </button>
            <button
              v-else
              class="performance__pause-button"
            >
              {{ t('performance.stadium.pause') }}
            </button>
            <button
              class="performance__fullscreen-button"
              @click.stop="toggleFullscreen"
              :title="t('performance.stadium.fullscreen')"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3m-5 13h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

<!-- Advantages Section -->
    <section class="performance__section performance__section--gradient-2">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.advantages.title') }}</h2>
        <div class="performance__grid">
          <div class="performance__card">
            <div class="performance__card-icon">▲</div>
            <h3 class="performance__card-title">{{ t('performance.advantages.scalability.title') }}</h3>
            <p>{{ t('performance.advantages.scalability.description') }}</p>
          </div>
          <div class="performance__card">
            <div class="performance__card-icon">◆</div>
            <h3 class="performance__card-title">{{ t('performance.advantages.simplicity.title') }}</h3>
            <p>{{ t('performance.advantages.simplicity.description') }}</p>
          </div>
          <div class="performance__card">
            <div class="performance__card-icon">★</div>
            <h3 class="performance__card-title">{{ t('performance.advantages.visual.title') }}</h3>
            <p>{{ t('performance.advantages.visual.description') }}</p>
          </div>
          <div class="performance__card">
            <div class="performance__card-icon">◉</div>
            <h3 class="performance__card-title">{{ t('performance.advantages.flexibility.title') }}</h3>
            <p>{{ t('performance.advantages.flexibility.description') }}</p>
          </div>
          <div class="performance__card performance__card--highlighted performance__card--clickable" @click="scrollToMonetization">
            <div class="performance__card-icon">■</div>
            <h3 class="performance__card-title">{{ t('performance.advantages.monetization.title') }}</h3>
            <p>{{ t('performance.advantages.monetization.description') }}</p>
          </div>
          <div class="performance__card">
            <div class="performance__card-icon">●</div>
            <h3 class="performance__card-title">{{ t('performance.advantages.interaction.title') }}</h3>
            <p>{{ t('performance.advantages.interaction.description') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Monetization Section -->
    <section id="monetization" class="performance__section performance__section--success">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.monetization.title') }}</h2>
        <div class="performance__grid performance__grid--four-cols">
          <div class="performance__monetization-card">
            <div class="performance__monetization-icon">◆</div>
            <h3>{{ t('performance.monetization.specialProjects.title') }}</h3>
            <p>{{ t('performance.monetization.specialProjects.description') }}</p>
          </div>
          <div class="performance__monetization-card">
            <div class="performance__monetization-icon">◉</div>
            <h3>{{ t('performance.monetization.advertising.title') }}</h3>
            <p>{{ t('performance.monetization.advertising.description') }}</p>
          </div>
          <div class="performance__monetization-card">
            <div class="performance__monetization-icon">■</div>
            <h3>{{ t('performance.monetization.souvenirs.title') }}</h3>
            <p>{{ t('performance.monetization.souvenirs.description') }}</p>
          </div>
          <div class="performance__monetization-card">
            <div class="performance__monetization-icon">▲</div>
            <h3>{{ t('performance.monetization.bets.title') }}</h3>
            <p>{{ t('performance.monetization.bets.description') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Target Audience Section -->
    <section class="performance__section performance__section--gradient-3">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.targetAudience.title') }}</h2>
        <div class="performance__grid performance__grid--two-cols">
          <div class="performance__target-card">
            <div class="performance__target-icon">♪</div>
            <h3>{{ t('performance.targetAudience.concerts.title') }}</h3>
            <p>{{ t('performance.targetAudience.concerts.description') }}</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">◈</div>
            <h3>{{ t('performance.targetAudience.sports.title') }}</h3>
            <p>{{ t('performance.targetAudience.sports.description') }}</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">◐</div>
            <h3>{{ t('performance.targetAudience.theater.title') }}</h3>
            <p>{{ t('performance.targetAudience.theater.description') }}</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">▶</div>
            <h3>{{ t('performance.targetAudience.marketing.title') }}</h3>
            <p>{{ t('performance.targetAudience.marketing.description') }}</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">◆</div>
            <h3>{{ t('performance.targetAudience.political.title') }}</h3>
            <p>{{ t('performance.targetAudience.political.description') }}</p>
          </div>
          <div class="performance__target-card">
            <div class="performance__target-icon">◉</div>
            <h3>{{ t('performance.targetAudience.public.title') }}</h3>
            <p>{{ t('performance.targetAudience.public.description') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- What is it like Section -->
    <section class="performance__section performance__section--gradient-4">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.comparison.title') }}</h2>
        <div class="performance__comparison">
          <div class="performance__comparison-item">
            <div class="performance__image-container performance__image-container--clickable" @click="openGallery(0)">
              <img
                src="@/assets/images/home/refs/img1.webp"
                :alt="t('performance.comparison.lightShows.description')"
                class="performance__image"
              />
            </div>
            <h3>{{ t('performance.comparison.lightShows.title') }}</h3>
            <p>{{ t('performance.comparison.lightShows.description') }}</p>
          </div>
          <div class="performance__comparison-item">
            <div class="performance__image-container performance__image-container--clickable" @click="openGallery(1)">
              <img
                src="@/assets/images/home/refs/img2.webp"
                :alt="t('performance.comparison.drones.description')"
                class="performance__image"
              />
            </div>
            <h3>{{ t('performance.comparison.drones.title') }}</h3>
            <p>{{ t('performance.comparison.drones.description') }}</p>
          </div>
          <div class="performance__comparison-item">
            <div class="performance__image-container performance__image-container--clickable" @click="openGallery(2)">
              <img
                src="@/assets/images/home/refs/img3.webp"
                :alt="t('performance.comparison.interactive.description')"
                class="performance__image performance__image--shifted-up"
              />
            </div>
            <h3>{{ t('performance.comparison.interactive.title') }}</h3>
            <p>{{ t('performance.comparison.interactive.description') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Goal Section -->
    <section class="performance__section performance__section--accent">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.goal.title') }}</h2>
        <div class="performance__goal">
          <p class="performance__goal-text">
            {{ t('performance.goal.text') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="performance__section performance__section--primary">
      <div class="performance__container">
        <h2 class="performance__section-title">{{ t('performance.team.title') }}</h2>
        <div class="performance__team">
          <div class="performance__team-item">
            <div class="performance__team-photo">
              <img src="@/assets/images/home/team/roman-orlovskiy.webp" :alt="t('performance.team.roman.name')" />
            </div>
            <h3>{{ t('performance.team.roman.name') }}</h3>
            <p>{{ t('performance.team.roman.role') }}</p>
          </div>
          <div class="performance__team-item">
            <div class="performance__team-photo">
              <img src="@/assets/images/home/team/anton-zyuzin.webp" :alt="t('performance.team.anton.name')" />
            </div>
            <h3>{{ t('performance.team.anton.name') }}</h3>
            <p>{{ t('performance.team.anton.role') }}</p>
          </div>
        </div>
    </div>
    </section>

    <!-- CTA Section -->
    <section class="performance__cta">
      <div class="performance__container">
        <h2 class="performance__cta-title">{{ t('performance.cta.title') }}</h2>
        <p class="performance__cta-text">{{ t('performance.cta.text') }}</p>
        <a href="https://t.me/orlovskiy_rl" target="_blank" class="performance__cta-link">
          <ButtonComp>{{ t('performance.cta.button') }}</ButtonComp>
        </a>
      </div>
    </section>

    <!-- Image Gallery for Spartak -->
    <ImageGallery
      :is-open="isSpartakGalleryOpen"
      :images="spartakGalleryImages"
      :initial-slide="spartakSlideIndex"
      @close="closeSpartakGallery"
    />

    <!-- Image Gallery for Similar Cases -->
    <ImageGallery
      :is-open="isGalleryOpen"
      :images="galleryImages"
      :initial-slide="currentSlide"
      @close="closeGallery"
    />

    <!-- Sticky CTA Button -->
    <transition name="slide-from-right">
      <a
        href="https://t.me/orlovskiy_rl"
        target="_blank"
        class="performance__sticky-cta"
        v-show="showStickyButton"
        :title="t('performance.cta.stickyButton')"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
        </svg>
      </a>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ButtonComp from '@/components/ButtonComp.vue'
import ImageGallery from '@/components/ImageGallery.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useMainStore } from '@/stores/main'
import { useI18n } from '@/composables/useI18n'

const route = useRoute()
const mainStore = useMainStore()
const { t, setLanguage } = useI18n()

// Computed для subtitle с жирным текстом
const subtitleHtml = computed(() => {
  const subtitle = t('performance.subtitle')
  const boldText = t('performance.subtitleBold')
  return subtitle.replace('{{bold}}', `<b>${boldText}</b>`)
})

// Галерея изображений для Спартака
const isSpartakGalleryOpen = ref(false)
const spartakSlideIndex = ref(0)

const spartakGalleryImages = computed(() => {
  // Зависимость от currentLang для реактивности через вызовы t()
  return [
    {
      src: new URL('@/assets/images/home/spartak-2.webp', import.meta.url).href,
      alt: t('performance.stadium.images.spartakRostov'),
      caption: t('performance.stadium.images.spartakRostov')
    },
    {
      src: new URL('@/assets/images/home/spartak.webp', import.meta.url).href,
      alt: t('performance.stadium.images.spartakRostov'),
      caption: t('performance.stadium.images.spartakRostov')
    },
    {
      src: new URL('@/assets/images/home/spartak-1.webp', import.meta.url).href,
      alt: t('performance.stadium.images.spartakRostov'),
      caption: t('performance.stadium.images.spartakRostov')
    },
    {
      src: new URL('@/assets/images/home/spartak-3.webp', import.meta.url).href,
      alt: t('performance.stadium.images.zfkSpartak'),
      caption: t('performance.stadium.images.zfkSpartak')
    }
  ]
})

const openSpartakGallery = (index = 0) => {
  spartakSlideIndex.value = index
  isSpartakGalleryOpen.value = true
}

const closeSpartakGallery = () => {
  isSpartakGalleryOpen.value = false
}

const nextSpartakPhoto = (e) => {
  e.stopPropagation()
  openSpartakGallery(1)
}

const prevSpartakPhoto = (e) => {
  e.stopPropagation()
  openSpartakGallery(3)
}

// Галерея изображений для аналогичных кейсов
const isGalleryOpen = ref(false)
const currentSlide = ref(0)

const galleryImages = computed(() => {
  // Зависимость от currentLang для реактивности через вызовы t()
  return [
    {
      src: new URL('@/assets/images/home/refs/img1.webp', import.meta.url).href,
      alt: t('performance.comparison.lightShows.description'),
      caption: t('performance.comparison.lightShows.title') + ' - ' + t('performance.comparison.lightShows.description')
    },
    {
      src: new URL('@/assets/images/home/refs/img2.webp', import.meta.url).href,
      alt: t('performance.comparison.drones.description'),
      caption: t('performance.comparison.drones.description')
    },
    {
      src: new URL('@/assets/images/home/refs/img3.webp', import.meta.url).href,
      alt: t('performance.comparison.interactive.description'),
      caption: t('performance.comparison.interactive.description')
    }
  ]
})

const openGallery = (index) => {
  currentSlide.value = index
  isGalleryOpen.value = true
}

const closeGallery = () => {
  isGalleryOpen.value = false
}

const verticalVideo = ref(null)
const isVideoPlaying = ref(false)
const videoStarted = ref(false)

const verticalVideo2 = ref(null)
const isVideoPlaying2 = ref(false)
const videoStarted2 = ref(false)

const toggleVideo = () => {
  if (verticalVideo.value) {
    if (isVideoPlaying.value) {
      verticalVideo.value.pause()
      isVideoPlaying.value = false
    } else {
      // Останавливаем второе видео, если оно играет
      if (isVideoPlaying2.value && verticalVideo2.value) {
        verticalVideo2.value.pause()
        isVideoPlaying2.value = false
      }
      verticalVideo.value.play()
      isVideoPlaying.value = true
      videoStarted.value = true
    }
  }
}

const toggleVideo2 = () => {
  if (verticalVideo2.value) {
    if (isVideoPlaying2.value) {
      verticalVideo2.value.pause()
      isVideoPlaying2.value = false
    } else {
      // Останавливаем первое видео, если оно играет
      if (isVideoPlaying.value && verticalVideo.value) {
        verticalVideo.value.pause()
        isVideoPlaying.value = false
      }
      verticalVideo2.value.play()
      isVideoPlaying2.value = true
      videoStarted2.value = true
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

const toggleFullscreen = () => {
  if (verticalVideo.value) {
    // Добавляем класс для полноэкранного режима
    verticalVideo.value.classList.add('fullscreen-video')

    if (verticalVideo.value.requestFullscreen) {
      verticalVideo.value.requestFullscreen()
    } else if (verticalVideo.value.webkitRequestFullscreen) {
      verticalVideo.value.webkitRequestFullscreen()
    } else if (verticalVideo.value.msRequestFullscreen) {
      verticalVideo.value.msRequestFullscreen()
    }
  }
}

const toggleFullscreen2 = () => {
  if (verticalVideo2.value) {
    // Добавляем класс для полноэкранного режима
    verticalVideo2.value.classList.add('fullscreen-video')

    if (verticalVideo2.value.requestFullscreen) {
      verticalVideo2.value.requestFullscreen()
    } else if (verticalVideo2.value.webkitRequestFullscreen) {
      verticalVideo2.value.webkitRequestFullscreen()
    } else if (verticalVideo2.value.msRequestFullscreen) {
      verticalVideo2.value.msRequestFullscreen()
    }
  }
}

// Обработчик выхода из полноэкранного режима
const handleFullscreenChange = () => {
  if (verticalVideo.value && !document.fullscreenElement) {
    verticalVideo.value.classList.remove('fullscreen-video')
  }
  if (verticalVideo2.value && !document.fullscreenElement) {
    verticalVideo2.value.classList.remove('fullscreen-video')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('msfullscreenchange', handleFullscreenChange)
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Проверяем сразу при загрузке

  // Проверяем query параметры для автоматического открытия демо и установки языка
  const demoParam = route.query.demo
  const langParam = route.query.lang

  // Устанавливаем язык, если указан в query
  if (langParam === 'ru' || langParam === 'en') {
    setLanguage(langParam)
  }

  // Открываем модальное окно демо, если demo=true
  if (demoParam === 'true') {
    // Небольшая задержка для корректной инициализации компонента
    setTimeout(() => {
      openDemoModal()
    }, 100)
  }
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('msfullscreenchange', handleFullscreenChange)
  window.removeEventListener('scroll', handleScroll)
})

const onVideoPlay = () => {
  isVideoPlaying.value = true
  videoStarted.value = true
}

const onVideoPause = () => {
  isVideoPlaying.value = false
}

const onVideoEnded = () => {
  isVideoPlaying.value = false
}

const onVideoPlay2 = () => {
  isVideoPlaying2.value = true
  videoStarted2.value = true
}

const onVideoPause2 = () => {
  isVideoPlaying2.value = false
}

const onVideoEnded2 = () => {
  isVideoPlaying2.value = false
}

const openDemoModal = () => {
  mainStore.openModal('demo')
}

const scrollToMonetization = () => {
  const element = document.getElementById('monetization')
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

// Sticky CTA button logic
const showStickyButton = ref(false)

const handleScroll = () => {
  const whatIsSection = document.getElementById('what-is-project')
  const ctaSection = document.querySelector('.performance__cta')

  if (whatIsSection && ctaSection) {
    const whatIsSectionTop = whatIsSection.offsetTop
    const ctaSectionTop = ctaSection.offsetTop
    const scrollPosition = window.scrollY + window.innerHeight

    // Показываем кнопку после секции "Что это за проект" и скрываем, когда дошли до секции CTA
    showStickyButton.value = window.scrollY > whatIsSectionTop && scrollPosition < ctaSectionTop + 100
  }
}
</script>
<style lang="scss" scoped>
.performance {
  flex: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;

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

    & b {
      color: $color-black;
    }

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
    padding: 3rem 2rem;

    @include layout-aspect-mobile {
      padding: 2rem 1rem;
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

    &--demo {
      background: $gradient-mint-teal;
      color: $color-black;
      text-align: center;
      padding: 3rem 2rem;

      @include layout-aspect-mobile {
        padding: 2rem 1rem;
      }

      .performance__video-block {
        margin-top: 1.5rem;
      }

      .performance__demo-link {
        margin-top: 2rem;

        @include layout-aspect-mobile {
          margin-top: 1.5rem;
        }
      }
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
    margin-bottom: 2rem;

    @include layout-aspect-mobile {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
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
      gap: 1rem;
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

    @include layout-aspect-mobile {
      margin-bottom: 0;
    }

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
      box-shadow: 0 1rem 3rem rgba($color-black, 0.3);
      border: 2px solid rgba($color-spartak, 0.3);
    }

    &--clickable {
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: scale(1.02);
        box-shadow: 0 1rem 3rem rgba($color-black, 0.4);
      }

      &:active {
        transform: scale(0.98);
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

    &--shifted-up {
      object-position: center 70%;
    }
  }

  /* Comparison Images */
  &__comparison .performance__image-container {
    height: 25rem;
    overflow: hidden;

    @include layout-aspect-mobile {
      height: 20rem;
    }
  }

  &__comparison .performance__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    min-height: unset;
  }

  &__video-block {
    width: 100%;
    max-width: 90rem;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    flex-direction: row;
    gap: 2rem;
    justify-content: center;

    @include layout-aspect-mobile {
      padding: 1rem;
      flex-direction: column;
      gap: 2rem;
    }
  }

  &__video-container {
    width: 100%;
    max-width: 30rem;
    position: relative;
    background: $gradient-mint-teal;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 0.5rem 0.5rem rgba($color-black, 0.5);
    cursor: pointer;
    flex: 1;

    @include layout-aspect-mobile {
      max-width: 100%;
      flex: auto;
    }
  }

  &__vertical-video {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;

    // Стили для полноэкранного режима с пропорцией 9:16
    &.fullscreen-video {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 9999;
      background: $color-black;
      object-fit: contain;

      // Для портретной ориентации (высота больше ширины)
      @media (orientation: portrait) {
        width: 100vw;
        height: 177.78vw; // 16/9 * 100vw для пропорции 9:16
        max-height: 100vh;
        max-width: 56.25vh; // 9/16 * 100vh
      }

      // Для ландшафтной ориентации (ширина больше высоты)
      @media (orientation: landscape) {
        width: 56.25vh; // 9/16 * 100vh для пропорции 9:16
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw; // 16/9 * 100vw
      }
    }
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
    background: linear-gradient(135deg, #FF6B00 0%, #FF9F1C 50%, #FFB84D 100%);
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

  &__fullscreen-button {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    width: 4rem;
    height: 4rem;
    background: rgba($color-black, 0.7);
    border: 2px solid rgba($color-white, 0.8);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    color: $color-white;
    opacity: 1;
    pointer-events: auto;

    &:hover {
      background: rgba($color-black, 0.9);
      border-color: $color-white;
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }

    svg {
      width: 2rem;
      height: 2rem;
    }

    @include layout-aspect-mobile {
      width: 3.5rem;
      height: 3.5rem;
      bottom: 0.8rem;
      right: 0.8rem;

      svg {
        width: 1.8rem;
        height: 1.8rem;
      }
    }
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

    &--clickable {
      cursor: pointer;

      &:active {
        transform: translateY(-0.3rem);
      }
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
      padding: 1rem;
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
      font-size: 1.6rem;
      margin-top: 1rem;
      padding: 1rem;
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

  &__stadium-preview {
    position: relative;
    margin-bottom: 2rem;

    .performance__image-container {
      position: relative;
    }
  }

  &__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba($color-black, 0.5);
    border: none;
    border-radius: 50%;
    width: 5rem;
    height: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: $color-white;
    transition: all 0.3s ease;
    z-index: 10;

    &:hover {
      background: rgba($color-black, 0.7);
      transform: translateY(-50%) scale(1.1);
    }

    &:active {
      transform: translateY(-50%) scale(0.95);
    }

    svg {
      width: 2.4rem;
      height: 2.4rem;
    }

    @include layout-aspect-mobile {
      width: 4rem;
      height: 4rem;

      svg {
        width: 2rem;
        height: 2rem;
      }
    }

    &--left {
      left: 2rem;

      @include layout-aspect-mobile {
        left: 1rem;
      }
    }

    &--right {
      right: 2rem;

      @include layout-aspect-mobile {
        right: 1rem;
      }
    }
  }

  &__section--stadium {
    .performance__video-block {
      margin-top: 3rem;
      max-width: 90rem;
      margin-left: auto;
      margin-right: auto;

      @include layout-aspect-mobile {
        margin-top: 2rem;
      }
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

  &__target-card:nth-child(1) .performance__target-icon {
    color: $color-vibrant-orange;
  }

  &__target-card:nth-child(2) .performance__target-icon {
    color: $color-vibrant-teal;
  }

  &__target-card:nth-child(3) .performance__target-icon {
    color: $color-vibrant-orange;
  }

  &__target-card:nth-child(4) .performance__target-icon {
    color: $color-vibrant-mint;
  }

  &__target-card:nth-child(5) .performance__target-icon {
    color: $color-vibrant-orange;
  }

  &__target-card:nth-child(6) .performance__target-icon {
    color: $color-vibrant-teal;
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
    color: $color-black;
  }

  &__monetization-card:nth-child(1) .performance__monetization-icon {
    color: #4ecdc4; /* мятный */
  }

  &__monetization-card:nth-child(2) .performance__monetization-icon {
    color: #ff9f1c; /* оранжевый */
  }

  &__monetization-card:nth-child(3) .performance__monetization-icon {
    color: #ff6b6b; /* красный */
  }

  &__monetization-card:nth-child(4) .performance__monetization-icon {
    color: #45b7d1; /* бирюзовый */
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

  &__team-photo {
    width: 15rem;
    height: 15rem;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 0.5rem 2rem rgba($color-black, 0.2);
    border: 3px solid rgba($color-white, 0.8);

    img {
      width: 100%;
    }

    @include layout-aspect-mobile {
      width: 12rem;
      height: 12rem;
    }
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

  /* Demo Description */
  &__demo-description {
    font-size: 2rem;
    line-height: 1.6;
    margin: 0 auto 1rem;
    max-width: 70rem;
    opacity: 0.95;

    @include layout-aspect-mobile {
      font-size: 1.6rem;
      margin-bottom: 1rem;
    }
  }

  &__demo-link {
    display: inline-block;
    text-decoration: none;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  /* Sticky CTA Button */
  &__sticky-cta {
    position: fixed;
    bottom: 3rem;
    right: 3rem;
    z-index: 1000;
    width: 6rem;
    height: 6rem;
    background: linear-gradient(135deg, #FF6B00 0%, #FF9F1C 50%, #FFB84D 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 0.5rem 2rem rgba($color-black, 0.3);
    color: $color-white;

    &:hover {
      transform: translateY(-0.3rem) scale(1.1);
      box-shadow: 0 0.7rem 2.5rem rgba($color-black, 0.4);
    }

    &:active {
      transform: translateY(0) scale(1);
    }

    svg {
      width: 3.2rem;
      height: 3.2rem;
    }

    @include layout-aspect-mobile {
      bottom: 2rem;
      right: 2rem;
      width: 5.5rem;
      height: 5.5rem;

      svg {
        width: 2.8rem;
        height: 2.8rem;
      }
    }
  }
}

// Анимация выезда справа
.slide-from-right-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-from-right-leave-active {
  transition: all 0.3s ease;
}

.slide-from-right-enter-from {
  opacity: 0;
  transform: translateX(10rem);
}

.slide-from-right-leave-to {
  opacity: 0;
  transform: translateX(10rem);
}

.slide-from-right-enter-to,
.slide-from-right-leave-from {
  opacity: 1;
  transform: translateX(0);
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
