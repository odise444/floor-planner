import { describe, it, expect } from 'vitest'

import {
  getWallBoundingBox,
  findNearestWallDistance,
  findNearestBoundaryDistance,
  type WallBounds,
  type ObjectBounds,
  type DistanceResult,
  type RoomBoundary,
} from '~/utils/distanceCalculation'

describe('거리 계산 유틸리티', () => {
  describe('getWallBoundingBox - 벽 바운딩 박스 계산', () => {
    it('수평 벽의 바운딩 박스를 올바르게 계산한다', () => {
      // 수평 벽: (100, 100) -> (300, 100), 두께 15cm
      const wall = {
        startX: 100,
        startY: 100,
        endX: 300,
        endY: 100,
        thickness: 15,
      }

      const bounds = getWallBoundingBox(wall)

      // 수평 벽이므로 두께는 Y축으로 확장
      expect(bounds.left).toBe(100)
      expect(bounds.right).toBe(300)
      expect(bounds.top).toBe(100 - 7.5) // 92.5
      expect(bounds.bottom).toBe(100 + 7.5) // 107.5
    })

    it('수직 벽의 바운딩 박스를 올바르게 계산한다', () => {
      // 수직 벽: (100, 100) -> (100, 300), 두께 15cm
      const wall = {
        startX: 100,
        startY: 100,
        endX: 100,
        endY: 300,
        thickness: 15,
      }

      const bounds = getWallBoundingBox(wall)

      // 수직 벽이므로 두께는 X축으로 확장
      expect(bounds.left).toBe(100 - 7.5) // 92.5
      expect(bounds.right).toBe(100 + 7.5) // 107.5
      expect(bounds.top).toBe(100)
      expect(bounds.bottom).toBe(300)
    })

    it('45도 대각선 벽의 바운딩 박스를 올바르게 계산한다', () => {
      // 대각선 벽: (0, 0) -> (100, 100), 두께 10cm
      const wall = {
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 100,
        thickness: 10,
      }

      const bounds = getWallBoundingBox(wall)

      // 45도이므로 두께가 X, Y 양쪽으로 확장
      const halfThickness = 5
      const offset = halfThickness / Math.sqrt(2) // 약 3.54

      expect(bounds.left).toBeCloseTo(-offset, 1)
      expect(bounds.right).toBeCloseTo(100 + offset, 1)
      expect(bounds.top).toBeCloseTo(-offset, 1)
      expect(bounds.bottom).toBeCloseTo(100 + offset, 1)
    })
  })

  describe('findNearestWallDistance - 가장 가까운 벽까지 거리', () => {
    const walls = [
      // 상단 수평 벽: y=50
      { startX: 0, startY: 50, endX: 500, endY: 50, thickness: 15 },
      // 하단 수평 벽: y=400
      { startX: 0, startY: 400, endX: 500, endY: 400, thickness: 15 },
      // 좌측 수직 벽: x=50
      { startX: 50, startY: 50, endX: 50, endY: 400, thickness: 15 },
      // 우측 수직 벽: x=450
      { startX: 450, startY: 50, endX: 450, endY: 400, thickness: 15 },
    ]

    it('오브젝트 좌측의 가장 가까운 벽까지 거리를 계산한다', () => {
      // 오브젝트: 좌측 200, 중앙 Y 200
      const objectBounds: ObjectBounds = {
        left: 200,
        right: 300,
        top: 150,
        bottom: 250,
      }

      const result = findNearestWallDistance(objectBounds, walls, 'left')

      // 좌측 벽(x=50)의 오른쪽 경계는 50 + 7.5 = 57.5
      // 오브젝트 좌측 200 - 벽 오른쪽 57.5 = 142.5
      expect(result.distance).toBeCloseTo(142.5, 1)
      expect(result.wallEdge).toBeCloseTo(57.5, 1)
    })

    it('오브젝트 우측의 가장 가까운 벽까지 거리를 계산한다', () => {
      const objectBounds: ObjectBounds = {
        left: 200,
        right: 300,
        top: 150,
        bottom: 250,
      }

      const result = findNearestWallDistance(objectBounds, walls, 'right')

      // 우측 벽(x=450)의 왼쪽 경계는 450 - 7.5 = 442.5
      // 벽 왼쪽 442.5 - 오브젝트 우측 300 = 142.5
      expect(result.distance).toBeCloseTo(142.5, 1)
      expect(result.wallEdge).toBeCloseTo(442.5, 1)
    })

    it('오브젝트 상단의 가장 가까운 벽까지 거리를 계산한다', () => {
      const objectBounds: ObjectBounds = {
        left: 200,
        right: 300,
        top: 150,
        bottom: 250,
      }

      const result = findNearestWallDistance(objectBounds, walls, 'top')

      // 상단 벽(y=50)의 하단 경계는 50 + 7.5 = 57.5
      // 오브젝트 상단 150 - 벽 하단 57.5 = 92.5
      expect(result.distance).toBeCloseTo(92.5, 1)
      expect(result.wallEdge).toBeCloseTo(57.5, 1)
    })

    it('오브젝트 하단의 가장 가까운 벽까지 거리를 계산한다', () => {
      const objectBounds: ObjectBounds = {
        left: 200,
        right: 300,
        top: 150,
        bottom: 250,
      }

      const result = findNearestWallDistance(objectBounds, walls, 'bottom')

      // 하단 벽(y=400)의 상단 경계는 400 - 7.5 = 392.5
      // 벽 상단 392.5 - 오브젝트 하단 250 = 142.5
      expect(result.distance).toBeCloseTo(142.5, 1)
      expect(result.wallEdge).toBeCloseTo(392.5, 1)
    })

    it('해당 방향에 벽이 없으면 null을 반환한다', () => {
      const objectBounds: ObjectBounds = {
        left: 200,
        right: 300,
        top: 150,
        bottom: 250,
      }

      // 빈 벽 배열
      const result = findNearestWallDistance(objectBounds, [], 'left')

      expect(result).toBeNull()
    })

    it('Y축이 겹치지 않는 벽은 좌우 거리 계산에서 제외한다', () => {
      // 오브젝트 Y: 150~250
      const objectBounds: ObjectBounds = {
        left: 200,
        right: 300,
        top: 150,
        bottom: 250,
      }

      // Y축이 겹치지 않는 좌측 벽 (오브젝트 위에 있음)
      const nonOverlappingWalls = [
        { startX: 50, startY: 0, endX: 50, endY: 100, thickness: 15 }, // Y: 0~100 (겹치지 않음)
      ]

      const result = findNearestWallDistance(objectBounds, nonOverlappingWalls, 'left')

      expect(result).toBeNull()
    })

    it('X축이 겹치지 않는 벽은 상하 거리 계산에서 제외한다', () => {
      // 오브젝트 X: 200~300
      const objectBounds: ObjectBounds = {
        left: 200,
        right: 300,
        top: 150,
        bottom: 250,
      }

      // X축이 겹치지 않는 상단 벽 (오브젝트 왼쪽에 있음)
      const nonOverlappingWalls = [
        { startX: 0, startY: 50, endX: 100, endY: 50, thickness: 15 }, // X: 0~100 (겹치지 않음)
      ]

      const result = findNearestWallDistance(objectBounds, nonOverlappingWalls, 'top')

      expect(result).toBeNull()
    })

    it('여러 벽 중 가장 가까운 벽까지의 거리를 반환한다', () => {
      const objectBounds: ObjectBounds = {
        left: 200,
        right: 300,
        top: 150,
        bottom: 250,
      }

      // 좌측에 두 개의 벽
      const multipleWalls = [
        { startX: 50, startY: 50, endX: 50, endY: 400, thickness: 15 }, // 먼 벽
        { startX: 150, startY: 50, endX: 150, endY: 400, thickness: 15 }, // 가까운 벽
      ]

      const result = findNearestWallDistance(objectBounds, multipleWalls, 'left')

      // 가까운 벽(x=150)의 오른쪽 경계는 150 + 7.5 = 157.5
      // 오브젝트 좌측 200 - 벽 오른쪽 157.5 = 42.5
      expect(result!.distance).toBeCloseTo(42.5, 1)
      expect(result!.wallEdge).toBeCloseTo(157.5, 1)
    })
  })

  describe('findNearestBoundaryDistance - 방 경계까지 거리', () => {
    // 방 크기: 400 x 300 (cm)
    const roomBoundary: RoomBoundary = {
      left: 0,
      top: 0,
      width: 400,
      height: 300,
    }

    it('오브젝트에서 왼쪽 방 경계까지 거리를 계산한다', () => {
      const objectBounds: ObjectBounds = {
        left: 100,
        right: 200,
        top: 100,
        bottom: 200,
      }

      const result = findNearestBoundaryDistance(objectBounds, roomBoundary, 'left')

      // 오브젝트 좌측 100 - 방 좌측 경계 0 = 100
      expect(result.distance).toBe(100)
      expect(result.wallEdge).toBe(0)
    })

    it('오브젝트에서 오른쪽 방 경계까지 거리를 계산한다', () => {
      const objectBounds: ObjectBounds = {
        left: 100,
        right: 200,
        top: 100,
        bottom: 200,
      }

      const result = findNearestBoundaryDistance(objectBounds, roomBoundary, 'right')

      // 방 우측 경계 400 - 오브젝트 우측 200 = 200
      expect(result.distance).toBe(200)
      expect(result.wallEdge).toBe(400)
    })

    it('오브젝트에서 상단 방 경계까지 거리를 계산한다', () => {
      const objectBounds: ObjectBounds = {
        left: 100,
        right: 200,
        top: 100,
        bottom: 200,
      }

      const result = findNearestBoundaryDistance(objectBounds, roomBoundary, 'top')

      // 오브젝트 상단 100 - 방 상단 경계 0 = 100
      expect(result.distance).toBe(100)
      expect(result.wallEdge).toBe(0)
    })

    it('오브젝트에서 하단 방 경계까지 거리를 계산한다', () => {
      const objectBounds: ObjectBounds = {
        left: 100,
        right: 200,
        top: 100,
        bottom: 200,
      }

      const result = findNearestBoundaryDistance(objectBounds, roomBoundary, 'bottom')

      // 방 하단 경계 300 - 오브젝트 하단 200 = 100
      expect(result.distance).toBe(100)
      expect(result.wallEdge).toBe(300)
    })

    it('벽이 있으면 벽과 방 경계 중 더 가까운 것을 선택한다', () => {
      const objectBounds: ObjectBounds = {
        left: 150,
        right: 250,
        top: 100,
        bottom: 200,
      }

      // 좌측에 벽이 있음 (x=100 위치)
      const walls = [{ startX: 100, startY: 0, endX: 100, endY: 300, thickness: 10 }]

      // 방 경계까지: 150 - 0 = 150
      // 벽까지: 150 - 105 = 45 (벽 오른쪽 경계 = 100 + 5 = 105)
      const boundaryResult = findNearestBoundaryDistance(objectBounds, roomBoundary, 'left')
      const wallResult = findNearestWallDistance(objectBounds, walls, 'left')

      expect(boundaryResult.distance).toBe(150)
      expect(wallResult!.distance).toBeCloseTo(45, 1)
      // 벽이 더 가까움
      expect(wallResult!.distance).toBeLessThan(boundaryResult.distance)
    })
  })
})
