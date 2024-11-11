import { useEventyayApi } from '@/stores/eventyayapi'
import { mande } from 'mande'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTagStore = defineStore('tags', () => {
  const availableTags = ref([])
  const currentTags = ref([])
  const inputValue = ref('')

  async function fetchTags() {
    const processApi = useEventyayApi()
    const { url, organizer, eventSlug, apitoken, exikey } = processApi

    try {
      const api = mande(`${url}/api/v1/event/${organizer}/${eventSlug}/exhibitors/tags`, {
        headers: {
          Authorization: `Device ${apitoken}`,
          Accept: 'application/json',
          Exhibitor: exikey
        }
      })

      const response = await api.get()
      if (response.success) {
        availableTags.value = response.tags
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  function addTag(tag) {
    const trimmedTag = tag.trim()
    if (trimmedTag && !currentTags.value.includes(trimmedTag)) {
      currentTags.value = [...currentTags.value, trimmedTag]
    }
  }

  function removeTag(index) {
    currentTags.value = currentTags.value.filter((_, i) => i !== index)
  }

  function handleCommaInput(value) {
    if (value.endsWith(',')) {
      const tag = value.slice(0, -1).trim()
      if (tag) {
        addTag(tag)
        inputValue.value = ''
      }
    } else {
      inputValue.value = value
    }
  }

  function reset() {
    currentTags.value = []
    inputValue.value = ''
  }

  return {
    availableTags,
    currentTags,
    inputValue,
    fetchTags,
    addTag,
    removeTag,
    handleCommaInput,
    reset
  }
})
