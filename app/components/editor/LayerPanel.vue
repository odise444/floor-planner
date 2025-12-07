<template>
  <div class="bg-white rounded-lg shadow-lg w-72 max-h-[500px] flex flex-col">
    <div class="flex items-center justify-between p-3 border-b">
      <h3 class="font-semibold text-gray-800 text-sm">레이어</h3>
      <div class="flex items-center gap-2">
        <!-- 선택 모드 토글 -->
        <button
          class="p-1 rounded"
          :class="isSelectionMode ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'"
          title="다중 선택 모드"
          @click="toggleSelectionMode"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          class="text-gray-400 hover:text-gray-600"
          @click="$emit('close')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 선택된 항목 수 표시 -->
    <div v-if="isSelectionMode && checkedItems.length > 0" class="px-3 py-2 bg-purple-50 border-b text-xs text-purple-700">
      {{ checkedItems.length }}개 선택됨
      <button class="ml-2 underline" @click="clearSelection">선택 해제</button>
    </div>

    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="allItemsCount === 0" class="text-center text-gray-400 text-sm py-4">
        레이어가 없습니다
      </div>

      <!-- 통합 레이어 목록 -->
      <div
        v-for="(item, index) in unifiedItems"
        :key="item.id"
        draggable="true"
        class="flex items-center gap-2 p-2 rounded cursor-grab transition-colors"
        :class="[
          isItemChecked(item) ? 'bg-purple-50 border border-purple-300' :
          isItemSelected(item) ? getSelectedClass(item.type) : 'hover:bg-gray-50',
          dragOverIndex === index ? 'border-t-2 border-blue-500' : '',
          draggingId === item.id ? 'opacity-50' : ''
        ]"
        :style="{ paddingLeft: `${(item.depth || 0) * 16 + 8}px` }"
        @click="onItemClick(item, $event)"
        @dragstart="onDragStart($event, item, index)"
        @dragend="onDragEnd"
        @dragover.prevent="onDragOver($event, index)"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop($event, index)"
      >
        <!-- 그룹 펼침/접기 버튼 -->
        <button
          v-if="item.type === 'group'"
          class="w-4 h-4 flex-shrink-0 text-gray-500 hover:text-gray-700"
          @click.stop="toggleGroupExpand(item.id)"
        >
          <svg
            class="w-4 h-4 transition-transform"
            :class="expandedGroups.has(item.id) ? 'rotate-90' : ''"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <!-- 하위 노드인 경우 들여쓰기 표시 -->
        <div v-else-if="item.parentGroupId" class="w-4 h-4 flex-shrink-0 flex items-center justify-center text-gray-400">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <!-- 체크박스 (선택 모드일 때만) -->
        <input
          v-if="isSelectionMode"
          type="checkbox"
          :checked="isItemChecked(item)"
          class="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
          @click.stop="toggleItemCheck(item)"
        />

        <!-- 드래그 핸들 -->
        <div v-if="!isSelectionMode && !item.parentGroupId" class="cursor-grab text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
          </svg>
        </div>

        <!-- 그룹인 경우 -->
        <template v-if="item.type === 'group'">
          <div
            class="w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center"
            :style="{ borderColor: item.color, backgroundColor: item.color + '20' }"
          >
            <svg class="w-4 h-4" :style="{ color: item.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </template>
        <!-- 이미지인 경우 썸네일 -->
        <template v-else-if="item.type === 'image'">
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
        <!-- 벽체인 경우 -->
        <template v-else-if="item.type === 'wall'">
          <div
            class="w-6 h-6 rounded border border-gray-300 flex-shrink-0 flex items-center justify-center"
            :style="{ backgroundColor: item.color }"
          >
            <div class="w-4 h-1 bg-white opacity-50 rounded"></div>
          </div>
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
            <template v-if="item.type === 'group'">
              {{ item.memberCount }}개 객체
            </template>
            <template v-else-if="item.type === 'image'">
              {{ Math.round((item.opacity ?? 1) * 100) }}% 투명도
              <span v-if="item.locked" class="ml-1">🔒</span>
            </template>
            <template v-else-if="item.type === 'room'">
              {{ Math.round(item.width) }}×{{ Math.round(item.height) }}px
            </template>
            <template v-else-if="item.type === 'wall'">
              길이: {{ item.width }}cm, 두께: {{ item.height }}cm
            </template>
            <template v-else>
              {{ item.width }}×{{ item.height }}cm
            </template>
          </div>
        </div>

        <!-- 타입 아이콘 -->
        <div :class="getIconClass(item.type)">
          <!-- 그룹 아이콘 -->
          <svg v-if="item.type === 'group'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <svg v-else-if="item.type === 'image'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <!-- 방 아이콘 -->
          <svg v-else-if="item.type === 'room'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <!-- 벽체 아이콘 -->
          <svg v-else-if="item.type === 'wall'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <!-- 가구 아이콘 -->
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        <!-- 레이어 순서 조절 버튼 (선택 모드가 아닐 때만) -->
        <div v-if="!isSelectionMode" class="flex flex-col gap-0.5">
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
    <div class="border-t p-2 space-y-1">
      <!-- 그룹화 버튼 (선택 모드일 때) -->
      <div v-if="isSelectionMode" class="flex gap-1">
        <button
          class="flex-1 px-2 py-1.5 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="checkedItems.length < 2"
          @click="handleCreateGroup"
        >
          그룹화 ({{ checkedItems.length }})
        </button>
        <button
          v-if="hasGroupSelected"
          class="flex-1 px-2 py-1.5 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
          @click="handleUngroup"
        >
          그룹 해제
        </button>
      </div>

      <!-- 기본 도구 버튼 -->
      <div class="flex gap-1">
        <button
          class="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
          :disabled="!selectedId && !selectedImageId && !selectedRoomId && !selectedWallId"
          @click="$emit('bring-to-front')"
        >
          맨 앞으로
        </button>
        <button
          class="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
          :disabled="!selectedId && !selectedImageId && !selectedRoomId && !selectedWallId"
          @click="$emit('send-to-back')"
        >
          맨 뒤로
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Furniture } from '~/types/furniture'
import type { FloorPlanImage } from '~/utils/floorPlanImage'
import type { Room } from '~/utils/door'
import type { Wall } from '~/utils/wall'
import { getWallLength } from '~/utils/wall'
import type { ObjectGroup, GroupMember } from '~/utils/group'

