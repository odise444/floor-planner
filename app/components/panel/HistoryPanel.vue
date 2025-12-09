<template>
  <div class="flex flex-col h-full">
    <!-- 헤더 -->
    <div class="p-4 border-b border-gray-200">
      <h2 class="font-medium text-gray-700">히스토리</h2>
    </div>

    <!-- 히스토리 컨트롤 -->
    <div class="p-4 space-y-3">
      <div class="flex gap-2">
        <button
          class="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          :disabled="!canUndo"
          @click="emit('undo')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          실행 취소
        </button>
        <button
          class="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          :disabled="!canRedo"
          @click="emit('redo')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
          다시 실행
        </button>
      </div>

      <div class="text-xs text-gray-500 text-center">
        단축키: Ctrl+Z (실행 취소), Ctrl+Y (다시 실행)
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  canUndo: boolean
  canRedo: boolean
}>()

const emit = defineEmits<{
  undo: []
  redo: []
}>()
</script>
