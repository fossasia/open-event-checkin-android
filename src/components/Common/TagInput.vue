<script setup>
import { onMounted } from 'vue'
import { useTagStore } from '@/stores/tags'
import { storeToRefs } from 'pinia'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const tagStore = useTagStore()
const { availableTags, currentTags, inputValue } = storeToRefs(tagStore)

onMounted(() => {
  tagStore.fetchTags()
})
console.log(availableTags)
function handleInput(e) {
  tagStore.handleCommaInput(e.target.value)
  emit('update:modelValue', currentTags.value)
}

function handleKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (inputValue.value) {
      tagStore.addTag(inputValue.value)
      inputValue.value = ''
      emit('update:modelValue', currentTags.value)
    }
  } else if (e.key === 'Backspace' && !inputValue.value && currentTags.value.length > 0) {
    tagStore.removeTag(currentTags.value.length - 1)
    emit('update:modelValue', currentTags.value)
  }
}

function addExistingTag(tag) {
  tagStore.addTag(tag)
  emit('update:modelValue', currentTags.value)
}

function removeTag(index) {
  tagStore.removeTag(index)
  emit('update:modelValue', currentTags.value)
}
</script>

<template>
  <div class="w-full">
    <div class="mb-2 flex flex-wrap gap-2">
      <!-- Current tags -->
      <div
        v-for="(tag, index) in currentTags"
        :key="index"
        class="items-center rounded-full bg-primary px-2 py-1 text-sm text-white hover:bg-danger"
        @click="removeTag(index)"
      >
        {{ tag }}
      </div>
    </div>

    <!-- Available tags -->
    <div class="mb-2 flex flex-wrap gap-2">
      <button
        v-for="tag in availableTags.filter((t) => !currentTags.includes(t))"
        :key="tag"
        @click="addExistingTag(tag)"
        class="rounded-full border px-2 py-1 text-sm text-black hover:bg-secondary hover:text-white"
      >
        + {{ tag }}
      </button>
    </div>

    <!-- Tag input -->
    <input
      v-model="inputValue"
      type="text"
      class="w-full rounded border p-2"
      placeholder="Add tags (comma-separated)"
      @input="handleInput"
      @keydown="handleKeydown"
      @focus="tagStore.fetchTags()"
    />
  </div>
</template>
