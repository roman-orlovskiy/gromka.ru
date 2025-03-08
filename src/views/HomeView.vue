<template>
  <div class="home">
    <div class="home__title">События</div>
    <div class="home__grid">
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  height: 100%;
  overflow-y: auto;

  &__title {
    margin-bottom: 2rem;
    text-align: center;
    font-size: 2.4rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2.4rem;
    margin: 0 auto;
    width: 100%;
  }
}
</style>
