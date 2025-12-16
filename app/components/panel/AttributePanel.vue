<template>
  <div class="h-full bg-gray-900 text-white flex flex-col">
    <!-- 패널 헤더 -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-gray-700">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">
          {{ headerTitle }}
        </span>
      </div>
      <button
        data-testid="toggle-panel"
        class="p-1 hover:bg-gray-700 rounded"
        @click="isPanelCollapsed = !isPanelCollapsed"
      >
        <svg
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-180': isPanelCollapsed }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <!-- 패널 내용 -->
    <div v-if="!isPanelCollapsed" class="flex-1 overflow-y-auto">
      <!-- 선택된 오브젝트 없음 -->
      <div v-if="!selectedFurniture && !selectedDoor" class="p-4 text-center text-gray-400">
        <p>선택된 오브젝트 없음</p>
        <p class="text-xs mt-1">오브젝트를 선택하면 속성이 표시됩니다</p>
      </div>

      <!-- 가구 속성 -->
      <template v-else-if="selectedFurniture">
        <!-- 기본 정보 섹션 -->
        <AttributeSection title="기본 정보" section-id="info" :default-open="true">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">이름</label>
              <input
                data-testid="input-name"
                type="text"
                :value="selectedFurniture.name"
                class="w-32 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                @change="updateName($event)"
              />
            </div>
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">ID</label>
              <span class="text-xs text-gray-500">{{ selectedFurniture.id }}</span>
            </div>
          </div>
        </AttributeSection>

        <!-- 크기 섹션 -->
        <AttributeSection title="크기" section-id="size" :default-open="true">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">가로</label>
              <div class="flex items-center gap-1">
                <span data-testid="size-width" class="text-xs">{{ sizeInCm.width }}</span>
                <input
                  data-testid="input-width"
                  type="number"
                  :value="sizeInCm.width"
                  class="w-16 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  @change="updateWidth($event)"
                />
                <span class="text-xs text-gray-500">cm</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">세로</label>
              <div class="flex items-center gap-1">
                <span data-testid="size-height" class="text-xs">{{ sizeInCm.height }}</span>
                <input
                  data-testid="input-height"
                  type="number"
                  :value="sizeInCm.height"
                  class="w-16 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  @change="updateHeight($event)"
                />
                <span class="text-xs text-gray-500">cm</span>
              </div>
            </div>
          </div>
        </AttributeSection>

        <!-- 위치 섹션 -->
        <AttributeSection title="위치" section-id="position" :default-open="true">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">X</label>
              <div class="flex items-center gap-1">
                <span data-testid="position-x" class="text-xs">{{ positionInCm.x }}</span>
                <input
                  data-testid="input-x"
                  type="number"
                  :value="positionInCm.x"
                  class="w-16 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  @change="updateX($event)"
                />
                <span class="text-xs text-gray-500">cm</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">Y</label>
              <div class="flex items-center gap-1">
                <span data-testid="position-y" class="text-xs">{{ positionInCm.y }}</span>
                <input
                  data-testid="input-y"
                  type="number"
                  :value="positionInCm.y"
                  class="w-16 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  @change="updateY($event)"
                />
                <span class="text-xs text-gray-500">cm</span>
              </div>
            </div>
          </div>
        </AttributeSection>

        <!-- 벽과의 거리 섹션 -->
        <AttributeSection title="벽과의 거리" section-id="distance" :default-open="true">
          <div v-if="wallDistances" class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">상단</label>
              <span data-testid="distance-top" class="text-xs">{{ wallDistances.top }} cm</span>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">하단</label>
              <span data-testid="distance-bottom" class="text-xs">{{ wallDistances.bottom }} cm</span>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">좌측</label>
              <span data-testid="distance-left" class="text-xs">{{ wallDistances.left }} cm</span>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">우측</label>
              <span data-testid="distance-right" class="text-xs">{{ wallDistances.right }} cm</span>
            </div>
          </div>
          <div v-else class="text-xs text-gray-500">
            방을 생성하면 거리가 표시됩니다
          </div>
        </AttributeSection>

        <!-- 회전 섹션 -->
        <AttributeSection title="회전" section-id="rotation" :default-open="true">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">각도</label>
              <div class="flex items-center gap-1">
                <span data-testid="rotation" class="text-xs">{{ selectedFurniture.rotation }}</span>
                <input
                  data-testid="input-rotation"
                  type="number"
                  :value="selectedFurniture.rotation"
                  step="15"
                  class="w-16 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
                  @change="updateRotation($event)"
                />
                <span class="text-xs text-gray-500">°</span>
              </div>
            </div>
          </div>
        </AttributeSection>
      </template>

      <!-- 문 속성 -->
      <template v-else-if="selectedDoor">
        <AttributeSection title="문 정보" section-id="door-info" :default-open="true">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">위치</label>
              <span class="text-xs">{{ wallPositionLabel }}</span>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">너비</label>
              <span class="text-xs">{{ doorWidthInCm }} cm</span>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">열림 방향</label>
              <span class="text-xs">{{ openDirectionLabel }}</span>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-xs text-gray-400">경첩 위치</label>
              <span class="text-xs">{{ hingeSideLabel }}</span>
            </div>
          </div>
        </AttributeSection>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Furniture } from '~/types/furniture'
