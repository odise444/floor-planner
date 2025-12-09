<template>
  <footer class="h-6 bg-gray-100 border-t border-gray-200 flex items-center justify-between px-3 text-xs text-gray-600 shrink-0">
    <!-- 좌측: 현재 모드/도구 상태 -->
    <div class="flex items-center gap-4">
      <span class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-full" :class="modeIndicatorClass" />
        <span>{{ currentModeText }}</span>
      </span>
      <span v-if="activeTool" class="text-gray-500">
        도구: {{ activeToolText }}
      </span>
    </div>

    <!-- 중앙: 선택 정보 -->
    <div class="flex items-center gap-4">
      <span v-if="selectionInfo">{{ selectionInfo }}</span>
    </div>

    <!-- 우측: 줌 레벨 및 좌표 -->
    <div class="flex items-center gap-4">
      <span v-if="cursorPosition" class="text-gray-500">
        X: {{ cursorPosition.x }} Y: {{ cursorPosition.y }}
      </span>
      <span class="flex items-center gap-1">
        <button
          class="hover:bg-gray-200 px-1 rounded"
          @click="emit('zoomOut')"
        >
          −
        </button>
        <span class="w-12 text-center">{{ zoomPercent }}%</span>
        <button
          class="hover:bg-gray-200 px-1 rounded"
          @click="emit('zoomIn')"
        >
          +
        </button>
      </span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ModeType, ToolType } from '~/types/editor'

// Props
const props = defineProps<{
  mode: ModeType
  activeTool: ToolType | null
  zoom: number
  selectedCount: number
  cursorPosition?: { x: number; y: number } | null
}>()

// Emits
const emit = defineEmits<{
  zoomIn: []
  zoomOut: []
}>()

// 현재 모드 텍스트
const currentModeText = computed(() => {
  switch (props.mode) {
    case 'select': return '선택 모드'
    case 'wall': return '벽체 그리기'
    case 'door': return '문 배치'
    case 'furniture': return '가구 배치'
    case 'measure': return '측정 모드'
    default: return '선택 모드'
  }
})

// 모드 표시 색상
const modeIndicatorClass = computed(() => {
  switch (props.mode) {
    case 'wall': return 'bg-orange-500'
    case 'door': return 'bg-purple-500'
    case 'furniture': return 'bg-green-500'
    case 'measure': return 'bg-blue-500'
    default: return 'bg-gray-400'
  }
})

// 활성 도구 텍스트
const activeToolText = computed(() => {
  if (!props.activeTool) return ''
  switch (props.activeTool) {
    case 'select': return '선택'
    case 'pan': return '팬'
    case 'wall': return '벽체'
    case 'door': return '문'
    case 'window': return '창문'
    case 'furniture': return '가구'
    case 'measure': return '측정'
    default: return props.activeTool
  }
})

// 줌 퍼센트
const zoomPercent = computed(() => Math.round(props.zoom * 100))

// 선택 정보
const selectionInfo = computed(() => {
  if (props.selectedCount === 0) return null
  if (props.selectedCount === 1) return '1개 객체 선택됨'
  return `${props.selectedCount}개 객체 선택됨`
})
</script>
