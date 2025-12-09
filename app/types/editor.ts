import type { Furniture } from './furniture'
import type { Room } from './room'
import type { Door } from './door'
import type { Wall } from '~/utils/wall'
import type { Rect } from 'konva/lib/shapes/Rect'
import type { Group } from 'konva/lib/Group'

// 선택 가능한 객체 타입
export type SelectableType = 'furniture' | 'door' | 'wall' | 'room' | 'image' | 'group'

// 다중 선택 아이템
export interface SelectedItem {
  id: string
  type: 'furniture' | 'door' | 'wall'
}

// 그룹 드래그 상태
export interface GroupDragState {
  startX: number
  startY: number
  items: Array<{
    id: string
    type: 'furniture' | 'door' | 'wall'
    originalX: number
    originalY: number
    // 벽체용 추가 좌표
    originalEndX?: number
    originalEndY?: number
  }>
}

// 히스토리 상태
export interface HistoryState {
  room: Room | null
  furnitureList: Furniture[]
  doorList: Door[]
  wallList: Wall[]
}

// 거리 표시 라인
export interface DistanceLine {
  id: string
  points: number[]
  distance: number
  textX: number
  textY: number
  offsetX?: number
  offsetY?: number
  color: string
}

// 에디터 도구 타입
export type ToolType = 'select' | 'room' | 'wall' | 'door' | 'furniture' | 'measure' | 'image'

// 에디터 모드 타입
export type ModeType = 'normal' | 'draw' | 'measure'

// 레이어 컴포넌트 인스턴스 타입

/** vue-konva 컴포넌트 ref 타입 (getNode 메서드로 Konva 노드에 접근) */
export interface KonvaComponentRef<T> {
  getNode: () => T
}

/**
 * RoomLayer 컴포넌트 인스턴스 타입
 * Transformer 연결을 위해 roomRectRef를 노출
 */
export interface RoomLayerInstance {
  roomRectRef: KonvaComponentRef<Rect> | null
}

/**
 * FurnitureLayer 컴포넌트 인스턴스 타입
 * Transformer 연결을 위해 개별 가구 ref 맵을 노출
 */
export interface FurnitureLayerInstance {
  furnitureRefs: Map<string, KonvaComponentRef<Group>>
  setFurnitureRef: (id: string, el: KonvaComponentRef<Group> | null) => void
}
