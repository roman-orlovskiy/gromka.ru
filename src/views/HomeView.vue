<template>
  <div class="home">
    <div class="home__title">События</div>
    <div class="home__grid">
      <LoadingSpinner v-if="isLoading" />
      <EventCard v-else v-for="event in events" :key="event.id_shard" :event="event" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getEvents } from '@/services/api'
import EventCard from '@/components/EventCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const events = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const data = await getEvents()
    events.value = data
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    isLoading.value = false
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
  position: relative;

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
