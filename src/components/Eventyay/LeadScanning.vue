<script setup>
import { watch, ref } from 'vue'
import QRCamera from '@/components/Common/QRCamera.vue'
import StandardButton from '@/components/Common/StandardButton.vue'
import TagInput from '@/components/Common/TagInput.vue'
import { useLoadingStore } from '@/stores/loading'
import { useLeadScanStore } from '@/stores/leadscan'
import { useTagStore } from '@/stores/tags'
import { storeToRefs } from 'pinia'
import { useEventyayApi } from '@/stores/eventyayapi'
import { mande } from 'mande'

const loadingStore = useLoadingStore()
const leadScanStore = useLeadScanStore()
const tagStore = useTagStore()
const processApi = useEventyayApi()
const { exhiname, boothname, boothid } = processApi
const { message, showSuccess, showError, currentLeadId } = storeToRefs(leadScanStore)
const { currentTags } = storeToRefs(tagStore)
const countdown = ref(5)
const timerInstance = ref(null)
const timeoutInstance = ref(null)
const notes = ref('')

loadingStore.contentLoaded()

function startCountdown() {
  countdown.value = 5
  // Store the interval reference
  timerInstance.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timerInstance.value)
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
  countdown.value = '...' // Replace the countdown with dots when typing
}

async function handleSave() {
  const { url, organizer, eventSlug, apitoken, exikey } = processApi
  const api = mande(
    `${url}/api/v1/event/${organizer}/${eventSlug}/exhibitors/lead/${currentLeadId.value}/update`,
    {
      headers: {
        Authorization: `Device ${apitoken}`,
        Accept: 'application/json',
        Exhibitor: exikey
      }
    }
  )

  try {
    await api.post({
      note: notes.value,
      tags: currentTags.value
    })
    tagStore.reset()
    leadScanStore.$reset()
  } catch (error) {
    console.error('Failed to save lead:', error)
  }
}

function handleCancel() {
  notes.value = ''
  tagStore.reset()
  leadScanStore.$reset()
}

// Show popup for success or when we have attendee info (409 case)
watch([showSuccess, showError], ([newSuccess, newError]) => {
  if (newSuccess || (newError && message.value.attendee)) {
    showPopup()
  }
})

function showPopup() {
  notes.value = ''
  tagStore.reset()
  if (message.value.lead_id) {
    currentLeadId.value = message.value.lead_id
  }
  startCountdown()
  timeoutInstance.value = setTimeout(() => {
    leadScanStore.$reset()
  }, 5000)
}
</script>

<template>
  <div class="flex h-screen w-full flex-col items-center justify-center overscroll-none">
    <div class="absolute top-20 text-center">
      <h1 class="text-3xl font-bold">{{ exhiname }}</h1>
      <h2 class="text-xl font-bold">{{ boothname }} - {{ boothid }}</h2>
    </div>
    <QRCamera qr-type="eventyaylead" scan-type="Lead-Scan" />
    <StandardButton
      text="Download Leads"
      @click="leadScanStore.exportLeads"
      class="btn-secondary mt-6 w-1/4 justify-center"
    />
    <!-- Attendee Info Popup Modal -->
    <div
      v-if="(showSuccess || showError) && message.attendee"
      class="fixed inset-0 flex items-center justify-center"
    >
      <div class="relative w-1/3 rounded bg-white p-5 shadow-lg">
        <!-- Countdown display -->
        <div
          class="bg-gray-200 text-gray-600 absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full font-medium"
        >
          {{ countdown }}
        </div>

        <h2 :class="showError ? 'mb-2 text-xl text-danger' : 'mb-2 text-xl text-success'">
          {{ message.message }}
        </h2>
        <div>
          <p><b>Name:</b> {{ message.attendee.name || 'No name provided' }}</p>
          <p><b>Email:</b> {{ message.attendee.email || 'No email provided' }}</p>
          <div class="mt-2" @click="handleNotesInput">
            <TagInput v-model="currentTags" />
          </div>
          <textarea
            v-model="notes"
            type="text"
            class="border-gray-300 mt-2 w-full rounded border p-2"
            placeholder="Take Notes"
            @focus="handleNotesInput"
            @input="handleNotesInput"
          />
          <div class="flex flex-row justify-around">
            <StandardButton
              type="submit"
              text="Save"
              @click="handleSave"
              class="btn-primary mt-6 w-1/4 justify-center"
            />
            <StandardButton
              type="submit"
              text="Cancel"
              @click="handleCancel"
              class="btn-secondary mt-6 w-1/4 justify-center"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
