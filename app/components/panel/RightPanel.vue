<template>
  <aside
    v-if="hasSelection"
    class="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0"
  >
    <!-- 헤더 -->
    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
      <h2 class="font-medium text-gray-700">{{ panelTitle }}</h2>
      <button
        class="text-gray-400 hover:text-gray-600"
        @click="emit('close')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 선택된 객체에 따른 편집 폼 -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- 가구 편집 -->
      <EditorFurnitureEditForm
        v-if="selectedFurniture"
        :furniture="selectedFurniture"
        @update="emit('updateFurniture', $event)"
        @delete="emit('deleteFurniture')"
      />

      <!-- 벽체 편집 -->
      <EditorWallEditForm
        v-else-if="selectedWall"
        :wall="selectedWall"
        @update="emit('updateWall', $event)"
        @delete="emit('deleteWall')"
      />

      <!-- 문 편집 -->
      <EditorDoorEditForm
        v-else-if="selectedDoor"
        :door="selectedDoor"
        @update="emit('updateDoor', $event)"
        @delete="emit('deleteDoor')"
      />

      <!-- 다중 선택 정보 -->
      <div v-else-if="multiSelectedCount > 0" class="space-y-4">
        <div class="text-center text-gray-600">
          <span class="text-2xl font-bold text-blue-500">{{ multiSelectedCount }}</span>
          <span class="text-sm ml-1">개 객체 선택됨</span>
        </div>

        <div class="space-y-2">
          <button
            class="w-full px-3 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            @click="emit('groupSelected')"
          >
            그룹화 (Ctrl+G)
          </button>
          <button
            class="w-full px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            @click="emit('deleteSelected')"
          >
            선택 삭제 (Delete)
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Furniture } from '~/types/furniture'
import type { Wall } from '~/utils/wall'
import type { Door } from '~/types/door'

// Props
const props = defineProps<{
  selectedFurniture: Furniture | null
  selectedWall: Wall | null
  selectedDoor: Door | null
  multiSelectedCount: number
}>()

// Emits
const emit = defineEmits<{
  close: []
  updateFurniture: [furniture: Partial<Furniture>]
  deleteFurniture: []
  updateWall: [wall: Partial<Wall>]
  deleteWall: []
  updateDoor: [door: Partial<Door>]
  deleteDoor: []
  groupSelected: []
  deleteSelected: []
}>()

// 선택된 항목이 있는지
const hasSelection = computed(() => {
  return props.selectedFurniture || props.selectedWall || props.selectedDoor || props.multiSelectedCount > 0
})

// 패널 제목
const panelTitle = computed(() => {
  if (props.selectedFurniture) return '가구 편집'
  if (props.selectedWall) return '벽체 편집'
  if (props.selectedDoor) return '문 편집'
  if (props.multiSelectedCount > 0) return '다중 선택'
  return '속성'
})
</script>
