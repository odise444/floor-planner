// 가구 모양 타입
export type FurnitureShape = 'rect' | 'circle' | 'ellipse' | 'l-shape'

// L자형 가구 방향
export type LShapeDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

// 가구 타입
export interface Furniture {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  color: string
  rotation: number
  zIndex: number  // 레이어 순서 (높을수록 앞)
  shape?: FurnitureShape  // 기본값: 'rect'
  // L자형 가구 전용 속성
  lShapeDirection?: LShapeDirection  // L자 방향
  lShapeRatio?: number  // L자 비율 (0.2 ~ 0.8, 기본 0.5) - 단일 비율용
  lShapeRatioW?: number  // L자 가로 비율 (0.2 ~ 0.8)
  lShapeRatioH?: number  // L자 세로 비율 (0.2 ~ 0.8)
}

// 가구 라이브러리 아이템 타입
export interface FurnitureItem {
  id: string
  name: string
  width: number
  height: number
  color: string
  shape?: FurnitureShape
  lShapeDirection?: LShapeDirection
  lShapeRatio?: number
}

// 가구 편집 데이터 타입
export interface FurnitureEditData {
  name: string
  width: number
  height: number
  color: string
  rotation: number
  shape?: FurnitureShape
  lShapeDirection?: LShapeDirection
  lShapeRatio?: number
}

// 모양별 기본 설정
export const shapeDefaults: Record<FurnitureShape, { name: string; icon: string }> = {
  rect: { name: '사각형', icon: '⬜' },
  circle: { name: '원형', icon: '⭕' },
  ellipse: { name: '타원형', icon: '⬭' },
  'l-shape': { name: 'L자형', icon: '⌐' },
}
