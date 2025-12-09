<template>
  <button
    class="w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
    :class="buttonClass"
    :title="label"
    @click="emit('click')"
  >
    <!-- 아이콘 렌더링 -->
    <span class="text-lg">{{ iconEmoji }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string
  label: string
  active?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

// 버튼 스타일
const buttonClass = computed(() => {
  if (props.active) {
    return 'bg-gray-700 text-white'
  }
  return 'text-gray-400 hover:text-white hover:bg-gray-700'
})

// 아이콘을 이모지로 매핑
const iconEmoji = computed(() => {
  switch (props.icon) {
    case 'furniture': return '🪑'
    case 'layers': return '📚'
    case 'history': return '⏱️'
    case 'settings': return '⚙️'
    case 'select': return '👆'
    case 'wall': return '🧱'
    case 'door': return '🚪'
    case 'measure': return '📏'
    default: return '•'
  }
})
</script>
