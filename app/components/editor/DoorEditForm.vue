<template>
  <div class="bg-white rounded-lg shadow-lg p-4 w-72">
    <h3 class="text-sm font-medium text-gray-900 mb-3">🚪 문 편집</h3>

    <div class="space-y-3">
      <!-- 너비 -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">너비 (cm)</label>
        <input
          v-model.number="editData.width"
          type="number"
          min="1"
          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- 열림 방향 -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">열림 방향</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              v-model="editData.openDirection"
              type="radio"
              value="inside"
              class="text-blue-500 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">안쪽</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              v-model="editData.openDirection"
              type="radio"
              value="outside"
              class="text-blue-500 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">바깥쪽</span>
          </label>
        </div>
      </div>

      <!-- 경첩 위치 -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">경첩 위치</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              v-model="editData.hingeSide"
              type="radio"
              value="left"
              class="text-blue-500 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">왼쪽</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              v-model="editData.hingeSide"
              type="radio"
              value="right"
              class="text-blue-500 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">오른쪽</span>
          </label>
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
import { ref, watch } from 'vue'
import { validateDoorEdit, type DoorEditData } from '~/utils/objectEdit'

interface Door {
  id: string
  x: number
  y: number
  width: number
  wall: 'top' | 'bottom' | 'left' | 'right'
  openDirection: 'inside' | 'outside'
  hingeSide: 'left' | 'right'
}

const props = defineProps<{
  door: Door
}>()

const emit = defineEmits<{
  update: [data: DoorEditData]
  delete: []
  close: []
}>()

const editData = ref<DoorEditData>({
  width: props.door.width,
  openDirection: props.door.openDirection,
  hingeSide: props.door.hingeSide,
})

const errors = ref<string[]>([])

// props 변경 시 editData 동기화
watch(() => props.door, (newVal) => {
  editData.value = {
    width: newVal.width,
    openDirection: newVal.openDirection,
    hingeSide: newVal.hingeSide,
  }
}, { deep: true })

function handleApply() {
  errors.value = []

  const validation = validateDoorEdit(editData.value)
  if (!validation.valid) {
    errors.value = validation.errors
    return
  }

  emit('update', { ...editData.value })
}
</script>
