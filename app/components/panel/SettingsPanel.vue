<template>
  <div class="flex flex-col h-full">
    <!-- 헤더 -->
    <div class="p-4 border-b border-gray-200">
      <h2 class="font-medium text-gray-700">설정</h2>
    </div>

    <!-- 설정 목록 -->
    <div class="p-4 space-y-4">
      <!-- 그리드 표시 -->
      <div class="flex items-center justify-between">
        <label class="text-sm text-gray-700">그리드 표시</label>
        <button
          class="w-10 h-6 rounded-full transition-colors relative"
          :class="showGrid ? 'bg-blue-500' : 'bg-gray-300'"
          @click="emit('update:showGrid', !showGrid)"
        >
          <span
            class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
            :class="showGrid ? 'left-5' : 'left-1'"
          />
        </button>
      </div>

      <!-- 그리드에 스냅 -->
      <div class="flex items-center justify-between">
        <label class="text-sm text-gray-700">그리드에 스냅</label>
        <button
          class="w-10 h-6 rounded-full transition-colors relative"
          :class="snapToGrid ? 'bg-blue-500' : 'bg-gray-300'"
          @click="emit('update:snapToGrid', !snapToGrid)"
        >
          <span
            class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
            :class="snapToGrid ? 'left-5' : 'left-1'"
          />
        </button>
      </div>

      <!-- 그리드 크기 -->
      <div class="space-y-2">
        <label class="text-sm text-gray-700">그리드 크기</label>
        <div class="flex items-center gap-2">
          <input
            type="range"
            :value="gridSize"
            min="10"
            max="100"
            step="10"
            class="flex-1"
            @input="emit('update:gridSize', Number(($event.target as HTMLInputElement).value))"
          />
          <span class="text-sm text-gray-500 w-12 text-right">{{ gridSize }}px</span>
        </div>
      </div>

      <!-- 구분선 -->
      <hr class="border-gray-200" />

      <!-- 단축키 안내 -->
      <div class="space-y-2">
        <h3 class="text-sm font-medium text-gray-700">단축키</h3>
        <div class="text-xs text-gray-500 space-y-1">
          <div class="flex justify-between">
            <span>선택 삭제</span>
            <span class="text-gray-400">Delete</span>
          </div>
          <div class="flex justify-between">
            <span>회전</span>
            <span class="text-gray-400">R</span>
          </div>
          <div class="flex justify-between">
            <span>실행 취소</span>
            <span class="text-gray-400">Ctrl+Z</span>
          </div>
          <div class="flex justify-between">
            <span>다시 실행</span>
            <span class="text-gray-400">Ctrl+Y</span>
          </div>
          <div class="flex justify-between">
            <span>그룹화</span>
            <span class="text-gray-400">Ctrl+G</span>
          </div>
          <div class="flex justify-between">
            <span>그룹 해제</span>
            <span class="text-gray-400">Ctrl+Shift+G</span>
          </div>
          <div class="flex justify-between">
            <span>레이어 패널</span>
            <span class="text-gray-400">L</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
}>()

const emit = defineEmits<{
  'update:showGrid': [value: boolean]
  'update:snapToGrid': [value: boolean]
  'update:gridSize': [value: number]
}>()
</script>
