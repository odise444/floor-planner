// 벽 위치 타입
export type WallPosition = 'top' | 'bottom' | 'left' | 'right'

// 문 열림 방향
export type OpenDirection = 'inside' | 'outside'

// 경첩 위치
export type HingeSide = 'left' | 'right'

// 문 타입
export interface Door {
  id: string
  x: number
  y: number
  width: number // 문 너비 (cm)
  wall: WallPosition // 어느 벽에 배치
  openDirection: OpenDirection // 안쪽/바깥쪽 열림
  hingeSide: HingeSide // 경첩 위치
}

// 문 편집 데이터
export interface DoorEditData {
  width: number
  openDirection: OpenDirection
  hingeSide: HingeSide
}
