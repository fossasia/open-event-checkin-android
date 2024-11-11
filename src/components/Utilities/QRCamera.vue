<script setup>
import { onBeforeMount, ref, nextTick, onMounted, onUnmounted } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import StandardButton from '@/components/Common/StandardButton.vue'
import { useCameraStore } from '@/stores/camera'
import RefreshButton from '@/components/Utilities/RefreshButton.vue'
import { ArrowsRightLeftIcon, VideoCameraIcon } from '@heroicons/vue/20/solid'

const cameraStore = useCameraStore()

const emit = defineEmits(['scanned'])
const destroyed = ref(false)
const isCameraOn = ref(false)
let inactivityTimer = null

onMounted(() => {
  startInactivityTimer()
})

onUnmounted(() => {
  clearInactivityTimer()
})

// get list of camera devices of device and side
onBeforeMount(() => {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        let environmentCameras = []
        devices.forEach((device) => {
          if (device.kind === 'videoinput') {
            const facingMode = device.getCapabilities().facingMode
            const id = device.deviceId
            let obj = {}
            obj.id = id
            obj.facing = facingMode[0]
            cameraStore.cameraDevices.push(obj)

            if (facingMode[0] === 'environment') {
              environmentCameras.push(obj)
            }
          }
        })

        // select last of environment cameras
        if (environmentCameras.length > 0) {
          cameraStore.selectedCameraId.deviceId =
            environmentCameras[environmentCameras.length - 1].id
        } else {
          cameraStore.selectedCameraId.deviceId = cameraStore.cameraDevices[0].id
        }
      })
      .catch(function (err) {
        console.log(err.name + ': ' + err.message)
      })
  }
})

async function detectedQR([result]) {
  if (result) {
    // check if previous data is same
    if (cameraStore.qrCodeValue === result.rawValue) {
      return
    }
    cameraStore.qrCodeValue = result.rawValue
    emit('scanned')
  }
}

function switchCamera() {
  destroyed.value = true
  cameraStore.toggleCameraSide()
  nextTick(() => {
    destroyed.value = false
  })
  startInactivityTimer()
}

function toggleCamera() {
  isCameraOn.value = !isCameraOn.value
  cameraStore.paused = !isCameraOn.value
  startInactivityTimer()
}

function startInactivityTimer() {
  clearInactivityTimer()
  inactivityTimer = setTimeout(() => {
    isCameraOn.value = false
    cameraStore.paused = true
  }, 25000) // 25 seconds
}

function clearInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer)
    inactivityTimer = null
  }
}
</script>

<template>
  <qrcode-stream
    v-if="!destroyed && isCameraOn"
    class="!aspect-square !h-auto max-w-sm"
    :paused="cameraStore.paused"
    :track="cameraStore.selected.value"
    :constraints="cameraStore.selectedCameraId"
    @error="cameraStore.logErrors"
    @detect="detectedQR"
  />
  <div class="space-x-3">
    <StandardButton
      :text="isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'"
      :icon="isCameraOn ? VideoCameraIcon : VideoCameraIcon"
      class="mt-4 bg-primary"
      @click="toggleCamera"
    />
    <StandardButton
      :text="'Switch Camera'"
      :icon="ArrowsRightLeftIcon"
      class="mt-4 bg-primary"
      @click="switchCamera"
    />
    <RefreshButton class="mt-4" />
  </div>
</template>
