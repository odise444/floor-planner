<template>
  <div :data-testid="`section-${sectionId}`" class="border-b border-gray-700">
    <!-- 섹션 헤더 -->
    <button
      data-testid="section-header"
      class="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-800 transition-colors"
      @click="isOpen = !isOpen"
    >
      <span class="text-xs font-medium text-gray-300">{{ title }}</span>
      <svg
        class="w-3 h-3 text-gray-500 transition-transform"
        :class="{ 'rotate-180': !isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- 섹션 내용 -->
    <div
      v-if="isOpen"
      data-testid="section-content"
      class="px-3 pb-3"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  sectionId: string
  defaultOpen?: boolean
}>()

const isOpen = ref(props.defaultOpen ?? true)
</script>
