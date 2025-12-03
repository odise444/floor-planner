<template>
  <div
    ref="containerRef"
    class="flex-1 bg-gray-200 overflow-hidden relative"
    @drop="onDrop"
    @dragover.prevent
    @dragenter.prevent
  >
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @wheel="onWheel"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
    >
      <!-- 그리드 레이어 -->
      <v-layer>
        <v-group :config="{ x: stageConfig.x, y: stageConfig.y }">
          <v-line
            v-for="line in gridLines"
            :key="line.id"
            :config="line"
          />
        </v-group>
      </v-layer>

      <!-- 방/벽 레이어 -->
      <v-layer>
        <v-rect
          v-if="room"
          :config="{
            x: room.x,
            y: room.y,
            width: room.width,
            height: room.height,
            fill: '#ffffff',
            stroke: '#374151',
            strokeWidth: 3,
          }"
        />
        <!-- 치수선 표시 -->
        <template v-if="room">
          <!-- 가로 치수 -->
          <v-text
            :config="{
              x: room.x + room.width / 2,
              y: room.y - 25,
              text: `${Math.round(room.width / scale)}cm`,
              fontSize: 14,
              fill: '#374151',
              align: 'center',
              offsetX: 25,
            }"
          />
          <!-- 세로 치수 -->
          <v-text
            :config="{
              x: room.x - 10,
              y: room.y + room.height / 2,
              text: `${Math.round(room.height / scale)}cm`,
              fontSize: 14,
              fill: '#374151',
              rotation: -90,
              offsetX: 25,
            }"
          />
        </template>
      </v-layer>

      <!-- 가구 레이어 -->
      <v-layer>
        <v-group
          v-for="furniture in furnitureList"
          :key="furniture.id"
          :config="{
            x: furniture.x,
            y: furniture.y,
            rotation: furniture.rotation,
            draggable: true,
          }"
          @dragend="onFurnitureDragEnd(furniture, $event)"
          @click="selectFurniture(furniture)"
        >
          <v-rect
            :config="{
              width: furniture.width * scale,
              height: furniture.height * scale,
              fill: furniture.color,
              stroke: selectedFurniture?.id === furniture.id ? '#3b82f6' : '#374151',
              strokeWidth: selectedFurniture?.id === furniture.id ? 3 : 1,
              cornerRadius: 4,
            }"
          />
          <v-text
            :config="{
              text: furniture.name,
              fontSize: 12,
              fill: '#ffffff',
              width: furniture.width * scale,
              height: furniture.height * scale,
              align: 'center',
              verticalAlign: 'middle',
              padding: 4,
            }"
          />
        </v-group>
      </v-layer>
    </v-stage>

    <!-- 줌 컨트롤 -->
    <div class="absolute bottom-4 right-4 flex flex-col gap-2">
      <button
        class="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
        @click="zoomIn"
      >
        +
      </button>
      <button
        class="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50"
        @click="zoomOut"
      >
        -
      </button>
      <button
        class="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50 text-xs"
        @click="resetView"
      >
        리셋
      </button>
    </div>

    <!-- 방 생성 버튼 -->
    <div v-if="!room" class="absolute top-4 left-4">
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
        @click="showRoomModal = true"
      >
        + 방 만들기
      </button>
    </div>

    <!-- 방 생성 모달 -->
    <div
      v-if="showRoomModal"
      class="absolute inset-0 bg-black/50 flex items-center justify-center"
    >
      <div class="bg-white rounded-xl p-6 w-80 shadow-xl">
        <h3 class="text-lg font-semibold mb-4">방 크기 입력</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">가로 (cm)</label>
            <input
              v-model.number="roomWidth"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="예: 400"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">세로 (cm)</label>
            <input
              v-model.number="roomHeight"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="예: 300"
            />
          </div>
          <div class="flex gap-2">
            <button
              class="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              @click="showRoomModal = false"
            >
              취소
            </button>
            <button
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              @click="createRoom"
            >
              생성
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Furniture {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  color: string
  rotation: number
}

interface Room {
  x: number
  y: number
  width: number
  height: number
}

// 1cm = 2px 스케일
const scale = 2

const containerRef = ref<HTMLElement | null>(null)
const stageRef = ref<any>(null)

const stageConfig = ref({
  width: 800,
  height: 600,
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
})

// 방 상태
const room = ref<Room | null>(null)
const showRoomModal = ref(false)
const roomWidth = ref(400)
const roomHeight = ref(300)

// 가구 상태
const furnitureList = ref<Furniture[]>([])
const selectedFurniture = ref<Furniture | null>(null)

// 패닝 상태
const isPanning = ref(false)
const lastPointerPos = ref({ x: 0, y: 0 })

