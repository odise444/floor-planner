<template>
  <div class="flex flex-1 overflow-hidden">
    <!-- Activity Bar -->
    <LayoutActivityBar v-model:activePanel="activePanel" />

    <!-- 사이드 패널 -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
      <!-- 가구 라이브러리 패널 -->
      <SidebarFurnitureLibrary v-if="activePanel === 'furniture'" @add-door="onAddDoor" />

      <!-- 레이어 패널 -->
      <EditorLayerPanel
        v-else-if="activePanel === 'layers'"
        embedded
        :items="canvasRef?.furnitureList || []"
        :selectedId="canvasRef?.selectedFurniture?.id || null"
        :image="canvasRef?.floorPlanImage || null"
        :selectedImageId="canvasRef?.selectedFloorPlanImageId || null"
        :room="canvasRef?.room || null"
        :isRoomSelected="canvasRef?.isRoomSelected || false"
        :walls="canvasRef?.wallList || []"
        :selectedWallId="canvasRef?.selectedWall?.id || null"
        :groups="canvasRef?.groups || []"
        :selectedGroupId="canvasRef?.selectedGroup?.id || null"
        @select="onLayerSelect"
        @select-image="onLayerSelectImage"
        @select-room="onLayerSelectRoom"
        @select-wall="onLayerSelectWall"
        @select-group="onLayerSelectGroup"
        @reorder="onLayerReorder"
        @move-forward="onLayerMoveForward"
        @move-backward="onLayerMoveBackward"
        @delete="onLayerDelete"
        @toggle-lock="onToggleLock"
        @create-group="onCreateGroup"
        @ungroup="onUngroup"
      />

      <!-- 히스토리 패널 -->
      <template v-else-if="activePanel === 'history'">
        <div class="p-4 border-b border-gray-200">
          <h2 class="font-medium text-gray-700">히스토리</h2>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <div class="text-sm text-gray-500">
            히스토리 기능 준비 중...
          </div>
        </div>
      </template>

      <!-- 설정 패널 -->
      <template v-else-if="activePanel === 'settings'">
        <div class="p-4 border-b border-gray-200">
          <h2 class="font-medium text-gray-700">설정</h2>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <div class="text-sm text-gray-500">
            설정 기능 준비 중...
          </div>
        </div>
      </template>
    </aside>

    <!-- 캔버스 -->
    <EditorFloorPlanCanvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
import type { PanelId } from '~/components/layout/ActivityBar.vue'
import type { Furniture } from '~/types/furniture'
import type { FloorPlanImage } from '~/utils/floorPlanImage'
import type { Room } from '~/utils/floorPlanStorage'
import type { Wall } from '~/utils/wall'
import type { ObjectGroup, GroupMember } from '~/utils/group'

const canvasRef = ref<any>(null)
const activePanel = ref<PanelId>('furniture')

// 전역 상태로 캔버스 참조 공유
const globalCanvasRef = useState<any>('canvasRef', () => null)

watch(canvasRef, (val) => {
  globalCanvasRef.value = val
}, { immediate: true })

const onAddDoor = () => {
  if (canvasRef.value?.room) {
    canvasRef.value.showDoorModal = true
  }
}

// 레이어 패널 이벤트 핸들러
const onLayerSelect = (item: Furniture) => {
  if (canvasRef.value?.onLayerSelect) {
    canvasRef.value.onLayerSelect(item)
  }
}

const onLayerSelectImage = (image: FloorPlanImage) => {
  if (canvasRef.value?.onLayerSelectImage) {
    canvasRef.value.onLayerSelectImage(image)
  }
}

const onLayerSelectRoom = (room: Room) => {
  if (canvasRef.value?.onLayerSelectRoom) {
    canvasRef.value.onLayerSelectRoom(room)
  }
}

const onLayerSelectWall = (wall: Wall) => {
  if (canvasRef.value?.onLayerSelectWall) {
    canvasRef.value.onLayerSelectWall(wall)
  }
}

const onLayerSelectGroup = (group: ObjectGroup) => {
  if (canvasRef.value?.onLayerSelectGroup) {
    canvasRef.value.onLayerSelectGroup(group)
  }
}

const onLayerReorder = (fromId: string, toIndex: number) => {
  if (canvasRef.value?.onLayerReorder) {
    canvasRef.value.onLayerReorder(fromId, toIndex)
  }
}

const onLayerMoveForward = (item: Furniture) => {
  if (canvasRef.value?.onLayerMoveForward) {
    canvasRef.value.onLayerMoveForward(item)
  }
}

const onLayerMoveBackward = (item: Furniture) => {
  if (canvasRef.value?.onLayerMoveBackward) {
    canvasRef.value.onLayerMoveBackward(item)
  }
}

const onLayerDelete = (item: Furniture) => {
  if (canvasRef.value?.onLayerDelete) {
    canvasRef.value.onLayerDelete(item)
  }
}

const onToggleLock = (image: FloorPlanImage) => {
  if (canvasRef.value?.onToggleImageLock) {
    canvasRef.value.onToggleImageLock(image)
  }
}

const onCreateGroup = (members: GroupMember[]) => {
  if (canvasRef.value?.onCreateGroup) {
    canvasRef.value.onCreateGroup(members)
  }
}

const onUngroup = (groupId: string) => {
  if (canvasRef.value?.onUngroup) {
    canvasRef.value.onUngroup(groupId)
  }
}

// 페이지 로드 시 저장된 데이터 불러오기
onMounted(() => {
  nextTick(() => {
    if (canvasRef.value?.loadFromLocalStorage) {
      canvasRef.value.loadFromLocalStorage()
    }
  })
})

useHead({
  title: '에디터 - 이사할 때',
})
</script>
