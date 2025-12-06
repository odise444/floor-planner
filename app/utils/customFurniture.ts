// 커스텀 가구 타입 정의
export interface CustomFurniture {
  id: string
  name: string
  width: number   // cm 단위
  height: number  // cm 단위
  color: string
  isCustom: true  // 커스텀 가구 구분
}

// 커스텀 가구 생성 입력 타입
export interface CreateCustomFurnitureInput {
  name: string
  width: number
  height: number
  color?: string
}

// 유효성 검사 결과 타입
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// localStorage 키
export const STORAGE_KEY = 'floor-planner-custom-furniture'

// 기본 색상
const DEFAULT_COLOR = '#9ca3af'

// 크기 제한
const MIN_SIZE = 10   // cm
const MAX_SIZE = 500  // cm

/**
 * 커스텀 가구 생성
 */
export function createCustomFurniture(input: CreateCustomFurnitureInput): CustomFurniture {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: input.name,
    width: input.width,
    height: input.height,
    color: input.color || DEFAULT_COLOR,
    isCustom: true,
  }
}

/**
 * 가구 크기 유효성 검사
 */
export function validateFurnitureDimensions(width: number, height: number): ValidationResult {
  const errors: string[] = []

  // NaN 체크
  if (isNaN(width) || isNaN(height)) {
    errors.push('유효한 숫자를 입력해주세요')
    return { valid: false, errors }
  }

  // 너비 검사
  if (width < MIN_SIZE) {
    errors.push(`너비는 ${MIN_SIZE}cm 이상이어야 합니다`)
  }
  if (width > MAX_SIZE) {
    errors.push(`너비는 ${MAX_SIZE}cm 이하이어야 합니다`)
  }

  // 높이 검사
  if (height < MIN_SIZE) {
    errors.push(`높이는 ${MIN_SIZE}cm 이상이어야 합니다`)
  }
  if (height > MAX_SIZE) {
    errors.push(`높이는 ${MAX_SIZE}cm 이하이어야 합니다`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 커스텀 가구 목록 불러오기
 */
export function getCustomFurnitureList(): CustomFurniture[] {
  if (typeof localStorage === 'undefined') {
    return []
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return []
  }

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * 커스텀 가구 저장
 */
export function saveCustomFurniture(furniture: CustomFurniture): void {
  const list = getCustomFurnitureList()

  // 같은 ID가 있으면 덮어쓰기
  const existingIndex = list.findIndex((f) => f.id === furniture.id)
  if (existingIndex >= 0) {
    list[existingIndex] = furniture
  } else {
    list.push(furniture)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

/**
 * 커스텀 가구 삭제
 */
export function deleteCustomFurniture(id: string): void {
  const list = getCustomFurnitureList()
  const filtered = list.filter((f) => f.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}
