<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoadingStore } from '@/stores/loading'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useEventyayApi } from '@/stores/eventyayapi'
import StandardButton from '@/components/Common/StandardButton.vue'

// stores
const loadingStore = useLoadingStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const processApi = useEventyayApi()

const email = ref('')
const password = ref('')
const server = ref('')
const showError = ref(false)
const showServerError = ref(false)
const errmessage = ref('')
const DEFAULT_SERVER_VALUE = 'Select a Server'
// router
const router = useRouter()

async function submitLogin() {
  if (server.value === '' || server.value === DEFAULT_SERVER_VALUE) {
    showServerError.value = true
    return
  }
  if (server.value === 'Eventyay') {
    errmessage.value = 'Please Register a Device for Eventyay'
    showServerError.value = true
    return
  }
  showServerError.value = false
  loadingStore.contentLoading()
  showError.value = false

  const payload = {
    email: email.value,
    password: password.value
  }

  await authStore
    .login(payload)
    .then(async () => {
      await userStore.getUserDetails()
      router.push({
        name: 'selectStation'
      })
    })
    .catch((err) => {
      showError.value = true
    })

  loadingStore.contentLoaded()
}

function registerDevice() {
  if (server.value === '' || server.value === 'Select a Server') {
    errmessage.value = 'Please select a server first'
    showServerError.value = true
    return
  }
  if (server.value === 'Open-Event') {
    errmessage.value = 'Please Login with credentials for Open-Event'
    showServerError.value = true
    return
  }
  showServerError.value = false
  router.push({
    name: 'device'
  })
}

function handleRoleSelection(role) {
  processApi.setRole(role)
  registerDevice() // Store the selected role in the store
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push({
      name: 'selectStation'
    })
  }

  loadingStore.contentLoaded()
})
</script>

<template>
  <div class="-mt-16 flex h-screen flex-col justify-center">
    <div class="my-auto sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="text-center">Select Server and Purpose</h2>
      <div class="mt-10 space-y-3">
        <div>
          <label for="select">Select a Server</label>
          <select id="select" v-model="server" class="mt-2 block w-full">
            <option>Open-Event</option>
            <option>Eventyay</option>
            <option>Testing</option>
          </select>
        </div>
        <div>
          <StandardButton
            type="button"
            text="I am a Exhibitor"
            class="btn-primary mt-6 w-full justify-center"
            @click="handleRoleSelection('Exhibitor')"
          />
        </div>
        <div>
          <StandardButton
            type="button"
            text="I am a Checkin Staff"
            class="btn-primary mt-6 w-full justify-center"
            @click="handleRoleSelection('CheckIn')"
          />
        </div>
        <div>
          <StandardButton
            type="button"
            text="Badge Printing Station"
            class="btn-primary mt-6 w-full justify-center"
            @click="handleRoleSelection('Badge Station')"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-if="showServerError" class="mt-5">
    <p class="text-center text-sm text-danger">{{ errmessage }}</p>
  </div>
</template>
