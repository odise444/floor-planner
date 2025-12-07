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
      <div v-if="sortedItems.length === 0" class="text-center text-gray-400 text-sm py-4">
        가구가 없습니다
      </div>

      <div
        v-for="item in sortedItems"
        :key="item.id"
        class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors"
        :class="{ 'bg-blue-50 border border-blue-200': selectedId === item.id }"
        @click="$emit('select', item)"
      >
        <!-- 색상 미리보기 -->
        <div
          class="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
          :style="{ backgroundColor: item.color }"
        />

        <!-- 이름 -->
        <div class="flex-1 min-w-0">
          <div class="text-sm text-gray-800 truncate">{{ item.name }}</div>
          <div class="text-xs text-gray-400">{{ item.width }}×{{ item.height }}cm</div>
        </div>

        <!-- 레이어 순서 조절 버튼 -->
        <div class="flex flex-col gap-0.5">
          <button
            class="p-0.5 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="isTopmost(item)"
            title="위로"
            @click.stop="$emit('move-forward', item)"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            class="p-0.5 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="isBottommost(item)"
            title="아래로"
            @click.stop="$emit('move-backward', item)"
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
        :disabled="!selectedId"
        @click="$emit('bring-to-front')"
      >
        맨 앞으로
      </button>
      <button
        class="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
        :disabled="!selectedId"
        @click="$emit('send-to-back')"
      >
        맨 뒤로
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Furniture } from '~/types/furniture'
import { sortByZIndex } from '~/utils/layerOrder'

const props = defineProps<{
  items: Furniture[]
  selectedId: string | null
}>()

defineEmits<{
  close: []
  select: [item: Furniture]
  'move-forward': [item: Furniture]
  'move-backward': [item: Furniture]
  'bring-to-front': []
  'send-to-back': []
}>()

// 역순 정렬 (높은 zIndex가 위에 표시)
const sortedItems = computed(() => {
  return [...sortByZIndex(props.items)].reverse()
})

const isTopmost = (item: Furniture) => {
  if (props.items.length <= 1) return true
  const maxZIndex = Math.max(...props.items.map(i => i.zIndex))
  return item.zIndex === maxZIndex
}

const isBottommost = (item: Furniture) => {
  if (props.items.length <= 1) return true
  const minZIndex = Math.min(...props.items.map(i => i.zIndex))
  return item.zIndex === minZIndex
}
</script>
