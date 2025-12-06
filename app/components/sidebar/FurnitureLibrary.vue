<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
    <!-- 사이드바 헤더 -->
    <div class="p-4 border-b border-gray-200">
      <h2 class="font-medium text-gray-700">가구 라이브러리</h2>
    </div>

    <!-- 가구 목록 -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="space-y-2">
        <!-- 문 추가 버튼 -->
        <div
          class="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors border-2 border-dashed border-green-300"
          @click="$emit('add-door')"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded flex items-center justify-center text-white text-xs bg-green-500"
            >
              🚪
            </div>
            <div>
              <div class="text-sm font-medium text-gray-700">문 추가</div>
              <div class="text-xs text-gray-500">벽에 문 배치</div>
            </div>
          </div>
        </div>

        <!-- 내 가구 추가 버튼 -->
        <div
          class="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border-2 border-dashed border-blue-300"
          @click="showAddModal = true"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded flex items-center justify-center text-white text-xs bg-blue-500"
            >
              +
            </div>
            <div>
              <div class="text-sm font-medium text-gray-700">내 가구 추가</div>
              <div class="text-xs text-gray-500">크기 직접 입력</div>
            </div>
          </div>
        </div>

        <!-- 내 가구 목록 -->
        <template v-if="customFurnitureList.length > 0">
          <div class="text-xs text-gray-500 mt-4 mb-2 font-medium">내 가구</div>
          <div
            v-for="item in customFurnitureList"
            :key="item.id"
            class="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors group relative"
            draggable="true"
            @dragstart="onDragStart($event, item)"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded flex items-center justify-center text-white text-xs"
                :style="{ backgroundColor: item.color }"
              >
                {{ item.name.charAt(0) }}
              </div>
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-700">{{ item.name }}</div>
                <div class="text-xs text-gray-500">
                  {{ item.width }} × {{ item.height }} cm
                </div>
              </div>
              <!-- 삭제 버튼 -->
              <button
                class="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition-all"
                @click.stop="removeCustomFurniture(item.id)"
                title="삭제"
              >
                ✕
              </button>
            </div>
          </div>
        </template>

        <!-- 기본 가구 목록 -->
        <div class="text-xs text-gray-500 mt-4 mb-2 font-medium">기본 가구</div>
        <div
          v-for="item in furnitureItems"
          :key="item.id"
          class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          draggable="true"
          @dragstart="onDragStart($event, item)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 flex items-center justify-center text-white text-xs overflow-hidden"
              :class="getShapeClass(item.shape)"
              :style="{ backgroundColor: item.color }"
            >
              {{ item.name.charAt(0) }}
            </div>
            <div>
              <div class="text-sm font-medium text-gray-700">{{ item.name }}</div>
              <div class="text-xs text-gray-500">
                {{ item.width }} × {{ item.height }} cm
                <span v-if="item.shape && item.shape !== 'rect'" class="ml-1 text-gray-400">
                  ({{ shapeDefaults[item.shape].name }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 내 가구 추가 모달 -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-80">
        <h3 class="text-lg font-medium text-gray-900 mb-4">내 가구 추가</h3>

        <div class="space-y-4">
          <!-- 이름 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              v-model="newFurniture.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 내 책상"
            />
          </div>

          <!-- 너비 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">너비 (cm)</label>
            <input
              v-model.number="newFurniture.width"
              type="number"
              min="10"
              max="500"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
            />
          </div>

          <!-- 높이 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">높이 (cm)</label>
            <input
              v-model.number="newFurniture.height"
              type="number"
              min="10"
              max="500"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="60"
            />
          </div>

          <!-- 색상 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">색상</label>
            <div class="flex gap-2">
              <input
                v-model="newFurniture.color"
                type="color"
                class="w-12 h-10 rounded cursor-pointer border border-gray-300"
              />
              <input
                v-model="newFurniture.color"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="#9ca3af"
              />
            </div>
          </div>

          <!-- 에러 메시지 -->
          <div v-if="validationErrors.length > 0" class="text-sm text-red-500">
            <ul class="list-disc list-inside">
              <li v-for="error in validationErrors" :key="error">{{ error }}</li>
            </ul>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            @click="closeModal"
          >
            취소
          </button>
          <button
            class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            @click="addCustomFurniture"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  createCustomFurniture,
  validateFurnitureDimensions,
  getCustomFurnitureList,
  saveCustomFurniture,
  deleteCustomFurniture,
  type CustomFurniture,
} from '~/utils/customFurniture'
import type { FurnitureItem, FurnitureShape, LShapeDirection } from '~/types/furniture'
import { shapeDefaults } from '~/types/furniture'

defineEmits<{
  'add-door': []
}>()

// 기본 가구 목록
const furnitureItems: FurnitureItem[] = [
  // 사각형 가구
  { id: 'sofa', name: '소파', width: 200, height: 90, color: '#6366f1', shape: 'rect' },
  { id: 'bed-single', name: '싱글 침대', width: 100, height: 200, color: '#8b5cf6', shape: 'rect' },
  { id: 'bed-double', name: '더블 침대', width: 150, height: 200, color: '#a855f7', shape: 'rect' },
  { id: 'dining-table', name: '식탁', width: 140, height: 80, color: '#f59e0b', shape: 'rect' },
  { id: 'desk', name: '책상', width: 120, height: 60, color: '#10b981', shape: 'rect' },
  { id: 'wardrobe', name: '옷장', width: 120, height: 60, color: '#6b7280', shape: 'rect' },
  { id: 'tv-stand', name: 'TV 스탠드', width: 150, height: 40, color: '#3b82f6', shape: 'rect' },
  { id: 'bookshelf', name: '책장', width: 80, height: 30, color: '#f97316', shape: 'rect' },
  // 원형 가구
  { id: 'round-table', name: '원형 테이블', width: 100, height: 100, color: '#f59e0b', shape: 'circle' },
  { id: 'stool', name: '원형 스툴', width: 40, height: 40, color: '#14b8a6', shape: 'circle' },
  { id: 'pouf', name: '푸프', width: 50, height: 50, color: '#ec4899', shape: 'circle' },
  // 타원형 가구
  { id: 'oval-table', name: '타원형 테이블', width: 160, height: 90, color: '#f59e0b', shape: 'ellipse' },
  { id: 'bathtub', name: '욕조', width: 170, height: 80, color: '#06b6d4', shape: 'ellipse' },
  { id: 'oval-rug', name: '타원형 러그', width: 200, height: 150, color: '#a78bfa', shape: 'ellipse' },
  // L자형 가구
  { id: 'l-sofa', name: 'L자 소파', width: 250, height: 200, color: '#6366f1', shape: 'l-shape', lShapeDirection: 'bottom-right', lShapeRatio: 0.5 },
  { id: 'l-desk', name: 'L자 책상', width: 180, height: 150, color: '#10b981', shape: 'l-shape', lShapeDirection: 'bottom-right', lShapeRatio: 0.4 },
  { id: 'l-counter', name: 'L자 카운터', width: 200, height: 180, color: '#78716c', shape: 'l-shape', lShapeDirection: 'top-left', lShapeRatio: 0.5 },
  // 일반 가구
  { id: 'chair', name: '의자', width: 45, height: 45, color: '#14b8a6', shape: 'rect' },
  { id: 'coffee-table', name: '커피 테이블', width: 100, height: 50, color: '#eab308', shape: 'rect' },
]

// 커스텀 가구 목록
const customFurnitureList = ref<CustomFurniture[]>([])

// 모달 상태
const showAddModal = ref(false)
const validationErrors = ref<string[]>([])

// 새 가구 입력 폼
const newFurniture = ref({
  name: '',
  width: 100,
  height: 60,
  color: '#9ca3af',
})

// 초기화
onMounted(() => {
  loadCustomFurniture()
})

// 커스텀 가구 불러오기
function loadCustomFurniture() {
  customFurnitureList.value = getCustomFurnitureList()
}

// 커스텀 가구 추가
function addCustomFurniture() {
  validationErrors.value = []

  // 이름 검사
  if (!newFurniture.value.name.trim()) {
    validationErrors.value.push('이름을 입력해주세요')
  }

  // 크기 검사
  const validation = validateFurnitureDimensions(
    newFurniture.value.width,
    newFurniture.value.height
  )
  if (!validation.valid) {
    validationErrors.value.push(...validation.errors)
  }

  if (validationErrors.value.length > 0) {
    return
  }

  // 가구 생성 및 저장
  const furniture = createCustomFurniture({
    name: newFurniture.value.name.trim(),
    width: newFurniture.value.width,
    height: newFurniture.value.height,
    color: newFurniture.value.color,
  })

  saveCustomFurniture(furniture)
  loadCustomFurniture()
  closeModal()
}

// 커스텀 가구 삭제
function removeCustomFurniture(id: string) {
  deleteCustomFurniture(id)
  loadCustomFurniture()
}

// 모달 닫기
function closeModal() {
  showAddModal.value = false
  validationErrors.value = []
  newFurniture.value = {
    name: '',
    width: 100,
    height: 60,
    color: '#9ca3af',
  }
}

// 드래그 시작
function onDragStart(event: DragEvent, item: FurnitureItem | CustomFurniture) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(item))
    event.dataTransfer.effectAllowed = 'copy'
  }
}

// 모양에 따른 CSS 클래스
function getShapeClass(shape?: FurnitureShape): string {
  switch (shape) {
    case 'circle':
      return 'rounded-full'
    case 'ellipse':
      return 'rounded-full'
    case 'l-shape':
      return 'rounded-sm'
    default:
      return 'rounded'
  }
}
</script>
