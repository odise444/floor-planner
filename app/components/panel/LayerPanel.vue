<template>
  <div class="flex flex-col h-full">
    <!-- 헤더 -->
    <div class="p-4 border-b border-gray-200">
      <h2 class="font-medium text-gray-700">레이어</h2>
    </div>

    <!-- 레이어 목록 -->
    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="allItems.length === 0" class="text-center text-gray-400 text-sm py-4">
        레이어가 없습니다
      </div>

      <!-- 통합 레이어 목록 -->
      <div
        v-for="item in allItems"
        :key="item.id"
        class="flex items-center gap-2 p-2 rounded cursor-pointer transition-colors"
        :class="[
          isItemSelected(item) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
        ]"
        @click="onItemClick(item)"
      >
        <!-- 타입 아이콘 -->
        <div
          class="w-6 h-6 rounded border border-gray-300 flex-shrink-0 flex items-center justify-center"
          :style="{ backgroundColor: item.color }"
        >
          <span class="text-xs text-white">{{ getTypeIcon(item.type) }}</span>
        </div>

        <!-- 이름 -->
        <div class="flex-1 min-w-0">
          <div class="text-sm text-gray-800 truncate">{{ item.name }}</div>
          <div class="text-xs text-gray-400">
            {{ item.info }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Furniture } from '~/types/furniture'
import type { Wall } from '~/utils/wall'
import type { Door } from '~/types/door'
import type { FurnitureGroup } from '~/utils/group'

interface LayerItem {
  id: string
  type: 'furniture' | 'wall' | 'door' | 'group'
  name: string
  color?: string
  info: string
  zIndex: number
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
}>()

// Emits
const emit = defineEmits<{
  selectFurniture: [id: string]
  selectWall: [id: string]
  selectDoor: [id: string]
  selectGroup: [id: string]
  updateFurnitureOrder: [list: Furniture[]]
}>()

// 통합 레이어 목록
const allItems = computed((): LayerItem[] => {
  const items: LayerItem[] = []

  // 그룹 추가
  for (const group of props.groups) {
    items.push({
      id: group.id,
      type: 'group',
      name: group.name,
      color: group.color,
      info: `${group.members.length}개 객체`,
      zIndex: group.zIndex,
    })
  }

  // 가구 추가
  for (const furniture of props.furnitureList) {
    items.push({
      id: furniture.id,
      type: 'furniture',
      name: furniture.name,
      color: furniture.color,
      info: `${furniture.width}×${furniture.height}cm`,
      zIndex: furniture.zIndex,
    })
  }

  // 벽체 추가
  for (const wall of props.wallList) {
    items.push({
      id: wall.id,
      type: 'wall',
      name: wall.isExterior ? '외벽' : '내벽',
      color: wall.color,
      info: `두께: ${wall.thickness}cm`,
      zIndex: wall.zIndex,
    })
  }

  // 문 추가
  for (const door of props.doorList) {
    items.push({
      id: door.id,
      type: 'door',
      name: '문',
      color: '#8B4513',
      info: `${door.width}cm`,
      zIndex: 100,
    })
  }

  // zIndex로 정렬 (높은 것이 위에)
  items.sort((a, b) => b.zIndex - a.zIndex)

  return items
})

// 타입 아이콘
const getTypeIcon = (type: LayerItem['type']) => {
  switch (type) {
    case 'furniture': return '🪑'
    case 'wall': return '🧱'
    case 'door': return '🚪'
    case 'group': return '📦'
    default: return '•'
  }
}

// 아이템 선택 여부
const isItemSelected = (item: LayerItem) => {
  switch (item.type) {
    case 'furniture':
      return props.selectedFurnitureId === item.id
    case 'wall':
      return props.selectedWallId === item.id
    case 'door':
      return props.selectedDoorId === item.id
    case 'group':
      return props.selectedGroupId === item.id
    default:
      return false
  }
}

// 아이템 클릭 핸들러
const onItemClick = (item: LayerItem) => {
  switch (item.type) {
    case 'furniture':
      emit('selectFurniture', item.id)
      break
    case 'wall':
      emit('selectWall', item.id)
      break
    case 'door':
      emit('selectDoor', item.id)
      break
    case 'group':
      emit('selectGroup', item.id)
      break
  }
}
</script>
