<script setup>
import { ref, onBeforeMount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useLoadingStore } from '@/stores/loading'
import { useNavbarStore } from '@/stores/navbar'
import { useUserStore } from '@/stores/user'
import PasswordModal from '@/components/Modals/PasswordModal.vue'
import { useEventyayApi } from '@/stores/eventyayapi'

const router = useRouter()
const loadingStore = useLoadingStore()
const navbarStore = useNavbarStore()
const userStore = useUserStore()
const processApi = useEventyayApi()
loadingStore.navbarLoaded()

const showLogout = ref(false)

function logout() {
  processApi.$reset()
  router.push({ name: 'userAuth' })
}

watch(
  () => processApi.apitoken,
  (newValue) => {
    showLogout.value = newValue !== ''
  },
  { immediate: true }
)
</script>

<template>
  <Disclosure v-slot="{ open }" as="header" class="sticky top-0 z-10 bg-white shadow">
    <div class="mx-auto max-w-7xl px-2 sm:px-4 lg:divide-y lg:divide-secondary-light lg:px-8">
      <div class="flex h-16 items-center justify-between space-x-5">
        <div>
          <div>Eventyay</div>
        </div>
        <div v-if="showLogout">
          <button
            @click="logout"
            class="rounded px-4 py-2 text-danger transition-colors hover:bg-danger hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </Disclosure>
</template>