// 통합 레이어 아이템 타입
type LayerItemType = 'furniture' | 'image' | 'room' | 'wall' | 'group'

interface UnifiedLayerItem {
  id: string
  type: LayerItemType
  name: string
  zIndex: number
  color?: string
  width: number
  height: number
  dataUrl?: string
  opacity?: number
  locked?: boolean
  memberCount?: number
  original: Furniture | FloorPlanImage | Room | Wall | ObjectGroup
  // 그룹 관련 속성
  parentGroupId?: string  // 부모 그룹 ID
  depth?: number          // 들여쓰기 깊이
}

const props = defineProps<{
  items: Furniture[]
  selectedId: string | null
  image?: FloorPlanImage | null
  selectedImageId?: string | null
  room?: Room | null
  selectedRoomId?: string | null
  walls?: Wall[]
  selectedWallId?: string | null
  groups?: ObjectGroup[]
  selectedGroupId?: string | null
}>()

const emit = defineEmits<{
  close: []
  select: [item: Furniture]
  'select-image': [image: FloorPlanImage]
  'select-room': [room: Room]
  'select-wall': [wall: Wall]
  'select-group': [group: ObjectGroup]
  'move-forward': [item: Furniture]
  'move-backward': [item: Furniture]
  'bring-to-front': []
  'send-to-back': []
  'reorder': [fromId: string, toIndex: number]
  'reorder-unified': [fromId: string, fromType: LayerItemType, toIndex: number]
  'create-group': [members: GroupMember[]]
  'ungroup': [groupId: string]
}>()

// 선택 모드 상태
const isSelectionMode = ref(false)
const checkedItems = ref<Array<{ id: string; type: LayerItemType }>>([])

// 드래그 상태
const draggingId = ref<string | null>(null)
const draggingType = ref<LayerItemType | null>(null)
const dragOverIndex = ref<number | null>(null)

// 선택 모드 토글
const toggleSelectionMode = () => {
  isSelectionMode.value = !isSelectionMode.value
  if (!isSelectionMode.value) {
    checkedItems.value = []
  }
}

// 선택 해제
const clearSelection = () => {
  checkedItems.value = []
}

// 아이템 체크 여부
const isItemChecked = (item: UnifiedLayerItem) => {
  return checkedItems.value.some((c) => c.id === item.id && c.type === item.type)
}

