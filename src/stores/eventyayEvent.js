import { mande } from 'mande'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEventyayEventStore = defineStore('eventyayEvent', () => {
  const events = ref([])
  const error = ref(null)

  async function fetchEvents(url, apiToken, organizer) {
    error.value = null

    try {
      const api = mande(url, { headers: { authorization: `Device ${apiToken}` } })
      const response = await api.get(`/api/v1/organizers/${organizer}/events/`)
      events.value = response.results
      console.log(response)
    } catch (err) {
      error.value = err.message
    }
  }

  return {
    events,
    error,
    fetchEvents
  }
})
