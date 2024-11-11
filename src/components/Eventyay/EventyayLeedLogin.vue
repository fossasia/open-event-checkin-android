<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoadingStore } from '@/stores/loading'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useleedauth } from '@/stores/leedauth'
import StandardButton from '@/components/Common/StandardButton.vue'

const loadingStore = useLoadingStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const leedauth = useleedauth()
const showError = ref(false)
const userId = ref('')
const password = ref('')
const server = ref('')
// router
const router = useRouter()

async function submitLogin() {
  const payload = {
    key: password.value
  }
  const response = await leedauth.leedlogin(payload)
  console.log(response)
  if (response.success) {
    router.push({ name: 'leadscan' })
  } else {
    showError.value = true
  }
}
loadingStore.contentLoaded()
</script>

<template>
  <div class="-mt-16 flex h-screen flex-col justify-center">
    <div class="my-auto sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="text-center">Sign in with your Exhibitor credentials</h2>
      <form class="mt-10 space-y-3" @submit.prevent="submitLogin">
        <div>
          <label for="password">Exhibitor Key</label>
          <div class="mt-2">
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required="true"
              class="block w-full"
            />
          </div>
        </div>

        <div>
          <StandardButton
            type="submit"
            text="Authenticate"
            class="btn-primary mt-6 w-full justify-center"
          />
        </div>

        <div v-if="showError">
          <p class="text-sm text-danger">Wrong credentials or Exhibitor does not exist</p>
        </div>
      </form>
    </div>
  </div>
</template>