// 아이템 체크 토글
const toggleItemCheck = (item: UnifiedLayerItem) => {
  const index = checkedItems.value.findIndex((c) => c.id === item.id && c.type === item.type)
  if (index !== -1) {
    checkedItems.value.splice(index, 1)
  } else {
    checkedItems.value.push({ id: item.id, type: item.type })
  }
}

// 그룹이 선택되어 있는지
const hasGroupSelected = computed(() => {
  return checkedItems.value.some((c) => c.type === 'group')
})

// 그룹화 처리
const handleCreateGroup = () => {
  if (checkedItems.value.length < 2) return

  const members: GroupMember[] = checkedItems.value
    .filter((c) => c.type === 'furniture' || c.type === 'wall' || c.type === 'group' || c.type === 'room')
    .map((c) => ({
      id: c.id,
      type: c.type as 'furniture' | 'wall' | 'group' | 'room',
    }))

  if (members.length >= 2) {
    emit('create-group', members)
    checkedItems.value = []
    isSelectionMode.value = false
  }
}

// 그룹 해제 처리
const handleUngroup = () => {
  const groupItem = checkedItems.value.find((c) => c.type === 'group')
  if (groupItem) {
    emit('ungroup', groupItem.id)
    checkedItems.value = []
  }
}

// 그룹 펼침 상태
const expandedGroups = ref<Set<string>>(new Set())

// 그룹 펼침/접기 토글
const toggleGroupExpand = (groupId: string) => {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId)
  } else {
    expandedGroups.value.add(groupId)
  }
}

// 그룹에 속한 멤버 ID 집합 (중복 표시 방지)
const groupMemberIds = computed(() => {
  const ids = new Set<string>()
  if (props.groups) {
    for (const group of props.groups) {
      for (const member of group.members) {
        ids.add(member.id)
      }
    }
  }
  return ids
})

// 통합 레이어 목록 (방 + 이미지 + 가구 + 그룹을 zIndex로 정렬)
const unifiedItems = computed((): UnifiedLayerItem[] => {
  const items: UnifiedLayerItem[] = []

  // 그룹 및 그룹 멤버 추가
  if (props.groups) {
    for (const group of props.groups) {
      // 그룹 자체 추가
      items.push({
        id: group.id,
        type: 'group',
        name: group.name,
        zIndex: group.zIndex,
        color: group.color,
        width: group.width,
        height: group.height,
        memberCount: group.members.length,
        original: group,
        depth: 0,
      })

      // 그룹이 펼쳐져 있으면 멤버들 추가
      if (expandedGroups.value.has(group.id)) {
        for (const member of group.members) {
          if (member.type === 'furniture') {
            const furniture = props.items.find((f) => f.id === member.id)
            if (furniture) {
              items.push({
                id: furniture.id,
                type: 'furniture',
                name: furniture.name,
                zIndex: furniture.zIndex,
                color: furniture.color,
                width: furniture.width,
                height: furniture.height,
                original: furniture,
                parentGroupId: group.id,
                depth: 1,
              })
            }
          } else if (member.type === 'wall') {
            const wall = props.walls?.find((w) => w.id === member.id)
            if (wall) {
              const length = Math.round(getWallLength(wall))
              items.push({
                id: wall.id,
                type: 'wall',
                name: wall.isExterior ? '외벽' : '내벽',
                zIndex: wall.zIndex,
                color: wall.color,
                width: length,
                height: wall.thickness,
                original: wall,
                parentGroupId: group.id,
                depth: 1,
              })
            }
          } else if (member.type === 'room') {
            if (props.room && props.room.id === member.id) {
              items.push({
                id: props.room.id,
                type: 'room',
                name: '방',
                zIndex: props.room.zIndex,
                width: props.room.width,
                height: props.room.height,
                opacity: props.room.opacity,
                original: props.room,
                parentGroupId: group.id,
                depth: 1,
              })
            }
          }
        }
      }
    }
  }

  // 가구 추가 (그룹에 속하지 않은 것만)
  for (const furniture of props.items) {
    if (!groupMemberIds.value.has(furniture.id)) {
      items.push({
        id: furniture.id,
        type: 'furniture',
        name: furniture.name,
        zIndex: furniture.zIndex,
        color: furniture.color,
        width: furniture.width,
        height: furniture.height,
        original: furniture,
        depth: 0,
      })
    }
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
      depth: 0,
    })
  }

  // 방 추가 (그룹에 속하지 않은 경우만)
  if (props.room && !groupMemberIds.value.has(props.room.id)) {
    items.push({
      id: props.room.id,
      type: 'room',
      name: '방',
      zIndex: props.room.zIndex,
      width: props.room.width,
      height: props.room.height,
      opacity: props.room.opacity,
      original: props.room,
      depth: 0,
    })
  }

  // 벽체 추가 (그룹에 속하지 않은 것만)
  if (props.walls) {
    for (const wall of props.walls) {
      if (!groupMemberIds.value.has(wall.id)) {
        const length = Math.round(getWallLength(wall))
        items.push({
          id: wall.id,
          type: 'wall',
          name: wall.isExterior ? '외벽' : '내벽',
          zIndex: wall.zIndex,
          color: wall.color,
          width: length,
          height: wall.thickness,
          original: wall,
          depth: 0,
        })
      }
    }
  }

  // zIndex 내림차순 정렬 (높은 zIndex가 위에 표시) - 단, 그룹 멤버는 그룹 바로 아래에 유지
  // 그룹 멤버가 아닌 아이템만 정렬하고, 그룹 멤버는 원래 위치 유지
  const topLevelItems = items.filter((item) => !item.parentGroupId)
  topLevelItems.sort((a, b) => b.zIndex - a.zIndex)

  // 결과 배열 재구성: 그룹이면 해당 그룹의 멤버들을 바로 뒤에 배치
  const result: UnifiedLayerItem[] = []
  for (const item of topLevelItems) {
    result.push(item)
    if (item.type === 'group' && expandedGroups.value.has(item.id)) {
      const memberItems = items.filter((m) => m.parentGroupId === item.id)
      result.push(...memberItems)
    }
  }

  return result
})