// 그리드 라인 생성
const gridLines = computed(() => {
  const lines: any[] = []
  const gridSize = 50 // 50px = 25cm
  const gridExtent = 2000

  // 세로선
  for (let x = -gridExtent; x <= gridExtent; x += gridSize) {
    lines.push({
      id: `v-${x}`,
      points: [x, -gridExtent, x, gridExtent],
      stroke: x === 0 ? '#9ca3af' : '#d1d5db',
      strokeWidth: x === 0 ? 1 : 0.5,
    })
  }

  // 가로선
  for (let y = -gridExtent; y <= gridExtent; y += gridSize) {
    lines.push({
      id: `h-${y}`,
      points: [-gridExtent, y, gridExtent, y],
      stroke: y === 0 ? '#9ca3af' : '#d1d5db',
      strokeWidth: y === 0 ? 1 : 0.5,
    })
  }

  return lines
})

// 줌 인
const zoomIn = () => {
  const newScale = Math.min(stageConfig.value.scaleX * 1.2, 3)
  stageConfig.value.scaleX = newScale
  stageConfig.value.scaleY = newScale
}

// 줌 아웃
const zoomOut = () => {
  const newScale = Math.max(stageConfig.value.scaleX / 1.2, 0.3)
  stageConfig.value.scaleX = newScale
  stageConfig.value.scaleY = newScale
}

// 뷰 리셋
const resetView = () => {
  stageConfig.value.scaleX = 1
  stageConfig.value.scaleY = 1
  stageConfig.value.x = stageConfig.value.width / 2
  stageConfig.value.y = stageConfig.value.height / 2
}

// 마우스 휠 줌
const onWheel = (e: any) => {
  e.evt.preventDefault()

  const scaleBy = 1.1
  const stage = e.target.getStage()
  const oldScale = stageConfig.value.scaleX

  const pointer = stage.getPointerPosition()
  const mousePointTo = {
    x: (pointer.x - stageConfig.value.x) / oldScale,
    y: (pointer.y - stageConfig.value.y) / oldScale,
  }

  const direction = e.evt.deltaY > 0 ? -1 : 1
  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
  const clampedScale = Math.max(0.3, Math.min(3, newScale))

  stageConfig.value.scaleX = clampedScale
  stageConfig.value.scaleY = clampedScale
  stageConfig.value.x = pointer.x - mousePointTo.x * clampedScale
  stageConfig.value.y = pointer.y - mousePointTo.y * clampedScale
}

// 패닝
const onMouseDown = (e: any) => {
  if (e.target === e.target.getStage()) {
    isPanning.value = true
    const pos = e.target.getStage().getPointerPosition()
    lastPointerPos.value = { x: pos.x, y: pos.y }
  }
}

const onMouseMove = (e: any) => {
  if (!isPanning.value) return

  const pos = e.target.getStage().getPointerPosition()
  const dx = pos.x - lastPointerPos.value.x
  const dy = pos.y - lastPointerPos.value.y

  stageConfig.value.x += dx
  stageConfig.value.y += dy
  lastPointerPos.value = { x: pos.x, y: pos.y }
}

const onMouseUp = () => {
  isPanning.value = false
}

// 방 생성
const createRoom = () => {
  room.value = {
    x: 100,
    y: 100,
    width: roomWidth.value * scale,
    height: roomHeight.value * scale,
  }
  showRoomModal.value = false
}

// 가구 드롭
const onDrop = (event: DragEvent) => {
  event.preventDefault()

  const data = event.dataTransfer?.getData('application/json')
  if (!data) return

  const item = JSON.parse(data)
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return

  const x = event.clientX - rect.left - stageConfig.value.x
  const y = event.clientY - rect.top - stageConfig.value.y

  const newFurniture: Furniture = {
    id: `${item.id}-${Date.now()}`,
    name: item.name,
    x: x / stageConfig.value.scaleX,
    y: y / stageConfig.value.scaleY,
    width: item.width,
    height: item.height,
    color: item.color,
    rotation: 0,
  }

  furnitureList.value.push(newFurniture)
  selectedFurniture.value = newFurniture
}

// 가구 드래그 종료
const onFurnitureDragEnd = (furniture: Furniture, e: any) => {
  furniture.x = e.target.x()
  furniture.y = e.target.y()
}

// 가구 선택
const selectFurniture = (furniture: Furniture) => {
  selectedFurniture.value = furniture
}

// 키보드 이벤트
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Delete' && selectedFurniture.value) {
    furnitureList.value = furnitureList.value.filter(
      (f) => f.id !== selectedFurniture.value?.id
    )
    selectedFurniture.value = null
  }

  if (e.key === 'r' && selectedFurniture.value) {
    selectedFurniture.value.rotation = (selectedFurniture.value.rotation + 90) % 360
  }
}

// 컨테이너 리사이즈 핸들링
const updateSize = () => {
  if (containerRef.value) {
    stageConfig.value.width = containerRef.value.clientWidth
    stageConfig.value.height = containerRef.value.clientHeight
  }
}

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
  window.addEventListener('keydown', onKeyDown)

  // 초기 뷰 위치를 중앙으로
  stageConfig.value.x = stageConfig.value.width / 2
  stageConfig.value.y = stageConfig.value.height / 2
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
  window.removeEventListener('keydown', onKeyDown)
})
</script>
