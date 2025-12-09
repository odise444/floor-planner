<template>
  <header class="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
    <!-- 좌측: 로고 + 메뉴 -->
    <div class="flex items-center gap-4">
      <!-- 로고 -->
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="font-semibold text-gray-800">Floor Planner</span>
      </div>

      <!-- 메뉴 드롭다운 -->
      <nav class="flex items-center gap-1">
        <MenuBarDropdown label="파일">
          <MenuBarItem @click="emit('new')">새 프로젝트</MenuBarItem>
          <MenuBarItem @click="emit('save')">저장</MenuBarItem>
          <MenuBarItem @click="emit('load')">불러오기</MenuBarItem>
          <div class="border-t border-gray-200 my-1" />
          <MenuBarItem @click="emit('exportJson')">JSON 내보내기</MenuBarItem>
          <MenuBarItem @click="emit('exportPng')">PNG 내보내기</MenuBarItem>
          <MenuBarItem @click="emit('exportJpeg')">JPEG 내보내기</MenuBarItem>
        </MenuBarDropdown>

        <MenuBarDropdown label="편집">
          <MenuBarItem :disabled="!canUndo" @click="emit('undo')">
            실행 취소 <span class="text-gray-400 ml-2">Ctrl+Z</span>
          </MenuBarItem>
          <MenuBarItem :disabled="!canRedo" @click="emit('redo')">
            다시 실행 <span class="text-gray-400 ml-2">Ctrl+Y</span>
          </MenuBarItem>
          <div class="border-t border-gray-200 my-1" />
          <MenuBarItem :disabled="!hasSelection" @click="emit('delete')">
            삭제 <span class="text-gray-400 ml-2">Delete</span>
          </MenuBarItem>
        </MenuBarDropdown>

        <MenuBarDropdown label="보기">
          <MenuBarItem @click="emit('zoomIn')">
            확대 <span class="text-gray-400 ml-2">Ctrl++</span>
          </MenuBarItem>
          <MenuBarItem @click="emit('zoomOut')">
            축소 <span class="text-gray-400 ml-2">Ctrl+-</span>
          </MenuBarItem>
          <MenuBarItem @click="emit('resetView')">
            뷰 초기화
          </MenuBarItem>
          <div class="border-t border-gray-200 my-1" />
          <MenuBarItem :checked="showPolygonView" @click="emit('togglePolygonView')">
            폴리곤 뷰 <span class="text-gray-400 ml-2">P</span>
          </MenuBarItem>
        </MenuBarDropdown>

        <MenuBarDropdown label="도구">
          <MenuBarItem :checked="isMeasureMode" @click="emit('toggleMeasure')">
            측정 도구 <span class="text-gray-400 ml-2">M</span>
          </MenuBarItem>
          <MenuBarItem :checked="isWallDrawMode" @click="emit('toggleWallDraw')">
            벽체 그리기 <span class="text-gray-400 ml-2">W</span>
          </MenuBarItem>
        </MenuBarDropdown>
      </nav>
    </div>

    <!-- 우측: 액션 버튼 -->
    <div class="flex items-center gap-2">
      <button
        class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        @click="emit('save')"
      >
        저장
      </button>
      <button
        class="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        @click="emit('exportPng')"
      >
        내보내기
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import MenuBarDropdown from './MenuBarDropdown.vue'
import MenuBarItem from './MenuBarItem.vue'

// Props
defineProps<{
  canUndo: boolean
  canRedo: boolean
  hasSelection: boolean
  isMeasureMode: boolean
  isWallDrawMode: boolean
  showPolygonView: boolean
}>()

// Emits
const emit = defineEmits<{
  new: []
  save: []
  load: []
  exportJson: []
  exportPng: []
  exportJpeg: []
  undo: []
  redo: []
  delete: []
  zoomIn: []
  zoomOut: []
  resetView: []
  togglePolygonView: []
  toggleMeasure: []
  toggleWallDraw: []
}>()
</script>
