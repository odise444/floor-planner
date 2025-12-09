<template>
  <button
    class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
    :disabled="disabled"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    @click="handleClick"
  >
    <span class="flex items-center gap-2">
      <span v-if="icon" class="w-4 text-center">{{ icon }}</span>
      <span>{{ label }}</span>
    </span>
    <span v-if="shortcut" class="text-xs text-gray-400">{{ shortcut }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  icon?: string
  shortcut?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>
