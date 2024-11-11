<script setup>
import { useLoadingStore } from '@/stores/loading'
import { useEventyayApi } from '@/stores/eventyayapi'
import { useEventyayEventStore } from '@/stores/eventyayEvent'

import { ref, computed } from 'vue'
import StandardButton from '@/components/Common/StandardButton.vue'
import { useRouter } from 'vue-router'

const loadingStore = useLoadingStore()
const router = useRouter()

const selectedEvent = ref(null)
const eventyayEventStore = useEventyayEventStore()
const { events, error } = eventyayEventStore
const processApi = useEventyayApi()
const { apitoken, url, organizer, selectedRole } = processApi

loadingStore.contentLoaded()
eventyayEventStore.fetchEvents(url, apitoken, organizer)

// Format date with timezone indication
const formatEventDate = (dateString) => {
  const date = new Date(dateString)
  const localDate = date.toLocaleDateString()
  const localTime = date.toLocaleTimeString()
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return `${localDate} ${localTime} (${timeZone})`
}

// Filter events based on selectedRole and date
const categorizedEvents = computed(() => {
  const now = new Date()
  let filteredEvents = events

  // Filter for exhibitor events if role is Exhibitor
  if (selectedRole === 'Exhibitor') {
    filteredEvents = events.filter((event) => event.plugins && event.plugins.includes('exhibitors'))
  }

  // For CheckIn or Badge Station, only show upcoming events
  if (selectedRole === 'CheckIn' || selectedRole === 'Badge Station') {
    return {
      upcoming: filteredEvents.filter((event) => new Date(event.date_from) >= now),
      past: [] // Empty array as we don't want to show past events
    }
  }

  // For Exhibitor role, show both past and upcoming events
  return {
    upcoming: filteredEvents.filter((event) => new Date(event.date_from) > now),
    past: filteredEvents.filter((event) => new Date(event.date_from) <= now)
  }
})

const submitForm = () => {
  if (selectedEvent.value) {
    const selectedEventData = events.find((event) => event.slug === selectedEvent.value)
    if (selectedEventData) {
      console.log('Selected Event:', selectedEventData)
      console.log('Selected Role:', selectedRole)
      processApi.setEvent(selectedEventData.slug, selectedEventData.name.en)
      if (selectedRole === 'Exhibitor') router.push({ name: 'eventyayleedlogin' })
      if (selectedRole === 'CheckIn' || selectedRole === 'Badge Station')
        router.push({ name: 'eventyaycheckin' })
    }
  } else {
    console.error('Please select an event.')
  }
}
</script>

<template>
  <div class="-mt-16 flex h-screen flex-col items-center justify-center">
    <div v-if="error" class="text-danger">{{ error }}</div>
    <form v-if="events.length" @submit.prevent="submitForm">
      <!-- Role-specific heading -->
      <div class="mb-4 text-center">
        <h1 class="text-xl font-bold">
          {{
            selectedRole === 'Exhibitor' ? 'Exhibitor Events' : 'Select Event to Perform Checkin'
          }}
        </h1>
      </div>

      <!-- Upcoming Events Section -->
      <div v-if="categorizedEvents.upcoming.length" class="mb-6">
        <h2 class="mb-3 text-center text-lg font-semibold">Upcoming/Current Events</h2>
        <div v-for="event in categorizedEvents.upcoming" :key="event.slug" class="mb-2">
          <label class="flex items-center space-x-2">
            <input type="radio" :value="event.slug" v-model="selectedEvent" />
            <span class="text-xl">
              {{ event.name.en }}
              <div class="text-gray-600 text-sm">
                {{ formatEventDate(event.date_from) }}
              </div>
            </span>
          </label>
        </div>
      </div>

      <!-- Past Events Section - Only shown for Exhibitor role -->
      <div v-if="selectedRole === 'Exhibitor' && categorizedEvents.past.length" class="mb-6">
        <h2 class="mb-3 text-center text-lg font-semibold">Past Events</h2>
        <div v-for="event in categorizedEvents.past" :key="event.slug" class="mb-2">
          <label class="flex items-center space-x-2">
            <input type="radio" :value="event.slug" v-model="selectedEvent" />
            <span class="text-lg">
              {{ event.name.en }}
              <div class="text-gray-600 text-sm">
                {{ formatEventDate(event.date_from) }}
              </div>
            </span>
          </label>
        </div>
      </div>

      <div>
        <StandardButton
          type="submit"
          text="Select Event"
          class="btn-primary mt-6 w-full justify-center"
        />
      </div>
    </form>

    <div v-if="!events.length && !error" class="text-center">
      <div class="mb-4">No events available</div>
      <StandardButton
        text="Refresh"
        class="btn-primary mt-6 w-1/2 justify-center"
        @click="eventyayEventStore.fetchEvents(url, apitoken, organizer)"
      />
    </div>
  </div>
</template>
