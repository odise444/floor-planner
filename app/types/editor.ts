import type { Furniture } from './furniture'
import type { Room } from './room'
import type { Door } from './door'
import type { Wall } from '~/utils/wall'

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
