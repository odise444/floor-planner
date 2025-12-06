<template>
  <div class="bg-white rounded-lg shadow-lg p-4 w-72">
    <h3 class="text-sm font-medium text-gray-900 mb-3">📝 가구 편집</h3>

    <div class="space-y-3">
      <!-- 이름 -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">이름</label>
        <input
          v-model="editData.name"
          type="text"
          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- 크기 -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">크기</label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="editData.width"
            type="number"
            min="1"
            class="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <span class="text-gray-500 text-sm">×</span>
          <input
            v-model.number="editData.height"
            type="number"
            min="1"
            class="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <span class="text-gray-500 text-sm">cm</span>
        </div>
      </div>

      <!-- 색상 -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">색상</label>
        <div class="flex items-center gap-2">
          <input
            v-model="editData.color"
            type="color"
            class="w-8 h-8 rounded cursor-pointer border border-gray-300"
          />
          <input
            v-model="editData.color"
            type="text"
            class="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <!-- 회전 -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">회전</label>
        <select
          v-model.number="editData.rotation"
          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option :value="0">0°</option>
          <option :value="90">90°</option>
          <option :value="180">180°</option>
          <option :value="270">270°</option>
        </select>
      </div>

      <!-- 모양 -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">모양</label>
        <select
          v-model="editData.shape"
          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option v-for="option in shapeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- L자형 옵션 -->
      <template v-if="isLShape">
        <!-- L자 방향 -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">L자 방향</label>
          <select
            v-model="editData.lShapeDirection"
            class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="option in lShapeDirectionOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- L자 비율 -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">L자 비율 ({{ Math.round((editData.lShapeRatio || 0.5) * 100) }}%)</label>
          <input
            v-model.number="editData.lShapeRatio"
            type="range"
            min="0.3"
            max="0.7"
            step="0.1"
            class="w-full"
          />
        </div>
      </template>

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
import { ref, watch, computed } from 'vue'
import { validateFurnitureEdit, type FurnitureEditData } from '~/utils/objectEdit'
import type { Furniture, FurnitureShape, LShapeDirection } from '~/types/furniture'
import { shapeDefaults } from '~/types/furniture'

const props = defineProps<{
  furniture: Furniture
}>()

const emit = defineEmits<{
  update: [data: FurnitureEditData]
  delete: []
  close: []
}>()

const editData = ref<FurnitureEditData>({
  name: props.furniture.name,
  width: props.furniture.width,
  height: props.furniture.height,
  color: props.furniture.color,
  rotation: props.furniture.rotation,
  shape: props.furniture.shape || 'rect',
  lShapeDirection: props.furniture.lShapeDirection || 'bottom-right',
  lShapeRatio: props.furniture.lShapeRatio || 0.5,
})

const errors = ref<string[]>([])

// L자형 여부
const isLShape = computed(() => editData.value.shape === 'l-shape')

// 모양 옵션
const shapeOptions: { value: FurnitureShape; label: string }[] = [
  { value: 'rect', label: '사각형' },
  { value: 'circle', label: '원형' },
  { value: 'ellipse', label: '타원형' },
  { value: 'l-shape', label: 'L자형' },
]

// L자형 방향 옵션
const lShapeDirectionOptions: { value: LShapeDirection; label: string }[] = [
  { value: 'top-left', label: '↖ 좌상단' },
  { value: 'top-right', label: '↗ 우상단' },
  { value: 'bottom-left', label: '↙ 좌하단' },
  { value: 'bottom-right', label: '↘ 우하단' },
]

// props 변경 시 editData 동기화
watch(() => props.furniture, (newVal) => {
  editData.value = {
    name: newVal.name,
    width: newVal.width,
    height: newVal.height,
    color: newVal.color,
    rotation: newVal.rotation,
    shape: newVal.shape || 'rect',
    lShapeDirection: newVal.lShapeDirection || 'bottom-right',
    lShapeRatio: newVal.lShapeRatio || 0.5,
  }
}, { deep: true })

function handleApply() {
  errors.value = []

  const validation = validateFurnitureEdit(editData.value)
  if (!validation.valid) {
    errors.value = validation.errors
    return
  }

  emit('update', { ...editData.value })
}
</script>
