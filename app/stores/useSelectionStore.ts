import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Furniture } from '~/types/furniture'
import type { Room } from '~/types/room'
import type { Door } from '~/types/door'
import type { Wall } from '~/utils/wall'
import type { ObjectGroup } from '~/utils/group'
import type { SelectableType, SelectedItem, GroupDragState } from '~/types/editor'

export const useSelectionStore = defineStore('selection', () => {
  // ========== 단일 선택 상태 ==========

  // 선택된 가구
  const selectedFurniture = ref<Furniture | null>(null)

  // 선택된 문
  const selectedDoor = ref<Door | null>(null)

  // 선택된 벽체
  const selectedWall = ref<Wall | null>(null)

  // 선택된 그룹
  const selectedGroup = ref<ObjectGroup | null>(null)

  // 선택된 평면도 이미지 ID
  const selectedFloorPlanImageId = ref<string | null>(null)

  // 방 선택 여부
  const isRoomSelected = ref(false)

  // ========== 다중 선택 상태 ==========

  // 다중 선택 아이템 (Ctrl+클릭)
  const multiSelectedItems = ref<SelectedItem[]>([])

  // 그룹 드래그 상태
  const groupDragState = ref<GroupDragState | null>(null)

  // ========== Computed ==========

  // 선택된 항목이 있는지
  const hasSelection = computed(() => {
    return (
      selectedFurniture.value !== null ||
      selectedDoor.value !== null ||
      selectedWall.value !== null ||
      selectedGroup.value !== null ||
      selectedFloorPlanImageId.value !== null ||
      isRoomSelected.value
    )
  })

  // 다중 선택 중인지
  const isMultiSelecting = computed(() => multiSelectedItems.value.length > 0)

  // 현재 선택된 타입
  const selectedType = computed<SelectableType | null>(() => {
    if (selectedFurniture.value) return 'furniture'
    if (selectedDoor.value) return 'door'
    if (selectedWall.value) return 'wall'
    if (selectedGroup.value) return 'group'
    if (selectedFloorPlanImageId.value) return 'image'
    if (isRoomSelected.value) return 'room'
    return null
  })

  // ========== 액션 (Actions) ==========

  // 가구 선택
  function selectFurniture(furniture: Furniture | null) {
    selectedFurniture.value = furniture
    if (furniture) {
      selectedDoor.value = null
      selectedWall.value = null
      selectedGroup.value = null
      selectedFloorPlanImageId.value = null
      isRoomSelected.value = false
    }
  }

  // 문 선택
  function selectDoor(door: Door | null) {
    selectedDoor.value = door
    if (door) {
      selectedFurniture.value = null
      selectedWall.value = null
      selectedGroup.value = null
      selectedFloorPlanImageId.value = null
      isRoomSelected.value = false
    }
  }

  // 벽체 선택
  function selectWall(wall: Wall | null) {
    selectedWall.value = wall
    if (wall) {
      selectedFurniture.value = null
      selectedDoor.value = null
      selectedGroup.value = null
      selectedFloorPlanImageId.value = null
      isRoomSelected.value = false
    }
  }

  // 그룹 선택
  function selectGroup(group: ObjectGroup | null) {
    selectedGroup.value = group
    if (group) {
      selectedFurniture.value = null
      selectedDoor.value = null
      selectedWall.value = null
      selectedFloorPlanImageId.value = null
      isRoomSelected.value = false
    }
  }

  // 방 선택
  function selectRoom() {
    isRoomSelected.value = true
    selectedFurniture.value = null
    selectedDoor.value = null
    selectedWall.value = null
    selectedGroup.value = null
    selectedFloorPlanImageId.value = null
  }

  // 이미지 선택
  function selectImage(imageId: string | null) {
    selectedFloorPlanImageId.value = imageId
    if (imageId) {
      selectedFurniture.value = null
      selectedDoor.value = null
      selectedWall.value = null
      selectedGroup.value = null
      isRoomSelected.value = false
    }
  }

  // 모든 선택 해제
  function clearSelection() {
    selectedFurniture.value = null
    selectedDoor.value = null
    selectedWall.value = null
    selectedGroup.value = null
    selectedFloorPlanImageId.value = null
    isRoomSelected.value = false
    clearMultiSelect()
  }

  // ========== 다중 선택 액션 ==========

  // 다중 선택 토글
  function toggleMultiSelect(id: string, type: 'furniture' | 'door' | 'wall') {
    const index = multiSelectedItems.value.findIndex(
      item => item.id === id && item.type === type
    )
    if (index !== -1) {
      multiSelectedItems.value.splice(index, 1)
    } else {
      multiSelectedItems.value.push({ id, type })
    }
  }

  // 다중 선택 초기화
  function clearMultiSelect() {
    multiSelectedItems.value = []
  }

  // 아이템이 다중 선택에 포함되어 있는지
  function isMultiSelected(id: string, type: 'furniture' | 'door' | 'wall') {
    return multiSelectedItems.value.some(
      item => item.id === id && item.type === type
    )
  }

  // ========== 그룹 드래그 액션 ==========

  // 그룹 드래그 시작
  function startGroupDrag(state: GroupDragState) {
    groupDragState.value = state
  }

  // 그룹 드래그 종료
  function endGroupDrag() {
    groupDragState.value = null
  }

  return {
    // 단일 선택 State
    selectedFurniture,
    selectedDoor,
    selectedWall,
    selectedGroup,
    selectedFloorPlanImageId,
    isRoomSelected,

    // 다중 선택 State
    multiSelectedItems,
    groupDragState,

    // Computed
    hasSelection,
    isMultiSelecting,
    selectedType,

    // 단일 선택 Actions
    selectFurniture,
    selectDoor,
    selectWall,
    selectGroup,
    selectRoom,
    selectImage,
    clearSelection,

    // 다중 선택 Actions
    toggleMultiSelect,
    clearMultiSelect,
    isMultiSelected,

    // 그룹 드래그 Actions
    startGroupDrag,
    endGroupDrag,
  }
})