// 전체 아이템 수
const allItemsCount = computed(() => unifiedItems.value.length)

// 타입별 선택 스타일 클래스
const getSelectedClass = (type: LayerItemType) => {
  switch (type) {
    case 'image':
      return 'bg-purple-50 border border-purple-200'
    case 'room':
      return 'bg-gray-100 border border-gray-300'
    case 'wall':
      return 'bg-green-50 border border-green-200'
    case 'group':
      return 'bg-purple-100 border border-purple-300'
    default:
      return 'bg-blue-50 border border-blue-200'
  }
}

// 타입별 아이콘 색상 클래스
const getIconClass = (type: LayerItemType) => {
  switch (type) {
    case 'image':
      return 'text-purple-500'
    case 'room':
      return 'text-gray-600'
    case 'wall':
      return 'text-green-600'
    case 'group':
      return 'text-purple-600'
    default:
      return 'text-blue-500'
  }
}

const isTopmost = (item: UnifiedLayerItem) => {
  if (unifiedItems.value.length <= 1) return true
  const maxZIndex = Math.max(...unifiedItems.value.map((i) => i.zIndex))
  return item.zIndex === maxZIndex
}

const isBottommost = (item: UnifiedLayerItem) => {
  if (unifiedItems.value.length <= 1) return true
  const minZIndex = Math.min(...unifiedItems.value.map((i) => i.zIndex))
  return item.zIndex === minZIndex
}

// 아이템 클릭 핸들러
const onItemClick = (item: UnifiedLayerItem, event: MouseEvent) => {
  // 선택 모드에서는 체크박스 토글
  if (isSelectionMode.value) {
    // Ctrl+클릭으로 다중 선택
    if (event.ctrlKey || event.metaKey) {
      toggleItemCheck(item)
    } else {
      // 단일 클릭은 해당 아이템만 선택
      checkedItems.value = [{ id: item.id, type: item.type }]
    }
    return
  }

  // 일반 모드에서는 아이템 선택
  if (item.type === 'furniture') {
    emit('select', item.original as Furniture)
  } else if (item.type === 'image') {
    emit('select-image', item.original as FloorPlanImage)
  } else if (item.type === 'room') {
    emit('select-room', item.original as Room)
  } else if (item.type === 'wall') {
    emit('select-wall', item.original as Wall)
  } else if (item.type === 'group') {
    emit('select-group', item.original as ObjectGroup)
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
  } else if (item.type === 'wall') {
    return props.selectedWallId === item.id
  } else if (item.type === 'group') {
    return props.selectedGroupId === item.id
  }
  return false
}

// 드래그 이벤트 핸들러
const onDragStart = (event: DragEvent, item: UnifiedLayerItem, _index: number) => {
  if (isSelectionMode.value) {
    event.preventDefault()
    return
  }
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
  if (!isSelectionMode.value) {
    dragOverIndex.value = index
  }
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
