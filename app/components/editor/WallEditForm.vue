<template>
  <div class="bg-white rounded-lg shadow-lg p-4 w-80">
    <h3 class="text-sm font-medium text-gray-900 mb-3">🧱 벽체 편집</h3>

    <div class="space-y-3">
      <!-- 길이 (읽기 전용) -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">길이</label>
        <div class="px-2 py-1.5 text-sm bg-gray-100 rounded text-gray-700">
          {{ Math.round(wallLength) }} cm
        </div>
      </div>

      <!-- 두께 -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">두께 (cm)</label>
        <input
          v-model.number="editData.thickness"
          type="number"
          min="5"
          max="50"
          step="1"
          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- 벽체 종류 -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">벽체 종류</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              v-model="editData.isExterior"
              type="radio"
              :value="false"
              class="text-blue-500 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">내벽</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              v-model="editData.isExterior"
              type="radio"
              :value="true"
              class="text-blue-500 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">외벽</span>
          </label>
        </div>
      </div>

      <!-- 색상 -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">색상</label>
        <div class="flex gap-2">
          <button
            v-for="color in colorOptions"
            :key="color.value"
            class="w-8 h-8 rounded border-2 transition-all"
            :class="editData.color === color.value ? 'border-blue-500 scale-110' : 'border-gray-300'"
            :style="{ backgroundColor: color.value }"
            :title="color.label"
            @click="editData.color = color.value"
          />
        </div>
      </div>

      <!-- 연결 가능한 벽체 -->
      <div v-if="connectableWalls.length > 0">
        <label class="block text-xs font-medium text-gray-600 mb-1">
          연결 가능한 벽체 ({{ connectableWalls.length }}개)
        </label>
        <div class="max-h-24 overflow-y-auto border rounded p-2 space-y-1">
          <label
            v-for="cw in connectableWalls"
            :key="cw.id"
            class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
          >
            <input
              v-model="selectedMergeWallIds"
              type="checkbox"
              :value="cw.id"
              class="text-green-500 focus:ring-green-500"
            />
            <span class="text-xs text-gray-600">
              {{ Math.round(cw.length) }}cm
              <span class="text-gray-400">({{ cw.connectionPoint }})</span>
            </span>
          </label>
        </div>
        <div v-if="selectedMergeWallIds.length > 0" class="mt-2 flex gap-2">
          <button
            class="flex-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            @click="handleMerge"
            title="선택한 벽체의 끝점을 현재 벽체에 스냅"
          >
            끝점 연결
          </button>
          <button
            class="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            @click="handleJoin"
            title="선택한 벽체들을 하나로 결합"
          >
            결합
          </button>
        </div>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errors.length > 0" class="text-xs text-red-500">
        <ul class="list-disc list-inside">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>
    </div>

    <!-- 버튼 -->
    <div class="flex gap-2 mt-4">
      <button
        class="flex-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        @click="$emit('close')"
      >
        닫기
      </button>
      <button
        class="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        @click="$emit('delete')"
      >
        삭제
      </button>
      <button
        class="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        @click="handleApply"
      >
        적용
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type Wall, getWallLength, WALL_COLORS, SNAP_DISTANCE } from '~/utils/wall'

export interface WallEditData {
  thickness: number
  isExterior: boolean
  color: string
}

interface ConnectableWall {
  id: string
  length: number
  connectionPoint: 'start' | 'end'
}

const props = defineProps<{
  wall: Wall
  allWalls: Wall[]
}>()

const emit = defineEmits<{
  update: [data: WallEditData]
  delete: []
  close: []
  merge: [wallIds: string[]]
  join: [wallIds: string[]]
}>()

const editData = ref<WallEditData>({
  thickness: props.wall.thickness,
  isExterior: props.wall.isExterior,
  color: props.wall.color,
})

const errors = ref<string[]>([])
const selectedMergeWallIds = ref<string[]>([])

const colorOptions = [
  { value: WALL_COLORS.interior, label: '내벽 (회색)' },
  { value: WALL_COLORS.exterior, label: '외벽 (진회색)' },
  { value: '#78716c', label: '콘크리트' },
  { value: '#a16207', label: '나무' },
  { value: '#dc2626', label: '빨강' },
  { value: '#2563eb', label: '파랑' },
]

const wallLength = computed(() => getWallLength(props.wall))

const connectableWalls = computed((): ConnectableWall[] => {
  const result: ConnectableWall[] = []
  const currentWall = props.wall

  for (const wall of props.allWalls) {
    if (wall.id === currentWall.id) continue

    const currentStartX = currentWall.startX
    const currentStartY = currentWall.startY
    const currentEndX = currentWall.endX
    const currentEndY = currentWall.endY

    const checkDistance = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
    }

    if (checkDistance(currentEndX, currentEndY, wall.startX, wall.startY) <= SNAP_DISTANCE) {
      result.push({ id: wall.id, length: getWallLength(wall), connectionPoint: 'end' })
    } else if (checkDistance(currentEndX, currentEndY, wall.endX, wall.endY) <= SNAP_DISTANCE) {
      result.push({ id: wall.id, length: getWallLength(wall), connectionPoint: 'end' })
    } else if (checkDistance(currentStartX, currentStartY, wall.startX, wall.startY) <= SNAP_DISTANCE) {
      result.push({ id: wall.id, length: getWallLength(wall), connectionPoint: 'start' })
    } else if (checkDistance(currentStartX, currentStartY, wall.endX, wall.endY) <= SNAP_DISTANCE) {
      result.push({ id: wall.id, length: getWallLength(wall), connectionPoint: 'start' })
    }
  }

  return result
})

watch(() => props.wall, (newVal) => {
  editData.value = {
    thickness: newVal.thickness,
    isExterior: newVal.isExterior,
    color: newVal.color,
  }
  selectedMergeWallIds.value = []
}, { deep: true })

watch(() => editData.value.isExterior, (isExterior) => {
  editData.value.color = isExterior ? WALL_COLORS.exterior : WALL_COLORS.interior
})

function handleApply() {
  errors.value = []

  if (editData.value.thickness < 5) {
    errors.value.push('두께는 5cm 이상이어야 합니다.')
    return
  }
  if (editData.value.thickness > 50) {
    errors.value.push('두께는 50cm 이하여야 합니다.')
    return
  }

  emit('update', { ...editData.value })
}

function handleMerge() {
  if (selectedMergeWallIds.value.length === 0) return
  emit('merge', [...selectedMergeWallIds.value])
}

function handleJoin() {
  if (selectedMergeWallIds.value.length === 0) return
  emit('join', [...selectedMergeWallIds.value])
}
</script>
