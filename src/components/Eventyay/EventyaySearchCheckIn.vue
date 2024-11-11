<script setup>
import { ref } from 'vue'
import { useEventyayApi } from '@/stores/eventyayapi'
import { mande } from 'mande'
import QRCamera from '@/components/Common/QRCamera.vue'
import { useLoadingStore } from '@/stores/loading'

const processApi = useEventyayApi()
const { apitoken, url, organizer, eventSlug } = processApi

const loadingStore = useLoadingStore()
loadingStore.contentLoaded()
// Initialize Mande API instance
const api = mande(`${url}/api/v1/organizers/${organizer}/events/${eventSlug}`)
api.options.headers = {
  Authorization: `Device ${apitoken}`
}

const searchQuery = ref('')
const orders = ref([])
const loading = ref(false)

const searchOrders = async () => {
  if (!searchQuery.value) {
    orders.value = []
    return
  }

  loading.value = true
  try {
    const response = await api.get('orderpositions/')

    // Filter results based on search query
    orders.value = response.results.filter(
      (order) =>
        order.attendee_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        order.attendee_email?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  } catch (error) {
    console.error('Error fetching orders:', error)
    orders.value = []
  } finally {
    loading.value = false
  }
}

const isCheckedIn = (order) => {
  return order.checkins && order.checkins.length > 0
}

const checkIn = async (order) => {
  try {
    await api.post(`orderpositions/${order.id}/checkin/`, {})
    // Refresh the orders to show updated checkin status
    searchOrders()
  } catch (error) {
    console.error('Error checking in:', error)
  }
}

const generateBadge = (order) => {
  // Assuming the first download URL is the badge PDF
  if (order.downloads && order.downloads.length > 0) {
    window.open(order.downloads[0].url, '_blank')
  }
}
</script>
<template>
  <div class="flex h-screen justify-center">
    <div class="flex w-1/2 items-center">
      <QRCamera qr-type="eventyaycheckin" scan-type="Check-In" />
    </div>

    <div class="w-1/2 justify-center p-4">
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search orders by name or email..."
          class="w-full rounded border p-2"
          @input="searchOrders"
        />
      </div>

      <div v-if="!searchQuery" class="text-gray-500 mt-8 text-center">
        <p class="text-xl">Search Orders by Name or Email</p>
      </div>

      <div v-else>
        <div v-if="loading" class="text-center">Loading...</div>
        <div v-else-if="orders.length === 0" class="text-gray-500 text-center">No orders found</div>
        <div v-else class="space-y-4">
          <div v-for="order in orders" :key="order.id" class="rounded border p-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold">{{ order.attendee_name }}</h3>
                <p class="text-gray-600">{{ order.attendee_email || 'No email provided' }}</p>
                <p class="text-gray-500 text-sm">Secret: {{ order.secret }}</p>
              </div>
              <div class="space-x-2">
                <button
                  @click="checkIn(order)"
                  class="rounded bg-success px-4 py-2 text-white hover:bg-primary"
                  :disabled="isCheckedIn(order)"
                >
                  {{ isCheckedIn(order) ? 'Checked In' : 'Check In' }}
                </button>
                <button
                  @click="generateBadge(order)"
                  class="rounded bg-primary px-4 py-2 text-white hover:bg-primary-dark"
                >
                  Generate Badge
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
