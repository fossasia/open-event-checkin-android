<script setup>
import StandardButton from '@/components/Common/StandardButton.vue'
import QRCamera from '@/components/Common/QRCamera.vue'
import BadgePrintPreview from '@/components/Common/BadgePrintPreview.vue'
import { useLoadingStore } from '@/stores/loading'
import { useProcessEventyayCheckInStore } from '@/stores/processEventyayCheckIn'
import { useEventyayApi } from '@/stores/eventyayapi'
import { storeToRefs } from 'pinia'
import { watch, ref, onUnmounted } from 'vue'

const loadingStore = useLoadingStore()
loadingStore.contentLoaded()
const showPrintPreview = ref(false)
const processEventyayCheckInStore = useProcessEventyayCheckInStore()
const { message, showSuccess, showError, badgeUrl, isGeneratingBadge } = storeToRefs(
  processEventyayCheckInStore
)
const processApi = useEventyayApi()
const { apitoken, url, organizer, eventSlug, eventname } = processApi
const countdown = ref(5)
const timerInstance = ref(null)
const timeoutInstance = ref(null)
const notes = ref('')

function startCountdown() {
  countdown.value = 5
  timerInstance.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timerInstance.value)
      processEventyayCheckInStore.$reset()
    }
  }, 1000)
}

function stopTimer() {
  if (timerInstance.value) {
    clearInterval(timerInstance.value)
  }
  if (timeoutInstance.value) {
    clearTimeout(timeoutInstance.value)
  }
}

function handleNotesInput() {
  stopTimer()
  countdown.value = '...'
}

function handleSave() {
  console.log('Saving notes:', notes.value)
  processEventyayCheckInStore.$reset()
  stopTimer()
}

function handleCancel() {
  processEventyayCheckInStore.$reset()
  stopTimer()
}

function handlePrintBadge() {
  console.log('Printing badge...')
  if (badgeUrl.value) {
    showPrintPreview.value = true
  }
}

function handlePrintClose() {
  showPrintPreview.value = false
  startCountdown()
}

async function handlePrint() {
  stopTimer()
  console.log('Printing badge...')
  console.log('Badge URL:', badgeUrl.value)
  if (badgeUrl.value) {
    await processEventyayCheckInStore.printBadge(badgeUrl.value)
  }
  handlePrintBadge()
}

watch([showSuccess, showError], ([newSuccess, newError], [oldSuccess, oldError]) => {
  if ((!oldSuccess && newSuccess) || (!oldError && newError)) {
    showPopup()
  }
})

function showPopup() {
  notes.value = ''
  startCountdown()
  timeoutInstance.value = setTimeout(() => {
    processEventyayCheckInStore.$reset()
  }, 5000)
}

// Cleanup timers when component is destroyed
onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="flex h-screen w-full flex-col items-center justify-center">
    <div class="absolute top-20 text-center">
      <h1 class="text-4xl font-bold">{{ eventname }}</h1>
      <p name="date" class="text-gray-600 text-lg font-semibold">{{ new Date().toDateString() }}</p>
    </div>
    <QRCamera qr-type="eventyaycheckin" scan-type="Check-In" />
    <!-- Attendee Info Popup Modal -->
    <div
      v-if="(showSuccess || showError) && message?.attendee"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="relative w-96 rounded bg-white p-5 shadow-lg">
        <!-- Countdown display -->
        <div
          class="bg-gray-200 text-gray-600 absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full font-medium"
        >
          {{ countdown }}
        </div>

        <h2 :class="showError ? 'text-red-600 mb-2 text-xl' : 'text-green-600 mb-2 text-xl'">
          {{ message.message }}
        </h2>
        <div>
          <p><b>Name:</b> {{ message.attendee }}</p>
          <div class="mt-4 flex flex-col space-y-3" @click="handleNotesInput">
            <StandardButton
              v-if="badgeUrl && showSuccess"
              type="button"
              :text="isGeneratingBadge ? 'Generating Badge...' : 'Generate Badge'"
              :disabled="isGeneratingBadge"
              @click="handlePrint"
              class="btn-primary w-full justify-center"
            />
            <StandardButton
              type="submit"
              text="Done"
              @click="handleCancel"
              class="btn-info mt-6 w-1/4 justify-center"
            />
          </div>
        </div>
      </div>
    </div>
    <BadgePrintPreview
      v-if="showPrintPreview"
      :url="`${url}${badgeUrl}`"
      @close="handlePrintClose"
    />
  </div>
</template>
