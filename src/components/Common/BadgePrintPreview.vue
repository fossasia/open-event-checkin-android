<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import StandardButton from '@/components/Common/StandardButton.vue'
import { useEventyayApi } from '@/stores/eventyayapi'

const processApi = useEventyayApi()
const { apitoken, url, organizer, eventSlug, eventname } = processApi
const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

// State Management
const isLoading = ref(true)
const printError = ref(false)
const pdfUrl = ref(null)
const pdfBlob = ref(null)
const hiddenFrame = ref(null)

// PDF Fetching
const fetchPDF = async () => {
  try {
    const response = await fetch(props.url, {
      method: 'GET',
      headers: {
        Authorization: `Device ${apitoken}`,
        Accept: 'application/json'
      },
      credentials: 'include'
    })
    console.log('Response:', response)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    pdfBlob.value = await response.blob()
    pdfUrl.value = URL.createObjectURL(pdfBlob.value)
    isLoading.value = false
  } catch (error) {
    console.error('Error fetching PDF:', error)
    printError.value = true
    isLoading.value = false
  }
}

// Print Strategies
const printStrategies = {
  // Fallback to standard print dialog
  standardPrint() {
    if (!pdfUrl.value) return

    const printWindow = window.open(pdfUrl.value)
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        try {
          printWindow.print()
        } catch (error) {
          console.error('Standard print failed:', error)
          printError.value = true
        }
      })
    }
  },

  // Hidden iframe print attempt
  silentPrint() {
    if (!pdfUrl.value) return

    try {
      // Create hidden iframe if it doesn't exist
      if (!hiddenFrame.value) {
        hiddenFrame.value = document.createElement('iframe')
        hiddenFrame.value.style.position = 'fixed'
        hiddenFrame.value.style.width = '1px'
        hiddenFrame.value.style.height = '1px'
        hiddenFrame.value.style.opacity = '0.01'
        document.body.appendChild(hiddenFrame.value)
      }

      hiddenFrame.value.src = pdfUrl.value

      hiddenFrame.value.onload = () => {
        try {
          hiddenFrame.value.contentWindow.print()
        } catch (error) {
          console.error('Silent print failed:', error)
          this.standardPrint()
        }
      }
    } catch (error) {
      console.error('Silent print preparation failed:', error)
      this.standardPrint()
    }
  }
}

// PDF Viewer Strategies
// Determine best PDF viewer

// Print handler with multiple strategies
const handlePrint = () => {
  // Try silent print first
  printStrategies.silentPrint()
}

// Download handler
const handleDownload = () => {
  if (!pdfBlob.value) return

  const downloadUrl = URL.createObjectURL(pdfBlob.value)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = 'badge.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)
}

// Lifecycle hooks
onMounted(() => {
  fetchPDF()
})

function reload() {
  window.location.reload()
}

onBeforeUnmount(() => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value)
  }
  if (hiddenFrame.value) {
    document.body.removeChild(hiddenFrame.value)
  }
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="relative rounded-lg bg-white p-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white">
        <div class="text-center">
          <div class="border-gray-900 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p class="mt-2">Loading badge preview...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="printError" class="bg-red-100 mb-4 rounded-lg p-4">
        <p class="text-red-700">
          Badge Might Not be ready yet, please
          <span class="text-primary" @click="reload">refresh</span> and Try Again
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="mb-4 flex gap-2">
        <StandardButton
          type="button"
          text="Print"
          @click="handlePrint"
          class="btn-primary"
          :disabled="isLoading || !pdfUrl"
        />
        <StandardButton
          type="button"
          text="Download"
          @click="handleDownload"
          class="btn-secondary"
          :disabled="isLoading || !pdfBlob"
        />
        <StandardButton type="button" text="Close" @click="emit('close')" class="btn-white" />
      </div>

      <!-- PDF Preview -->
    </div>
  </div>
</template>

<style scoped>
/* Ensure full visibility of PDF viewer */
iframe,
object {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
