<script setup>
import { useRoute } from 'vue-router'
import QRCamera from '@/components/Utilities/QRCamera.vue'
import { useCameraStore } from '@/stores/camera'
import { useProcessRegistrationStore } from '@/stores/processRegistration'
import { useProcessCheckInStore } from '@/stores/processCheckIn'
import { useProcessDeviceStore } from '@/stores/processDevice'
import { useProcessEventyayCheckInStore } from '@/stores/processEventyayCheckIn'
import { useLeadScanStore } from '@/stores/leadscan'
import { storeToRefs } from 'pinia'

const props = defineProps({
  qrType: {
    type: String,
    required: true
  },
  scanType: {
    type: String,
    default: ''
  },
  details: {
    type: String,
    default: ''
  }
})

const cameraStore = useCameraStore()
const processRegistrationStore = useProcessRegistrationStore()
const processCheckInStore = useProcessCheckInStore()
const processDeviceStore = useProcessDeviceStore()
const processEventyayCheckIn = useProcessEventyayCheckInStore()
const processLeadScan = useLeadScanStore()

const route = useRoute()
const stationId = route.params.stationId
const scannerType = route.params.scannerType

async function processQR() {
  cameraStore.paused = true
  if (props.qrType === 'registration') {
    await processRegistrationStore.registerAttendeeScanner(stationId)
  }

  if (props.qrType === 'checkIn') {
    await processCheckInStore.checkInAttendeeScannerToRoom(stationId, scannerType)
  }
  if (props.qrType === 'device') {
    await processDeviceStore.authDevice()
  }
  if (props.qrType === 'eventyaycheckin') {
    await processEventyayCheckIn.checkIn()
  }
  if (props.qrType === 'eventyaylead') {
    await processLeadScan.scanLead()
  }
  cameraStore.paused = false
}
</script>
<template>
  <!-- padding to counter camera in mobile view -->
  <div class="pt-2 text-center">
    <h2 class="mb-3">
      Scan QR<span v-if="scanType" class="capitalize"> - {{ scanType }}</span>
    </h2>
    <h3 v-if="details" class="mb-3">{{ details }}</h3>
    <QRCamera @scanned="processQR"></QRCamera>
  </div>
</template>
