import type { FurnitureShape, LShapeDirection, FurnitureEditData as FurnitureEditDataType } from '~/types/furniture'

// 가구 편집 데이터 타입 (types/furniture.ts에서 재내보내기)
export type FurnitureEditData = FurnitureEditDataType

// 문 편집 데이터 타입
export interface DoorEditData {
  width: number
  openDirection: 'inside' | 'outside'
  hingeSide: 'left' | 'right'
}

// 가구 타입 (기존 FloorPlanCanvas의 Furniture와 호환)
export interface Furniture {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  color: string
  rotation: number
  shape?: FurnitureShape
  lShapeDirection?: LShapeDirection
  lShapeRatio?: number
}

// 문 타입 (기존 FloorPlanCanvas의 Door와 호환)
export interface Door {
  id: string
  x: number
  y: number
  width: number
  wall: 'top' | 'bottom' | 'left' | 'right'
  openDirection: 'inside' | 'outside'
  hingeSide: 'left' | 'right'
}

// 유효성 검사 결과
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// 유효한 회전 값
const VALID_ROTATIONS = [0, 90, 180, 270]

/**
 * 가구 편집 데이터 유효성 검사
 */
export function validateFurnitureEdit(data: FurnitureEditData): ValidationResult {
  const errors: string[] = []

  // 이름 검사
  if (!data.name || data.name.trim() === '') {
    errors.push('이름을 입력해주세요')
  }

  // 너비 검사 (양수만)
  if (data.width <= 0) {
    errors.push('너비는 양수여야 합니다')
  }

  // 높이 검사 (양수만)
  if (data.height <= 0) {
    errors.push('높이는 양수여야 합니다')
  }

  // 회전 검사 (0, 90, 180, 270만 허용)
  if (!VALID_ROTATIONS.includes(data.rotation)) {
    errors.push('회전은 0, 90, 180, 270 중 하나여야 합니다')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 문 편집 데이터 유효성 검사
 */
export function validateDoorEdit(data: DoorEditData): ValidationResult {
  const errors: string[] = []

  // 너비 검사 (양수만)
  if (data.width <= 0) {
    errors.push('너비는 양수여야 합니다')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 가구에 편집 데이터 적용
 */
export function applyFurnitureEdit(furniture: Furniture, editData: FurnitureEditData): Furniture {
  return {
    ...furniture,
    name: editData.name,
    width: editData.width,
    height: editData.height,
    color: editData.color,
    rotation: editData.rotation,
    shape: editData.shape,
    lShapeDirection: editData.lShapeDirection,
    lShapeRatio: editData.lShapeRatio,
  }
}

/**
 * 문에 편집 데이터 적용
 */
export function applyDoorEdit(door: Door, editData: DoorEditData): Door {
  return {
    ...door,
    width: editData.width,
    openDirection: editData.openDirection,
    hingeSide: editData.hingeSide,
  }
}
