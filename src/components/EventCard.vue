<template>
  <div class="event-card">
    <div class="event-card__image" :style="{ backgroundImage: `url(${photoUrl})` }"></div>
    <div class="event-card__content">
      <div class="event-card__header">
        <div class="event-card__datetime">
          <span class="event-card__date">{{ event.date }}</span>
          <span class="event-card__time">{{ event.time }}</span>
        </div>
        <div class="event-card__cost">{{ event.cost }}</div>
      </div>
      <div class="event-card__place">
        <h3 class="event-card__place-name">{{ event.place.name }}</h3>
        <p class="event-card__place-address">{{ event.place.address }}</p>
      </div>
      <div class="event-card__details">
        <span class="event-card__duration">{{ event.duration }}</span>
        <span class="event-card__coverage">{{ event.place.coverage }}</span>
      </div>
      <div class="event-card__organizer">
        <span class="event-card__organizer-label">Организатор: </span>
        <a :href="organizerLink" target="_blank" class="event-card__organizer-link">{{
          organizerName
        }}</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
})

const photoUrl = computed(() => {
  // Преобразуем ID фотографии из ВК в URL
  const photo = props.event.place.photo
  if (!photo) return ''

  return `https://gromka.ru/images/fields/football/nn/${photo}.jpg`
})

const organizerName = computed(() => {
  const user = props.event.user
  return user.username || user.firstName
})

const organizerLink = computed(() => {
  const user = props.event.user
  if (/^\d+$/.test(user.userLink)) {
    return `tel:${user.userLink}`
  }

  return user.username ? `https://t.me/${user.username}` : user.userLink
})
</script>

<style scoped lang="scss">
.event-card {
  background: $color-white;
  border-radius: 1.2rem;
  overflow: hidden;
  box-shadow: 0 0.2rem 0.8rem rgba($color-black, 0.1);
  transition: transform 0.2s ease;
  font-size: 1.2rem;
  cursor: pointer;

  &:hover {
    transform: translateY(-0.4rem);
  }

  &__image {
    height: 20rem;
    background-size: cover;
    background-position: center;
    background-color: $color-gray-300;
  }

  &__content {
    padding: 1.6rem;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.2rem;
  }

  &__datetime {
    .event-card__date {
      font-size: 1.9em;
      font-weight: $font-weight-bold;
      display: block;
    }

    .event-card__time {
      color: $color-gray-600;
    }
  }

  &__cost {
    font-weight: bold;
    color: $color-gray-600;
    font-size: 1.8rem;
  }

  &__place {
    margin-bottom: 1.2rem;
  }

  &__place-name {
    margin: 0 0 0.4rem 0;
    font-size: 1.4em;
  }

  &__place-address {
    margin: 0;
    color: $color-gray-600;
    font-size: 1.2rem;
  }

  &__details {
    display: flex;
    gap: 1.2rem;
    font-size: 0.9em;
    color: $color-gray-600;
    margin-bottom: 1.2rem;
  }

  &__organizer {
    font-size: 1.4rem;

    &-label {
      color: $color-gray-600;
    }

    &-link {
      color: $color-primary;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
