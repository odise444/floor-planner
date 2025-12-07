import { describe, test, expect } from 'vitest'
import {
  createWall,
  createWallFromDrag,
  snapToAngle,
  snapToGrid,
  snapToExistingWall,
  getWallLength,
  getWallAngle,
  getWallRenderRect,
  areWallsCollinear,
  joinWalls,
  wallsToPolygon,
  findConnectedWallChains,
  DEFAULT_WALL_THICKNESS,
  MIN_WALL_LENGTH,
  GRID_SIZE,
  SNAP_DISTANCE,
  type Wall,
  type WallPolygon,
} from '~/utils/wall'

describe('Wall 유틸리티', () => {
  describe('createWall', () => {
    test('시작점과 끝점으로 벽체 생성', () => {
      const wall = createWall(0, 0, 100, 0)
      expect(wall).toBeDefined()
      expect(wall.startX).toBe(0)
      expect(wall.startY).toBe(0)
      expect(wall.endX).toBe(100)
      expect(wall.endY).toBe(0)
      expect(wall.id).toBeDefined()
    })

    test('기본 두께 15cm 적용', () => {
      const wall = createWall(0, 0, 100, 0)
      expect(wall.thickness).toBe(DEFAULT_WALL_THICKNESS)
      expect(wall.thickness).toBe(15)
    })

    test('외벽으로 벽체 생성', () => {
      const wall = createWall(0, 0, 100, 0, { isExterior: true })
      expect(wall.isExterior).toBe(true)
    })

    test('커스텀 두께로 벽체 생성', () => {
      const wall = createWall(0, 0, 100, 0, { thickness: 20 })
      expect(wall.thickness).toBe(20)
    })
  })

  describe('createWallFromDrag', () => {
    test('드래그 좌표로 벽체 생성', () => {
      const wall = createWallFromDrag(0, 0, 100, 50, 2) // scale = 2
      expect(wall).not.toBeNull()
      expect(wall!.startX).toBe(0)
      expect(wall!.startY).toBe(0)
      expect(wall!.endX).toBe(50) // 100px / 2 = 50cm
      expect(wall!.endY).toBe(25) // 50px / 2 = 25cm
    })

    test('최소 길이 미만 시 null 반환', () => {
      const wall = createWallFromDrag(0, 0, 5, 5, 2) // 너무 짧음
      expect(wall).toBeNull()
    })

    test('그리드 스냅 적용', () => {
      const wall = createWallFromDrag(0, 0, 103, 0, 1, { snapToGrid: true })
      expect(wall).not.toBeNull()
      // 103cm -> 100cm (GRID_SIZE=10 단위로 스냅)
      expect(wall!.endX).toBe(100)
    })
  })

  describe('snapToAngle', () => {
    test('수평 각도 스냅 (0°)', () => {
      // 거의 수평인 경우 (5도 이내)
      const result = snapToAngle(0, 0, 100, 5)
      expect(result.endY).toBe(0)
      expect(result.endX).toBeCloseTo(100, 0)
    })

    test('수직 각도 스냅 (90°)', () => {
      // 거의 수직인 경우
      const result = snapToAngle(0, 0, 5, 100)
      expect(result.endX).toBeCloseTo(0, 5) // 부동소수점 오차 허용
      expect(result.endY).toBeCloseTo(100, 0)
    })

    test('45° 각도 스냅', () => {
      // 거의 45도인 경우
      const result = snapToAngle(0, 0, 100, 95)
      expect(result.endX).toBeCloseTo(result.endY, 0)
    })

    test('스냅 없이 자유 각도', () => {
      // 스냅 임계값을 벗어난 경우
      const result = snapToAngle(0, 0, 100, 50, false)
      expect(result.endX).toBe(100)
      expect(result.endY).toBe(50)
    })
  })

  describe('snapToGrid', () => {
    test('그리드 단위로 스냅', () => {
      expect(snapToGrid(13)).toBe(10)
      expect(snapToGrid(17)).toBe(20)
      expect(snapToGrid(25)).toBe(30)
    })

    test('커스텀 그리드 크기', () => {
      expect(snapToGrid(13, 5)).toBe(15)
      expect(snapToGrid(12, 5)).toBe(10)
    })
  })

  describe('snapToExistingWall', () => {
    const existingWalls: Wall[] = [
      createWall(0, 0, 100, 0),
      createWall(100, 0, 100, 100),
    ]

    test('기존 벽체 끝점에 스냅', () => {
      // (100, 0) 근처에서 스냅
      const result = snapToExistingWall(98, 2, existingWalls)
      expect(result.x).toBe(100)
      expect(result.y).toBe(0)
      expect(result.snapped).toBe(true)
    })

    test('스냅 거리 초과 시 원래 좌표 반환', () => {
      const result = snapToExistingWall(50, 50, existingWalls)
      expect(result.x).toBe(50)
      expect(result.y).toBe(50)
      expect(result.snapped).toBe(false)
    })
  })

  describe('getWallLength', () => {
    test('수평 벽체 길이 계산', () => {
      const wall = createWall(0, 0, 100, 0)
      expect(getWallLength(wall)).toBe(100)
    })

    test('수직 벽체 길이 계산', () => {
      const wall = createWall(0, 0, 0, 100)
      expect(getWallLength(wall)).toBe(100)
    })

    test('대각선 벽체 길이 계산', () => {
      const wall = createWall(0, 0, 30, 40)
      expect(getWallLength(wall)).toBe(50) // 3-4-5 삼각형
    })
  })

  describe('getWallAngle', () => {
    test('수평 벽체 각도 (0 라디안)', () => {
      const wall = createWall(0, 0, 100, 0)
      expect(getWallAngle(wall)).toBe(0)
    })

    test('수직 벽체 각도 (π/2 라디안)', () => {
      const wall = createWall(0, 0, 0, 100)
      expect(getWallAngle(wall)).toBeCloseTo(Math.PI / 2)
    })

    test('45도 벽체 각도 (π/4 라디안)', () => {
      const wall = createWall(0, 0, 100, 100)
      expect(getWallAngle(wall)).toBeCloseTo(Math.PI / 4)
    })
  })

  describe('getWallRenderRect', () => {
    test('수평 벽체 렌더링 사각형 계산', () => {
      const wall = createWall(0, 0, 100, 0, { thickness: 10 })
      const rect = getWallRenderRect(wall, 2) // scale = 2

      expect(rect.x).toBe(0)
      expect(rect.y).toBe(-10) // 두께의 절반만큼 위로 (10cm / 2 * 2px = 10px)
      expect(rect.width).toBe(200) // 100cm * 2px = 200px
      expect(rect.height).toBe(20) // 10cm * 2px = 20px
      expect(rect.rotation).toBe(0)
    })

    test('수직 벽체 렌더링 사각형 계산', () => {
      const wall = createWall(0, 0, 0, 100, { thickness: 10 })
      const rect = getWallRenderRect(wall, 2)

      expect(rect.rotation).toBeCloseTo(90)
    })
  })

  describe('areWallsCollinear - 동일 선상 여부 확인', () => {
    test('수평으로 평행하고 동일 선상인 두 벽체', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const wall2 = createWall(100, 0, 200, 0)
      expect(areWallsCollinear(wall1, wall2)).toBe(true)
    })

    test('수직으로 평행하고 동일 선상인 두 벽체', () => {
      const wall1 = createWall(0, 0, 0, 100)
      const wall2 = createWall(0, 100, 0, 200)
      expect(areWallsCollinear(wall1, wall2)).toBe(true)
    })

    test('45도 대각선으로 동일 선상인 두 벽체', () => {
      const wall1 = createWall(0, 0, 100, 100)
      const wall2 = createWall(100, 100, 200, 200)
      expect(areWallsCollinear(wall1, wall2)).toBe(true)
    })

    test('평행하지만 동일 선상이 아닌 두 벽체 (평행 이동)', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const wall2 = createWall(0, 50, 100, 50) // 50cm 아래에 평행
      expect(areWallsCollinear(wall1, wall2)).toBe(false)
    })

    test('직각으로 만나는 L자 형태의 두 벽체', () => {
      const wall1 = createWall(0, 0, 100, 0) // 수평
      const wall2 = createWall(100, 0, 100, 100) // 수직
      expect(areWallsCollinear(wall1, wall2)).toBe(false)
    })

    test('허용 오차 범위 내의 벽체는 동일 선상으로 인식', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const wall2 = createWall(100, 3, 200, 3) // 3cm 오차 (허용 범위 내)
      expect(areWallsCollinear(wall1, wall2, 5)).toBe(true)
    })

    test('허용 오차 범위 밖의 벽체는 동일 선상 아님', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const wall2 = createWall(100, 10, 200, 10) // 10cm 오차 (허용 범위 밖)
      expect(areWallsCollinear(wall1, wall2, 5)).toBe(false)
    })
  })

  describe('joinWalls - 벽체 결합', () => {
    test('수평으로 연결된 두 벽체를 하나로 결합', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const wall2 = createWall(100, 0, 200, 0)
      const result = joinWalls(wall1, [wall2])

      expect(result.joinedWall).not.toBeNull()
      expect(result.joinedWall!.startX).toBe(0)
      expect(result.joinedWall!.startY).toBe(0)
      expect(result.joinedWall!.endX).toBe(200)
      expect(result.joinedWall!.endY).toBe(0)
      expect(result.removedWallIds).toContain(wall2.id)
    })

    test('수직으로 연결된 두 벽체를 하나로 결합', () => {
      const wall1 = createWall(0, 0, 0, 100)
      const wall2 = createWall(0, 100, 0, 200)
      const result = joinWalls(wall1, [wall2])

      expect(result.joinedWall).not.toBeNull()
      expect(result.joinedWall!.startX).toBe(0)
      expect(result.joinedWall!.startY).toBe(0)
      expect(result.joinedWall!.endX).toBe(0)
      expect(result.joinedWall!.endY).toBe(200)
    })

    test('3개 이상의 연결된 벽체를 하나로 결합', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const wall2 = createWall(100, 0, 200, 0)
      const wall3 = createWall(200, 0, 300, 0)
      const result = joinWalls(wall1, [wall2, wall3])

      expect(result.joinedWall).not.toBeNull()
      expect(getWallLength(result.joinedWall!)).toBe(300)
      expect(result.removedWallIds).toHaveLength(2)
    })

    test('동일 선상이 아닌 벽체는 결합 불가', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const wall2 = createWall(100, 0, 100, 100) // L자 형태
      const result = joinWalls(wall1, [wall2])

      expect(result.joinedWall).toBeNull()
      expect(result.removedWallIds).toHaveLength(0)
      expect(result.notJoinableIds).toContain(wall2.id)
    })

    test('결합된 벽체는 기준 벽체의 속성을 유지', () => {
      const wall1 = createWall(0, 0, 100, 0, { thickness: 20, isExterior: true })
      const wall2 = createWall(100, 0, 200, 0, { thickness: 15, isExterior: false })
      const result = joinWalls(wall1, [wall2])

      expect(result.joinedWall!.thickness).toBe(20)
      expect(result.joinedWall!.isExterior).toBe(true)
      expect(result.joinedWall!.id).toBe(wall1.id)
    })

    test('역방향 벽체도 올바르게 결합', () => {
      const wall1 = createWall(100, 0, 200, 0) // 오른쪽에서 시작
      const wall2 = createWall(100, 0, 0, 0) // 왼쪽으로 향함 (역방향)
      const result = joinWalls(wall1, [wall2])

      expect(result.joinedWall).not.toBeNull()
      expect(getWallLength(result.joinedWall!)).toBe(200)
    })

    test('떨어져 있지만 동일 선상인 벽체도 결합 가능', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const wall2 = createWall(150, 0, 250, 0) // 50cm 떨어짐
      const result = joinWalls(wall1, [wall2])

      expect(result.joinedWall).not.toBeNull()
      // 가장 먼 두 점으로 결합: 0~250
      expect(result.joinedWall!.startX).toBe(0)
      expect(result.joinedWall!.endX).toBe(250)
    })

    test('빈 배열 전달 시 null 반환', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const result = joinWalls(wall1, [])

      expect(result.joinedWall).toBeNull()
      expect(result.removedWallIds).toHaveLength(0)
    })

    test('checkCollinear: false 옵션으로 L자 형태도 결합 가능', () => {
      const wall1 = createWall(0, 0, 100, 0) // 수평
      const wall2 = createWall(100, 0, 100, 100) // 수직 (L자 형태)
      const result = joinWalls(wall1, [wall2], { checkCollinear: false })

      expect(result.joinedWall).not.toBeNull()
      expect(result.removedWallIds).toContain(wall2.id)
      // 가장 먼 두 점: (0,0) ~ (100,100)
      expect(getWallLength(result.joinedWall!)).toBeCloseTo(Math.sqrt(100 * 100 + 100 * 100))
    })

    test('checkCollinear: false 옵션으로 비평행 벽체들도 결합', () => {
      const wall1 = createWall(0, 0, 50, 0)
      const wall2 = createWall(50, 0, 100, 50)
      const wall3 = createWall(100, 50, 100, 100)
      const result = joinWalls(wall1, [wall2, wall3], { checkCollinear: false })

      expect(result.joinedWall).not.toBeNull()
      expect(result.removedWallIds).toHaveLength(2)
    })
  })

  describe('findConnectedWallChains - 연결된 벽체 체인 찾기', () => {
    test('연결된 벽체들을 하나의 체인으로 그룹화', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const wall2 = createWall(100, 0, 100, 100)
      const wall3 = createWall(100, 100, 0, 100)
      const wall4 = createWall(0, 100, 0, 0)
      const chains = findConnectedWallChains([wall1, wall2, wall3, wall4])

      expect(chains).toHaveLength(1)
      expect(chains[0]).toHaveLength(4)
    })

    test('분리된 벽체들은 별도의 체인으로 분리', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const wall2 = createWall(100, 0, 100, 100)
      const wall3 = createWall(200, 200, 300, 200) // 분리된 벽체
      const chains = findConnectedWallChains([wall1, wall2, wall3])

      expect(chains).toHaveLength(2)
    })

    test('빈 배열은 빈 체인 반환', () => {
      const chains = findConnectedWallChains([])
      expect(chains).toHaveLength(0)
    })

    test('단일 벽체는 하나의 체인', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const chains = findConnectedWallChains([wall1])

      expect(chains).toHaveLength(1)
      expect(chains[0]).toHaveLength(1)
    })

    test('허용 오차 내의 벽체는 연결된 것으로 인식', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const wall2 = createWall(102, 0, 102, 100) // 2cm 떨어짐
      const chains = findConnectedWallChains([wall1, wall2], 5)

      expect(chains).toHaveLength(1)
    })
  })

  describe('wallsToPolygon - 벽체를 폴리곤으로 변환', () => {
    test('사각형 형태의 벽체들을 폴리곤으로 변환', () => {
      const wall1 = createWall(0, 0, 100, 0, { thickness: 10 })
      const wall2 = createWall(100, 0, 100, 100, { thickness: 10 })
      const wall3 = createWall(100, 100, 0, 100, { thickness: 10 })
      const wall4 = createWall(0, 100, 0, 0, { thickness: 10 })
      const polygon = wallsToPolygon([wall1, wall2, wall3, wall4])

      expect(polygon).not.toBeNull()
      expect(polygon!.outerPoints).toBeDefined()
      expect(polygon!.innerPoints).toBeDefined()
      expect(polygon!.outerPoints.length).toBeGreaterThan(0)
      expect(polygon!.innerPoints.length).toBeGreaterThan(0)
    })

    test('외곽선과 내곽선은 두께만큼 offset', () => {
      const wall1 = createWall(0, 0, 100, 0, { thickness: 10 })
      const wall2 = createWall(100, 0, 100, 100, { thickness: 10 })
      const wall3 = createWall(100, 100, 0, 100, { thickness: 10 })
      const wall4 = createWall(0, 100, 0, 0, { thickness: 10 })
      const polygon = wallsToPolygon([wall1, wall2, wall3, wall4])

      // 외곽선 점들
      const outerXs = polygon!.outerPoints.filter((_, i) => i % 2 === 0)
      const outerYs = polygon!.outerPoints.filter((_, i) => i % 2 === 1)
      const outerWidth = Math.max(...outerXs) - Math.min(...outerXs)
      const outerHeight = Math.max(...outerYs) - Math.min(...outerYs)

      // 내곽선 점들
      const innerXs = polygon!.innerPoints.filter((_, i) => i % 2 === 0)
      const innerYs = polygon!.innerPoints.filter((_, i) => i % 2 === 1)
      const innerWidth = Math.max(...innerXs) - Math.min(...innerXs)
      const innerHeight = Math.max(...innerYs) - Math.min(...innerYs)

      // 외곽선과 내곽선 크기 차이는 두께(10cm)
      expect(Math.abs(outerWidth - innerWidth)).toBeCloseTo(10, 0)
      expect(Math.abs(outerHeight - innerHeight)).toBeCloseTo(10, 0)
    })

    test('L자 형태 벽체도 폴리곤으로 변환', () => {
      const wall1 = createWall(0, 0, 100, 0, { thickness: 10 })
      const wall2 = createWall(100, 0, 100, 50, { thickness: 10 })
      const polygon = wallsToPolygon([wall1, wall2])

      expect(polygon).not.toBeNull()
      expect(polygon!.outerPoints.length).toBeGreaterThan(0)
    })

    test('닫히지 않은 벽체는 열린 폴리곤 반환', () => {
      const wall1 = createWall(0, 0, 100, 0, { thickness: 10 })
      const wall2 = createWall(100, 0, 100, 100, { thickness: 10 })
      const polygon = wallsToPolygon([wall1, wall2])

      expect(polygon).not.toBeNull()
      expect(polygon!.isClosed).toBe(false)
    })

    test('닫힌 벽체는 닫힌 폴리곤 반환', () => {
      const wall1 = createWall(0, 0, 100, 0, { thickness: 10 })
      const wall2 = createWall(100, 0, 100, 100, { thickness: 10 })
      const wall3 = createWall(100, 100, 0, 100, { thickness: 10 })
      const wall4 = createWall(0, 100, 0, 0, { thickness: 10 })
      const polygon = wallsToPolygon([wall1, wall2, wall3, wall4])

      expect(polygon).not.toBeNull()
      expect(polygon!.isClosed).toBe(true)
    })

    test('빈 배열은 null 반환', () => {
      const polygon = wallsToPolygon([])
      expect(polygon).toBeNull()
    })

    test('폴리곤에 원본 벽체 ID 목록 포함', () => {
      const wall1 = createWall(0, 0, 100, 0)
      const wall2 = createWall(100, 0, 100, 100)
      const polygon = wallsToPolygon([wall1, wall2])

      expect(polygon!.wallIds).toContain(wall1.id)
      expect(polygon!.wallIds).toContain(wall2.id)
    })

    test('폴리곤에 평균 두께 저장', () => {
      const wall1 = createWall(0, 0, 100, 0, { thickness: 10 })
      const wall2 = createWall(100, 0, 100, 100, { thickness: 20 })
      const polygon = wallsToPolygon([wall1, wall2])

      expect(polygon!.thickness).toBe(15) // 평균
    })
  })
})
