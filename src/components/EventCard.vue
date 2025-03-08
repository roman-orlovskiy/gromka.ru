<template>
  <div class="event-card">
    <div class="event-image" :style="{ backgroundImage: `url(${photoUrl})` }"></div>
    <div class="event-content">
      <div class="event-header">
        <div class="event-datetime">
          <span class="event-date">{{ event.date }}</span>
          <span class="event-time">{{ event.time }}</span>
        </div>
        <div class="event-cost">{{ event.cost }}</div>
      </div>
      <div class="event-place">
        <h3>{{ event.place.name }}</h3>
        <p>{{ event.place.address }}</p>
      </div>
      <div class="event-details">
        <span class="event-duration">{{ event.duration }}</span>
        <span class="event-coverage">{{ event.place.coverage }}</span>
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
  const [type, id] = photo.split('_')
  return `https://vk.com/${type}?z=photo${type}_${id}`
})
</script>

<style scoped lang="scss">
.event-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }

  .event-image {
    height: 200px;
    background-size: cover;
    background-position: center;
    background-color: #f0f0f0;
  }

  .event-content {
    padding: 16px;
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .event-datetime {
    .event-date {
      font-size: 1.2em;
      font-weight: bold;
      display: block;
    }
    .event-time {
      color: #666;
    }
  }

  .event-cost {
    font-weight: bold;
    color: #2c3e50;
  }

  .event-place {
    margin-bottom: 12px;

    h3 {
      margin: 0 0 4px 0;
      font-size: 1.1em;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 0.9em;
    }
  }

  .event-details {
    display: flex;
    gap: 12px;
    font-size: 0.9em;
    color: #666;
  }
}
</style>
