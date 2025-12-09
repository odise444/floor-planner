import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Furniture } from '~/types/furniture'
import type { Room } from '~/types/room'
import type { Door } from '~/types/door'
import type { Wall } from '~/utils/wall'
import type { ObjectGroup } from '~/utils/group'
import type { FloorPlanImage } from '~/utils/floorPlanImage'
import { getNextZIndex, sortByZIndex, bringToFront, sendToBack, bringForward, sendBackward, reorderToPosition } from '~/utils/layerOrder'

export const useCanvasStore = defineStore('canvas', () => {
  // ========== 상태 (State) ==========

  // 방
  const room = ref<Room | null>(null)

  // 가구 목록
  const furnitureList = ref<Furniture[]>([])

  // 문 목록
  const doorList = ref<Door[]>([])

  // 벽체 목록
  const wallList = ref<Wall[]>([])

  // 평면도 이미지
  const floorPlanImage = ref<FloorPlanImage | null>(null)

  // 그룹 목록
  const groups = ref<ObjectGroup[]>([])

  // 기본 스케일 (1cm = 2px)
  const DEFAULT_SCALE = 2

  // ========== Computed ==========

  // 동적 스케일 계산
  const scale = computed(() => {
    if (room.value?.widthCm && room.value.widthCm > 0) {
      return room.value.width / room.value.widthCm
    }
    return DEFAULT_SCALE
  })

  // zIndex 순서로 정렬된 가구 목록
  const sortedFurnitureList = computed(() => {
    return sortByZIndex([...furnitureList.value])
  })

  // ========== 액션 (Actions) ==========

  // 방 생성
  function createRoom(width: number, height: number, widthCm?: number, heightCm?: number) {
    room.value = {
      id: `room-${Date.now()}`,
      x: 0,
      y: 0,
      width,
      height,
      widthCm,
      heightCm,
      opacity: 1,
      zIndex: 0,
    }
  }

  // 방 업데이트
  function updateRoom(updates: Partial<Room>) {
    if (room.value) {
      Object.assign(room.value, updates)
    }
  }

  // 가구 추가
  function addFurniture(furniture: Omit<Furniture, 'zIndex'>) {
    const newFurniture: Furniture = {
      ...furniture,
      zIndex: getNextZIndex(furnitureList.value),
    }
    furnitureList.value.push(newFurniture)
    return newFurniture
  }

  // 가구 업데이트
  function updateFurniture(id: string, updates: Partial<Furniture>) {
    const furniture = furnitureList.value.find(f => f.id === id)
    if (furniture) {
      Object.assign(furniture, updates)
    }
  }

  // 가구 삭제
  function removeFurniture(id: string) {
    const index = furnitureList.value.findIndex(f => f.id === id)
    if (index !== -1) {
      furnitureList.value.splice(index, 1)
    }
  }

  // 가구 레이어 순서 변경
  function moveFurnitureToFront(id: string) {
    furnitureList.value = bringToFront(furnitureList.value, id)
  }

  function moveFurnitureToBack(id: string) {
    furnitureList.value = sendToBack(furnitureList.value, id)
  }

  function moveFurnitureForward(id: string) {
    furnitureList.value = bringForward(furnitureList.value, id)
  }

  function moveFurnitureBackward(id: string) {
    furnitureList.value = sendBackward(furnitureList.value, id)
  }

  function reorderFurniture(fromId: string, toIndex: number) {
    furnitureList.value = reorderToPosition(furnitureList.value, fromId, toIndex)
  }

  // 문 추가
  function addDoor(door: Door) {
    doorList.value.push(door)
    return door
  }

  // 문 업데이트
  function updateDoor(id: string, updates: Partial<Door>) {
    const door = doorList.value.find(d => d.id === id)
    if (door) {
      Object.assign(door, updates)
    }
  }

  // 문 삭제
  function removeDoor(id: string) {
    const index = doorList.value.findIndex(d => d.id === id)
    if (index !== -1) {
      doorList.value.splice(index, 1)
    }
  }

  // 벽체 추가
  function addWall(wall: Wall) {
    wallList.value.push(wall)
    return wall
  }

  // 벽체 업데이트
  function updateWall(id: string, updates: Partial<Wall>) {
    const wall = wallList.value.find(w => w.id === id)
    if (wall) {
      Object.assign(wall, updates)
    }
  }

  // 벽체 삭제
  function removeWall(id: string) {
    const index = wallList.value.findIndex(w => w.id === id)
    if (index !== -1) {
      wallList.value.splice(index, 1)
    }
  }

  // 그룹 추가
  function addGroup(group: ObjectGroup) {
    groups.value.push(group)
    return group
  }

  // 그룹 삭제
  function removeGroup(id: string) {
    const index = groups.value.findIndex(g => g.id === id)
    if (index !== -1) {
      groups.value.splice(index, 1)
    }
  }

  // 평면도 이미지 설정
  function setFloorPlanImage(image: FloorPlanImage | null) {
    floorPlanImage.value = image
  }

  // 평면도 이미지 업데이트
  function updateFloorPlanImage(updates: Partial<FloorPlanImage>) {
    if (floorPlanImage.value) {
      Object.assign(floorPlanImage.value, updates)
    }
  }

  // 전체 상태 초기화
  function resetCanvas() {
    room.value = null
    furnitureList.value = []
    doorList.value = []
    wallList.value = []
    floorPlanImage.value = null
    groups.value = []
  }

  // 상태 일괄 설정 (불러오기용)
  function loadState(state: {
    room?: Room | null
    furnitureList?: Furniture[]
    doorList?: Door[]
    wallList?: Wall[]
    floorPlanImage?: FloorPlanImage | null
    groups?: ObjectGroup[]
  }) {
    if (state.room !== undefined) room.value = state.room
    if (state.furnitureList !== undefined) furnitureList.value = state.furnitureList
    if (state.doorList !== undefined) doorList.value = state.doorList
    if (state.wallList !== undefined) wallList.value = state.wallList
    if (state.floorPlanImage !== undefined) floorPlanImage.value = state.floorPlanImage
    if (state.groups !== undefined) groups.value = state.groups
  }

  // 현재 상태 스냅샷 (히스토리용)
  function getSnapshot() {
    return {
      room: room.value ? { ...room.value } : null,
      furnitureList: furnitureList.value.map(f => ({ ...f })),
      doorList: doorList.value.map(d => ({ ...d })),
      wallList: wallList.value.map(w => ({ ...w })),
    }
  }

  return {
    // State
    room,
    furnitureList,
    doorList,
    wallList,
    floorPlanImage,
    groups,

    // Computed
    scale,
    sortedFurnitureList,
    DEFAULT_SCALE,

    // Room Actions
    createRoom,
    updateRoom,

    // Furniture Actions
    addFurniture,
    updateFurniture,
    removeFurniture,
    moveFurnitureToFront,
    moveFurnitureToBack,
    moveFurnitureForward,
    moveFurnitureBackward,
    reorderFurniture,

    // Door Actions
    addDoor,
    updateDoor,
    removeDoor,

    // Wall Actions
    addWall,
    updateWall,
    removeWall,

    // Group Actions
    addGroup,
    removeGroup,

    // FloorPlan Image Actions
    setFloorPlanImage,
    updateFloorPlanImage,

    // Utility Actions
    resetCanvas,
    loadState,
    getSnapshot,
  }
})
