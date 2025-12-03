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

        <!-- 가구 목록 -->
        <div
          v-for="item in furnitureItems"
          :key="item.id"
          class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
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
            <div>
              <div class="text-sm font-medium text-gray-700">{{ item.name }}</div>
              <div class="text-xs text-gray-500">
                {{ item.width }} × {{ item.height }} cm
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineEmits<{
  'add-door': []
}>()

interface FurnitureItem {
  id: string
  name: string
  width: number
  height: number
  color: string
}

const furnitureItems: FurnitureItem[] = [
  { id: 'sofa', name: '소파', width: 200, height: 90, color: '#6366f1' },
  { id: 'bed-single', name: '싱글 침대', width: 100, height: 200, color: '#8b5cf6' },
  { id: 'bed-double', name: '더블 침대', width: 150, height: 200, color: '#a855f7' },
  { id: 'dining-table', name: '식탁', width: 140, height: 80, color: '#f59e0b' },
  { id: 'desk', name: '책상', width: 120, height: 60, color: '#10b981' },
  { id: 'wardrobe', name: '옷장', width: 120, height: 60, color: '#6b7280' },
  { id: 'tv-stand', name: 'TV 스탠드', width: 150, height: 40, color: '#3b82f6' },
  { id: 'bookshelf', name: '책장', width: 80, height: 30, color: '#f97316' },
  { id: 'chair', name: '의자', width: 45, height: 45, color: '#14b8a6' },
  { id: 'coffee-table', name: '커피 테이블', width: 100, height: 50, color: '#eab308' },
]

const onDragStart = (event: DragEvent, item: FurnitureItem) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(item))
    event.dataTransfer.effectAllowed = 'copy'
  }
}
</script>