import type { Room } from '~/types/room'
import type { Door } from '~/types/door'
import { formatPosition, formatSize, calculateWallDistances, cmToPixel } from '~/utils/attributePanel'
import AttributeSection from './AttributeSection.vue'

const props = defineProps<{
  selectedFurniture: Furniture | null
  selectedDoor: Door | null
  room: Room | null
  scale: number
}>()

const emit = defineEmits<{
  'update:furniture': [updates: Partial<Furniture>]
  'update:door': [updates: Partial<Door>]
}>()

const isPanelCollapsed = ref(false)

// 헤더 제목
const headerTitle = computed(() => {
  if (props.selectedFurniture) return props.selectedFurniture.name
  if (props.selectedDoor) return '문'
  return '속성'
})

// 가구 크기 (cm)
const sizeInCm = computed(() => {
  if (!props.selectedFurniture) return { width: 0, height: 0 }
  return formatSize(props.selectedFurniture, props.scale)
})

// 가구 위치 (cm)
const positionInCm = computed(() => {
  if (!props.selectedFurniture) return { x: 0, y: 0 }
  return formatPosition(props.selectedFurniture, props.room, props.scale)
})

// 벽과의 거리
const wallDistances = computed(() => {
  if (!props.selectedFurniture) return null
  return calculateWallDistances(props.selectedFurniture, props.room, props.scale)
})

// 문 관련 라벨
const wallPositionLabel = computed(() => {
  const labels: Record<string, string> = {
    top: '상단',
    bottom: '하단',
    left: '좌측',
    right: '우측',
  }
  return labels[props.selectedDoor?.wall || ''] || ''
})

const openDirectionLabel = computed(() => {
  return props.selectedDoor?.openDirection === 'inside' ? '안쪽' : '바깥쪽'
})

const hingeSideLabel = computed(() => {
  return props.selectedDoor?.hingeSide === 'left' ? '왼쪽' : '오른쪽'
})

const doorWidthInCm = computed(() => {
  if (!props.selectedDoor) return 0
  return Math.round(props.selectedDoor.width / props.scale)
})

// 업데이트 함수들
function updateName(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:furniture', { name: target.value })
}

function updateWidth(event: Event) {
  const target = event.target as HTMLInputElement
  const widthCm = parseFloat(target.value)
  emit('update:furniture', { width: cmToPixel(widthCm, props.scale) })
}

function updateHeight(event: Event) {
  const target = event.target as HTMLInputElement
  const heightCm = parseFloat(target.value)
  emit('update:furniture', { height: cmToPixel(heightCm, props.scale) })
}

function updateX(event: Event) {
  const target = event.target as HTMLInputElement
  const xCm = parseFloat(target.value)
  const xPx = cmToPixel(xCm, props.scale) + (props.room?.x || 0)
  emit('update:furniture', { x: xPx })
}

function updateY(event: Event) {
  const target = event.target as HTMLInputElement
  const yCm = parseFloat(target.value)
  const yPx = cmToPixel(yCm, props.scale) + (props.room?.y || 0)
  emit('update:furniture', { y: yPx })
}

function updateRotation(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:furniture', { rotation: parseFloat(target.value) })
}
</script>
