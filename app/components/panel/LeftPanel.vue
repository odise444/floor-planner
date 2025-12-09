<template>
  <aside class="flex h-full">
    <!-- Activity Bar (아이콘 네비게이션) -->
    <nav class="w-12 bg-gray-800 flex flex-col items-center py-2 shrink-0">
      <!-- 상단 아이콘 그룹 -->
      <div class="flex flex-col gap-1">
        <PanelToolbarButton
          v-for="item in topItems"
          :key="item.id"
          :icon="item.icon"
          :label="item.label"
          :active="activePanel === item.id"
          @click="onPanelClick(item.id)"
        />
      </div>

      <!-- 하단 아이콘 그룹 -->
      <div class="mt-auto flex flex-col gap-1">
        <PanelToolbarButton
          v-for="item in bottomItems"
          :key="item.id"
          :icon="item.icon"
          :label="item.label"
          :active="activePanel === item.id"
          @click="onPanelClick(item.id)"
        />
      </div>
    </nav>

    <!-- 사이드바 패널 (확장 영역) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="w-0 opacity-0"
      enter-to-class="w-64 opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="w-64 opacity-100"
      leave-to-class="w-0 opacity-0"
    >
      <div
        v-if="isPanelOpen"
        class="w-64 bg-white border-r border-gray-200 overflow-hidden"
      >
        <!-- 가구 라이브러리 -->
        <SidebarFurnitureLibrary
          v-if="activePanel === 'furniture'"
          @add-door="emit('addDoor')"
        />

        <!-- 레이어 패널 -->
        <PanelLayerPanel
          v-else-if="activePanel === 'layers'"
          :furniture-list="furnitureList"
          :wall-list="wallList"
          :door-list="doorList"
          :groups="groups"
          :selected-furniture-id="selectedFurnitureId"
          :selected-wall-id="selectedWallId"
          :selected-door-id="selectedDoorId"
          :selected-group-id="selectedGroupId"
          @select-furniture="emit('selectFurniture', $event)"
          @select-wall="emit('selectWall', $event)"
          @select-door="emit('selectDoor', $event)"
          @select-group="emit('selectGroup', $event)"
          @update-furniture-order="emit('updateFurnitureOrder', $event)"
        />

        <!-- 히스토리 패널 -->
        <PanelHistoryPanel
          v-else-if="activePanel === 'history'"
          :can-undo="canUndo"
          :can-redo="canRedo"
          @undo="emit('undo')"
          @redo="emit('redo')"
        />

        <!-- 설정 패널 -->
        <PanelSettingsPanel
          v-else-if="activePanel === 'settings'"
          :show-grid="showGrid"
          :snap-to-grid="snapToGrid"
          :grid-size="gridSize"
          @update:show-grid="emit('update:showGrid', $event)"
          @update:snap-to-grid="emit('update:snapToGrid', $event)"
          @update:grid-size="emit('update:gridSize', $event)"
        />
      </div>
    </Transition>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Furniture } from '~/types/furniture'
import type { Wall } from '~/utils/wall'
import type { Door } from '~/types/door'
import type { FurnitureGroup } from '~/utils/group'

export type PanelId = 'furniture' | 'layers' | 'history' | 'settings'

interface ActivityItem {
  id: PanelId
  icon: string
  label: string
}

// Props
const props = defineProps<{
  furnitureList: Furniture[]
  wallList: Wall[]
  doorList: Door[]
  groups: FurnitureGroup[]
  selectedFurnitureId: string | null
  selectedWallId: string | null
  selectedDoorId: string | null
  selectedGroupId: string | null
  canUndo: boolean
  canRedo: boolean
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
}>()

// Emits
const emit = defineEmits<{
  addDoor: []
  selectFurniture: [id: string]
  selectWall: [id: string]
  selectDoor: [id: string]
  selectGroup: [id: string]
  updateFurnitureOrder: [list: Furniture[]]
  undo: []
  redo: []
  'update:showGrid': [value: boolean]
  'update:snapToGrid': [value: boolean]
  'update:gridSize': [value: number]
}>()

// Activity Bar Items
const topItems: ActivityItem[] = [
  { id: 'furniture', icon: 'furniture', label: '가구 라이브러리' },
  { id: 'layers', icon: 'layers', label: '레이어' },
  { id: 'history', icon: 'history', label: '히스토리' },
]

const bottomItems: ActivityItem[] = [
  { id: 'settings', icon: 'settings', label: '설정' },
]

// 활성 패널
const activePanel = ref<PanelId | null>('furniture')

// 패널이 열려있는지 확인
const isPanelOpen = computed(() => activePanel.value !== null)

// 패널 클릭 핸들러 (토글)
const onPanelClick = (id: PanelId) => {
  if (activePanel.value === id) {
    activePanel.value = null
  } else {
    activePanel.value = id
  }
}
</script>
