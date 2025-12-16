/**
 * 거리 계산 유틸리티
 * - 오브젝트에서 벽까지의 거리 계산
 */

export interface WallInput {
  startX: number
  startY: number
  endX: number
  endY: number
  thickness: number
}

export interface WallBounds {
  left: number
  right: number
  top: number
  bottom: number
}

export interface ObjectBounds {
  left: number
  right: number
  top: number
  bottom: number
}

export interface DistanceResult {
  distance: number
  wallEdge: number
}

export type Direction = 'left' | 'right' | 'top' | 'bottom'

export interface RoomBoundary {
  left: number
  top: number
  width: number
  height: number
}

/**
 * 벽의 바운딩 박스를 계산한다
 * 벽의 두께와 각도를 고려하여 실제 차지하는 영역을 반환
 */
export function getWallBoundingBox(wall: WallInput): WallBounds {
  const dx = wall.endX - wall.startX
  const dy = wall.endY - wall.startY
  const length = Math.sqrt(dx * dx + dy * dy)

  if (length === 0) {
    const half = wall.thickness / 2
    return {
      left: wall.startX - half,
      right: wall.startX + half,
      top: wall.startY - half,
      bottom: wall.startY + half,
    }
  }

  // 벽의 방향에 수직인 벡터 (정규화)
  const perpX = -dy / length
  const perpY = dx / length

  const halfThickness = wall.thickness / 2

  // 벽의 네 꼭짓점
  const corners = [
    { x: wall.startX + perpX * halfThickness, y: wall.startY + perpY * halfThickness },
    { x: wall.startX - perpX * halfThickness, y: wall.startY - perpY * halfThickness },
    { x: wall.endX + perpX * halfThickness, y: wall.endY + perpY * halfThickness },
    { x: wall.endX - perpX * halfThickness, y: wall.endY - perpY * halfThickness },
  ]

  return {
    left: Math.min(...corners.map((c) => c.x)),
    right: Math.max(...corners.map((c) => c.x)),
    top: Math.min(...corners.map((c) => c.y)),
    bottom: Math.max(...corners.map((c) => c.y)),
  }
}

/**
 * 오브젝트에서 특정 방향으로 가장 가까운 벽까지의 거리를 계산한다
 * @param objectBounds 오브젝트의 바운딩 박스
 * @param walls 벽 목록
 * @param direction 측정 방향
 * @returns 거리와 벽 경계 위치, 또는 null (해당 방향에 벽이 없는 경우)
 */
export function findNearestWallDistance(
  objectBounds: ObjectBounds,
  walls: WallInput[],
  direction: Direction
): DistanceResult | null {
  let nearestDistance = Infinity
  let nearestWallEdge = 0

  for (const wall of walls) {
    const wallBounds = getWallBoundingBox(wall)

    if (direction === 'left' || direction === 'right') {
      // Y축이 겹치는지 확인
      const yOverlap = !(objectBounds.bottom <= wallBounds.top || objectBounds.top >= wallBounds.bottom)
      if (!yOverlap) continue

      if (direction === 'left') {
        // 벽이 오브젝트 왼쪽에 있어야 함
        if (wallBounds.right <= objectBounds.left) {
          const distance = objectBounds.left - wallBounds.right
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestWallEdge = wallBounds.right
          }
        }
      } else {
        // 벽이 오브젝트 오른쪽에 있어야 함
        if (wallBounds.left >= objectBounds.right) {
          const distance = wallBounds.left - objectBounds.right
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestWallEdge = wallBounds.left
          }
        }
      }
    } else {
      // X축이 겹치는지 확인
      const xOverlap = !(objectBounds.right <= wallBounds.left || objectBounds.left >= wallBounds.right)
      if (!xOverlap) continue

      if (direction === 'top') {
        // 벽이 오브젝트 위에 있어야 함
        if (wallBounds.bottom <= objectBounds.top) {
          const distance = objectBounds.top - wallBounds.bottom
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestWallEdge = wallBounds.bottom
          }
        }
      } else {
        // 벽이 오브젝트 아래에 있어야 함
        if (wallBounds.top >= objectBounds.bottom) {
          const distance = wallBounds.top - objectBounds.bottom
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestWallEdge = wallBounds.top
          }
        }
      }
    }
  }

  if (nearestDistance === Infinity) {
    return null
  }

  return {
    distance: nearestDistance,
    wallEdge: nearestWallEdge,
  }
}

/**
 * 오브젝트에서 방 경계까지의 거리를 계산한다
 * @param objectBounds 오브젝트의 바운딩 박스
 * @param roomBoundary 방 경계 (위치와 크기)
 * @param direction 측정 방향
 * @returns 거리와 경계 위치
 */
export function findNearestBoundaryDistance(
  objectBounds: ObjectBounds,
  roomBoundary: RoomBoundary,
  direction: Direction
): DistanceResult {
  const roomRight = roomBoundary.left + roomBoundary.width
  const roomBottom = roomBoundary.top + roomBoundary.height

  switch (direction) {
    case 'left':
      return {
        distance: objectBounds.left - roomBoundary.left,
        wallEdge: roomBoundary.left,
      }
    case 'right':
      return {
        distance: roomRight - objectBounds.right,
        wallEdge: roomRight,
      }
    case 'top':
      return {
        distance: objectBounds.top - roomBoundary.top,
        wallEdge: roomBoundary.top,
      }
    case 'bottom':
      return {
        distance: roomBottom - objectBounds.bottom,
        wallEdge: roomBottom,
      }
  }
}
