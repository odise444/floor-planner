<template>
  <div class="bg-white rounded-lg shadow-lg w-64 max-h-96 flex flex-col">
    <div class="flex items-center justify-between p-3 border-b">
      <h3 class="font-semibold text-gray-800 text-sm">레이어</h3>
      <button
        class="text-gray-400 hover:text-gray-600"
        @click="$emit('close')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="allItemsCount === 0" class="text-center text-gray-400 text-sm py-4">
        레이어가 없습니다
      </div>

      <!-- 통합 레이어 목록 (방 + 이미지 + 가구) -->
      <div
        v-for="(item, index) in unifiedItems"
        :key="item.id"
        draggable="true"
        class="flex items-center gap-2 p-2 rounded cursor-grab transition-colors"
        :class="[
          isItemSelected(item) ? getSelectedClass(item.type) : 'hover:bg-gray-50',
          dragOverIndex === index ? 'border-t-2 border-blue-500' : '',
          draggingId === item.id ? 'opacity-50' : ''
        ]"
        @click="onItemClick(item)"
        @dragstart="onDragStart($event, item, index)"
        @dragend="onDragEnd"
        @dragover.prevent="onDragOver($event, index)"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop($event, index)"
      >
        <!-- 드래그 핸들 -->
        <div class="cursor-grab text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
          </svg>
        </div>

        <!-- 이미지인 경우 썸네일 -->
        <template v-if="item.type === 'image'">
          <div
            class="w-6 h-6 rounded border border-gray-300 flex-shrink-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${item.dataUrl})` }"
          />
        </template>
        <!-- 방인 경우 -->
        <template v-else-if="item.type === 'room'">
          <div
            class="w-6 h-6 rounded border-2 border-gray-600 flex-shrink-0 bg-white"
          />
        </template>
        <!-- 가구인 경우 색상 미리보기 -->
        <template v-else>
          <div
            class="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
            :style="{ backgroundColor: item.color }"
          />
        </template>

        <!-- 이름 -->
        <div class="flex-1 min-w-0">
          <div class="text-sm text-gray-800 truncate">{{ item.name }}</div>
          <div class="text-xs text-gray-400">
            <template v-if="item.type === 'image'">
              {{ Math.round((item.opacity ?? 1) * 100) }}% 투명도
              <span v-if="item.locked" class="ml-1">🔒</span>
            </template>
            <template v-else-if="item.type === 'room'">
              {{ Math.round(item.width) }}×{{ Math.round(item.height) }}px
            </template>
            <template v-else>
              {{ item.width }}×{{ item.height }}cm
            </template>
          </div>
        </div>

        <!-- 타입 아이콘 -->
        <div :class="getIconClass(item.type)">
          <svg v-if="item.type === 'image'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <!-- 방 아이콘 -->
          <svg v-else-if="item.type === 'room'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <!-- 가구 아이콘 -->
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        <!-- 레이어 순서 조절 버튼 -->
        <div class="flex flex-col gap-0.5">
          <button
            class="p-0.5 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="isTopmost(item)"
            title="위로"
            @click.stop="item.type === 'furniture' && $emit('move-forward', item.original as Furniture)"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            class="p-0.5 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="isBottommost(item)"
            title="아래로"
            @click.stop="item.type === 'furniture' && $emit('move-backward', item.original as Furniture)"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 하단 도구 -->
    <div class="border-t p-2 flex gap-1">
      <button
        class="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
        :disabled="!selectedId && !selectedImageId && !selectedRoomId"
        @click="$emit('bring-to-front')"
      >
        맨 앞으로
      </button>
      <button
        class="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
        :disabled="!selectedId && !selectedImageId && !selectedRoomId"
        @click="$emit('send-to-back')"
      >
        맨 뒤로
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Furniture } from '~/types/furniture'
import type { FloorPlanImage } from '~/utils/floorPlanImage'
import type { Room } from '~/utils/door'

// 통합 레이어 아이템 타입
interface UnifiedLayerItem {
  id: string
  type: 'furniture' | 'image' | 'room'
  name: string
  zIndex: number
  color?: string
  width: number
  height: number
  dataUrl?: string
  opacity?: number
  locked?: boolean
  original: Furniture | FloorPlanImage | Room
}

const props = defineProps<{
  items: Furniture[]
  selectedId: string | null
  image?: FloorPlanImage | null
  selectedImageId?: string | null
  room?: Room | null
  selectedRoomId?: string | null
}>()

