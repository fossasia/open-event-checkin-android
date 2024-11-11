import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEventyayApi = defineStore(
  'processApi',
  () => {
    const apitoken = ref('')
    const url = ref('')
    const organizer = ref('')
    const eventSlug = ref('')
    const eventname = ref('')
    const exikey = ref('')
    const selectedRole = ref('')
    const exhiname = ref('')
    const boothname = ref('')
    const boothid = ref('')

    function $reset() {
      apitoken.value = ''
      url.value = ''
      organizer.value = ''
      eventSlug.value = ''
      eventname.value = ''
      exikey.value = ''
      selectedRole.value = ''
      exhiname.value = ''
      boothname.value = ''
      boothid.value = ''
    }

    function setApiCred(newToken, newUrl, newOrg) {
      apitoken.value = newToken
      url.value = newUrl
      organizer.value = newOrg
    }

    function setEvent(slug, name) {
      eventSlug.value = slug
      eventname.value = name
    }

    function setExhibitor(key, name, booth, bid) {
      exikey.value = key
      exhiname.value = name
      boothname.value = booth
      boothid.value = bid
    }

    function setRole(role) {
      selectedRole.value = role
    }

    return {
      $reset,
      setApiCred,
      setEvent,
      setExhibitor,
      selectedRole,
      setRole,
      apitoken,
      url,
      organizer,
      eventSlug,
      eventname,
      exikey,
      exhiname,
      boothname,
      boothid
    }
  },
  {
    persist: true
  }
)
