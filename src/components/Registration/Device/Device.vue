<script setup>
import QRCamera from '@/components/Common/QRCamera.vue'
import StandardButton from '@/components/Common/StandardButton.vue'
import { useLoadingStore } from '@/stores/loading'
import { useProcessDeviceStore } from '@/stores/processDevice'
import { useEventyayApi } from '@/stores/eventyayapi'
import { ref } from 'vue'

const loadingStore = useLoadingStore()
loadingStore.contentLoaded()
const processApi = useEventyayApi()
const { selectedRole } = processApi

const processDeviceStore = useProcessDeviceStore()
const showError = ref(false)
</script>

<template>
  <div class="flex h-screen w-full flex-col items-center justify-center text-center">
    <h1 class="text-4xl font-bold">Welcome {{ selectedRole.toUpperCase() }}</h1>
    <QRCamera qr-type="device" scan-type="Device Registration" />
    <p class="text-center">
      Please contact your organiser to provide the QR Code to you.<br />
      You need one QR code per device.
    </p>
    <div v-if="showError">
      <p class="text-sm text-danger">Oops! something went wrong</p>
    </div>
  </div>
</template>