const emit = defineEmits<{
  close: []
  select: [item: Furniture]
  'select-image': [image: FloorPlanImage]
  'select-room': [room: Room]
  'move-forward': [item: Furniture]
  'move-backward': [item: Furniture]
  'bring-to-front': []
  'send-to-back': []
  'reorder': [fromId: string, toIndex: number]
  'reorder-unified': [fromId: string, fromType: 'furniture' | 'image' | 'room', toIndex: number]
}>()

// 드래그 상태
const draggingId = ref<string | null>(null)
const draggingType = ref<'furniture' | 'image' | 'room' | null>(null)
const dragOverIndex = ref<number | null>(null)

// 통합 레이어 목록 (방 + 이미지 + 가구를 zIndex로 정렬)
const unifiedItems = computed((): UnifiedLayerItem[] => {
  const items: UnifiedLayerItem[] = []

  // 가구 추가
  for (const furniture of props.items) {
    items.push({
      id: furniture.id,
      type: 'furniture',
      name: furniture.name,
      zIndex: furniture.zIndex,
      color: furniture.color,
      width: furniture.width,
      height: furniture.height,
      original: furniture,
    })
  }

  // 이미지 추가
  if (props.image) {
    items.push({
      id: props.image.id,
      type: 'image',
      name: props.image.originalName || '평면도 이미지',
      zIndex: props.image.zIndex,
      width: props.image.width,
      height: props.image.height,
      dataUrl: props.image.dataUrl,
      opacity: props.image.opacity,
      locked: props.image.locked,
      original: props.image,
    })
  }

  // 방 추가
  if (props.room) {
    items.push({
      id: props.room.id,
      type: 'room',
      name: '방',
      zIndex: props.room.zIndex,
      width: props.room.width,
      height: props.room.height,
      opacity: props.room.opacity,
      original: props.room,
    })
  }

  // zIndex 내림차순 정렬 (높은 zIndex가 위에 표시)
  return items.sort((a, b) => b.zIndex - a.zIndex)
})

// 전체 아이템 수
const allItemsCount = computed(() => unifiedItems.value.length)

// 타입별 선택 스타일 클래스
const getSelectedClass = (type: 'furniture' | 'image' | 'room') => {
  switch (type) {
    case 'image':
      return 'bg-purple-50 border border-purple-200'
    case 'room':
      return 'bg-gray-100 border border-gray-300'
    default:
      return 'bg-blue-50 border border-blue-200'
  }
}

// 타입별 아이콘 색상 클래스
const getIconClass = (type: 'furniture' | 'image' | 'room') => {
  switch (type) {
    case 'image':
      return 'text-purple-500'
    case 'room':
      return 'text-gray-600'
    default:
      return 'text-blue-500'
  }
}

const isTopmost = (item: UnifiedLayerItem) => {
  if (unifiedItems.value.length <= 1) return true
  const maxZIndex = Math.max(...unifiedItems.value.map(i => i.zIndex))
  return item.zIndex === maxZIndex
}

const isBottommost = (item: UnifiedLayerItem) => {
  if (unifiedItems.value.length <= 1) return true
  const minZIndex = Math.min(...unifiedItems.value.map(i => i.zIndex))
  return item.zIndex === minZIndex
}

// 아이템 선택 핸들러
const onItemClick = (item: UnifiedLayerItem) => {
  if (item.type === 'furniture') {
    emit('select', item.original as Furniture)
  } else if (item.type === 'image') {
    emit('select-image', item.original as FloorPlanImage)
  } else if (item.type === 'room') {
    emit('select-room', item.original as Room)
  }
}

// 아이템이 선택되었는지 확인
const isItemSelected = (item: UnifiedLayerItem) => {
  if (item.type === 'furniture') {
    return props.selectedId === item.id
  } else if (item.type === 'image') {
    return props.selectedImageId === item.id
  } else if (item.type === 'room') {
    return props.selectedRoomId === item.id
  }
  return false
}

// 드래그 이벤트 핸들러
const onDragStart = (event: DragEvent, item: UnifiedLayerItem, _index: number) => {
  draggingId.value = item.id
  draggingType.value = item.type
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', item.id)
    event.dataTransfer.setData('item-type', item.type)
  }
}

const onDragEnd = () => {
  draggingId.value = null
  draggingType.value = null
  dragOverIndex.value = null
}

const onDragOver = (_event: DragEvent, index: number) => {
  dragOverIndex.value = index
}

const onDragLeave = () => {
  dragOverIndex.value = null
}

const onDrop = (_event: DragEvent, toIndex: number) => {
  if (draggingId.value && draggingType.value) {
    emit('reorder-unified', draggingId.value, draggingType.value, toIndex)
  }
  draggingId.value = null
  draggingType.value = null
  dragOverIndex.value = null
}
</script>
