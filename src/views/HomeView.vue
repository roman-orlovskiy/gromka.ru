<template>
  <div class="home">
    <h1>Спортивные события</h1>
    <div class="events-grid">
      <EventCard v-for="event in events" :key="event.id_shard" :event="event" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getEvents } from '@/services/api'
import EventCard from '@/components/EventCard.vue'

const events = ref([])

onMounted(async () => {
  try {
    const data = await getEvents()
    events.value = data
  } catch (error) {
    console.error('Error fetching events:', error)
  }
})
</script>

<style lang="scss">
.home {
  padding: 20px;

  h1 {
    margin-bottom: 24px;
    text-align: center;
  }
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .events-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
