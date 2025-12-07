/**
 * 벽체(Wall) 유틸리티 함수
 */

// 상수
export const DEFAULT_WALL_THICKNESS = 15 // cm
export const MIN_WALL_LENGTH = 10 // cm
export const GRID_SIZE = 10 // cm
export const SNAP_DISTANCE = 10 // cm
export const ANGLE_SNAP_THRESHOLD = 10 // degrees

// 벽체 색상
export const WALL_COLORS = {
  exterior: '#4B5563', // 외벽: 진한 회색
  interior: '#9CA3AF', // 내벽: 연한 회색
  preview: '#3B82F6', // 미리보기: 파란색
}

// 벽체 인터페이스
export interface Wall {
  id: string
  startX: number // 시작점 X (cm)
  startY: number // 시작점 Y (cm)
  endX: number // 끝점 X (cm)
  endY: number // 끝점 Y (cm)
  thickness: number // 벽 두께 (cm)
  isExterior: boolean // 외벽 여부
  color: string // 벽체 색상
  zIndex: number // 레이어 순서
  roomId?: string // 연결된 방 ID (방 벽인 경우)
  side?: 'top' | 'bottom' | 'left' | 'right' // 방 벽 위치
}

// 벽체 생성 옵션
export interface CreateWallOptions {
  thickness?: number
  isExterior?: boolean
  color?: string
  zIndex?: number
  roomId?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

// 드래그 생성 옵션
export interface DragOptions {
  snapToGrid?: boolean
  snapAngle?: boolean
}

// 스냅 결과
export interface SnapResult {
  x: number
  y: number
  snapped: boolean
}

// 렌더링 사각형
export interface WallRenderRect {
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

/**
 * 고유 ID 생성
 */
function generateId(): string {
  return `wall-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 벽체 생성
 */
export function createWall(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: CreateWallOptions = {}
): Wall {
  const isExterior = options.isExterior ?? false

  return {
    id: generateId(),
    startX,
    startY,
    endX,
    endY,
    thickness: options.thickness ?? DEFAULT_WALL_THICKNESS,
    isExterior,
    color: options.color ?? (isExterior ? WALL_COLORS.exterior : WALL_COLORS.interior),
    zIndex: options.zIndex ?? 1,
    roomId: options.roomId,
    side: options.side,
  }
}

/**
 * 드래그 좌표로 벽체 생성 (픽셀 -> cm 변환)
 */
export function createWallFromDrag(
  startPx: number,
  startPy: number,
  endPx: number,
  endPy: number,
  scale: number,
  options: DragOptions = {}
): Wall | null {
  // 픽셀을 cm로 변환
  let startX = startPx / scale
  let startY = startPy / scale
  let endX = endPx / scale
  let endY = endPy / scale

  // 그리드 스냅 적용
  if (options.snapToGrid) {
    endX = snapToGrid(endX)
    endY = snapToGrid(endY)
  }

  // 길이 계산
  const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))

  // 최소 길이 검증
  if (length < MIN_WALL_LENGTH) {
    return null
  }

  return createWall(startX, startY, endX, endY)
}

/**
 * 각도 스냅 (0°, 45°, 90°, 135°, 180°, ...)
 */
export function snapToAngle(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  enableSnap: boolean = true
): { endX: number; endY: number } {
  if (!enableSnap) {
    return { endX, endY }
  }

  const dx = endX - startX
  const dy = endY - startY
  const length = Math.sqrt(dx * dx + dy * dy)

  if (length === 0) {
    return { endX, endY }
  }

  // 현재 각도 (라디안)
  const angle = Math.atan2(dy, dx)
  const angleDeg = (angle * 180) / Math.PI

  // 스냅 대상 각도 (0, 45, 90, 135, 180, -135, -90, -45)
  const snapAngles = [0, 45, 90, 135, 180, -135, -90, -45]

  for (const snapAngle of snapAngles) {
    const diff = Math.abs(angleDeg - snapAngle)
    if (diff <= ANGLE_SNAP_THRESHOLD || diff >= 360 - ANGLE_SNAP_THRESHOLD) {
      const snappedRad = (snapAngle * Math.PI) / 180
      return {
        endX: startX + length * Math.cos(snappedRad),
        endY: startY + length * Math.sin(snappedRad),
      }
    }
  }

  return { endX, endY }
}

/**
 * 그리드 스냅
 */
export function snapToGrid(value: number, gridSize: number = GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize
}

/**
 * 기존 벽체 끝점에 스냅
 */
export function snapToExistingWall(
  x: number,
  y: number,
  walls: Wall[],
  snapDistance: number = SNAP_DISTANCE
): SnapResult {
  let closestDist = Infinity
  let snapX = x
  let snapY = y
  let snapped = false

  for (const wall of walls) {
    // 시작점과의 거리
    const distStart = Math.sqrt(Math.pow(x - wall.startX, 2) + Math.pow(y - wall.startY, 2))
    if (distStart < snapDistance && distStart < closestDist) {
      closestDist = distStart
      snapX = wall.startX
      snapY = wall.startY
      snapped = true
    }

    // 끝점과의 거리
    const distEnd = Math.sqrt(Math.pow(x - wall.endX, 2) + Math.pow(y - wall.endY, 2))
    if (distEnd < snapDistance && distEnd < closestDist) {
      closestDist = distEnd
      snapX = wall.endX
      snapY = wall.endY
      snapped = true
    }
  }

  return { x: snapX, y: snapY, snapped }
}

/**
 * 벽체 길이 계산
 */
export function getWallLength(wall: Wall): number {
  const dx = wall.endX - wall.startX
  const dy = wall.endY - wall.startY
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 벽체 각도 계산 (라디안)
 */
export function getWallAngle(wall: Wall): number {
  const dx = wall.endX - wall.startX
  const dy = wall.endY - wall.startY
  return Math.atan2(dy, dx)
}

/**
 * 벽체 렌더링 사각형 계산
 * - 벽체 두께를 포함한 렌더링용 사각형 반환
 * - Konva Rect에 사용할 좌표, 크기, 회전 값
 */
export function getWallRenderRect(wall: Wall, scale: number): WallRenderRect {
  const length = getWallLength(wall)
  const angle = getWallAngle(wall)
  const angleDeg = (angle * 180) / Math.PI

  // 픽셀 단위로 변환
  const lengthPx = length * scale
  const thicknessPx = wall.thickness * scale

  // 시작점 기준으로 두께의 절반만큼 오프셋
  const halfThickness = thicknessPx / 2
  const offsetX = -halfThickness * Math.sin(angle)
  const offsetY = halfThickness * Math.cos(angle)

  return {
    x: wall.startX * scale + offsetX,
    y: wall.startY * scale - offsetY,
    width: lengthPx,
    height: thicknessPx,
    rotation: angleDeg,
  }
}

/**
 * 벽체 중심점 계산
 */
export function getWallCenter(wall: Wall): { x: number; y: number } {
  return {
    x: (wall.startX + wall.endX) / 2,
    y: (wall.startY + wall.endY) / 2,
  }
}

/**
 * 벽체 이동
 */
export function moveWall(wall: Wall, dx: number, dy: number): Wall {
  return {
    ...wall,
    startX: wall.startX + dx,
    startY: wall.startY + dy,
    endX: wall.endX + dx,
    endY: wall.endY + dy,
  }
}

/**
 * 벽체 끝점 이동
 */
export function moveWallEndpoint(
  wall: Wall,
  endpoint: 'start' | 'end',
  x: number,
  y: number
): Wall {
  if (endpoint === 'start') {
    return { ...wall, startX: x, startY: y }
  } else {
    return { ...wall, endX: x, endY: y }
  }
}

/**
 * 벽체 두께 변경
 */
export function updateWallThickness(wall: Wall, thickness: number): Wall {
  if (thickness <= 0) {
    throw new Error('벽체 두께는 0보다 커야 합니다.')
  }
  return { ...wall, thickness }
}

/**
 * 벽체 색상 업데이트 (외벽/내벽 전환)
 */
export function toggleWallExterior(wall: Wall): Wall {
  const isExterior = !wall.isExterior
  return {
    ...wall,
    isExterior,
    color: isExterior ? WALL_COLORS.exterior : WALL_COLORS.interior,
  }
}

/**
 * 두 벽체가 동일 선상(collinear)인지 확인
 * - 평행하고 동일한 직선 위에 있는지 확인
 */
export function areWallsCollinear(wall1: Wall, wall2: Wall, tolerance: number = 5): boolean {
  // 벽체1의 방향 벡터
  const dx1 = wall1.endX - wall1.startX
  const dy1 = wall1.endY - wall1.startY
  const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
  if (len1 === 0) return false

  // 벽체2의 방향 벡터
  const dx2 = wall2.endX - wall2.startX
  const dy2 = wall2.endY - wall2.startY
  const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
  if (len2 === 0) return false

  // 정규화된 방향 벡터
  const nx1 = dx1 / len1
  const ny1 = dy1 / len1
  const nx2 = dx2 / len2
  const ny2 = dy2 / len2

  // 두 벽체가 평행한지 확인 (외적이 0에 가까운지)
  // 같은 방향이거나 반대 방향이면 평행
  const cross = Math.abs(nx1 * ny2 - ny1 * nx2)
  if (cross > 0.1) return false // 평행하지 않음

  // 벽체2의 시작점이 벽체1의 직선 위에 있는지 확인 (점과 직선 사이 거리)
  const pointToLineDistance = (px: number, py: number, lx1: number, ly1: number, lx2: number, ly2: number) => {
    const A = py - ly1
    const B = lx2 - lx1
    const C = px - lx1
    const D = ly2 - ly1
    const dot = A * B - C * D
    const lenSq = B * B + D * D
    if (lenSq === 0) return Math.sqrt((px - lx1) ** 2 + (py - ly1) ** 2)
    return Math.abs(dot) / Math.sqrt(lenSq)
  }

  // 벽체2의 시작점과 끝점 모두 확인
  const dist1 = pointToLineDistance(wall2.startX, wall2.startY, wall1.startX, wall1.startY, wall1.endX, wall1.endY)
  const dist2 = pointToLineDistance(wall2.endX, wall2.endY, wall1.startX, wall1.startY, wall1.endX, wall1.endY)

  return dist1 <= tolerance && dist2 <= tolerance
}

/**
 * 벽체 결합 결과
 */
export interface JoinWallsResult {
  joinedWall: Wall | null
  removedWallIds: string[]
  notJoinableIds: string[]
}

/**
 * 벽체 결합 옵션
 */
export interface JoinWallsOptions {
  /** 동일 선상 체크 여부 (기본: true) */
  checkCollinear?: boolean
}

/**
 * 벽체 결합 (Join) - CAD 스타일로 벽체들을 하나로 합침
 * @param baseWall 기준 벽체 (결합된 벽체의 속성을 결정)
 * @param wallsToJoin 결합할 벽체들
 * @param options 결합 옵션
 * @returns 결합 결과 (결합된 벽체, 제거된 벽체 ID, 결합 불가능한 벽체 ID)
 */
export function joinWalls(baseWall: Wall, wallsToJoin: Wall[], options: JoinWallsOptions = {}): JoinWallsResult {
  const { checkCollinear = true } = options

  if (wallsToJoin.length === 0) {
    return { joinedWall: null, removedWallIds: [], notJoinableIds: [] }
  }

  const wallsToMerge: Wall[] = [baseWall]
  const notJoinableIds: string[] = []

  // 동일 선상 체크 여부에 따라 필터링
  for (const wall of wallsToJoin) {
    if (!checkCollinear || areWallsCollinear(baseWall, wall)) {
      wallsToMerge.push(wall)
    } else {
      notJoinableIds.push(wall.id)
    }
  }

  // 결합할 벽체가 없으면 결합 불가
  if (wallsToMerge.length < 2) {
    return { joinedWall: null, removedWallIds: [], notJoinableIds }
  }

  // 모든 끝점 수집
  const allPoints: Array<{ x: number; y: number }> = []
  for (const wall of wallsToMerge) {
    allPoints.push({ x: wall.startX, y: wall.startY })
    allPoints.push({ x: wall.endX, y: wall.endY })
  }

  // 가장 먼 두 점 찾기 (결합된 벽체의 양 끝점)
  let maxDist = 0
  let point1 = allPoints[0]!
  let point2 = allPoints[1]!

  for (let i = 0; i < allPoints.length; i++) {
    for (let j = i + 1; j < allPoints.length; j++) {
      const p1 = allPoints[i]!
      const p2 = allPoints[j]!
      const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
      if (dist > maxDist) {
        maxDist = dist
        point1 = p1
        point2 = p2
      }
    }
  }

  // 결합된 벽체 생성 (기준 벽체의 속성 유지)
  const joinedWall: Wall = {
    ...baseWall,
    startX: point1.x,
    startY: point1.y,
    endX: point2.x,
    endY: point2.y,
  }

  // 제거할 벽체 ID (기준 벽체 제외)
  const removedWallIds = wallsToMerge
    .filter((w) => w.id !== baseWall.id)
    .map((w) => w.id)

  return { joinedWall, removedWallIds, notJoinableIds }
}

/**
 * 벽체 폴리곤 인터페이스
 */
export interface WallPolygon {
  id: string
  outerPoints: number[] // [x1, y1, x2, y2, ...] 외곽선
  innerPoints: number[] // [x1, y1, x2, y2, ...] 내곽선
  wallIds: string[] // 원본 벽체 ID 목록
  thickness: number // 평균 두께
  isClosed: boolean // 닫힌 폴리곤 여부
  color: string // 색상
}

/**
 * 두 점 사이 거리 계산
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

/**
 * 벽체 끝점이 연결되어 있는지 확인
 */
function areWallsConnected(wall1: Wall, wall2: Wall, tolerance: number = SNAP_DISTANCE): boolean {
  // wall1의 끝점과 wall2의 시작점/끝점 비교
  const d1 = distance(wall1.endX, wall1.endY, wall2.startX, wall2.startY)
  const d2 = distance(wall1.endX, wall1.endY, wall2.endX, wall2.endY)
  const d3 = distance(wall1.startX, wall1.startY, wall2.startX, wall2.startY)
  const d4 = distance(wall1.startX, wall1.startY, wall2.endX, wall2.endY)

  return Math.min(d1, d2, d3, d4) <= tolerance
}

/**
 * 연결된 벽체 체인 찾기 (Union-Find 알고리즘 사용)
 */
export function findConnectedWallChains(walls: Wall[], tolerance: number = SNAP_DISTANCE): Wall[][] {
  if (walls.length === 0) return []

  const visited = new Set<string>()
  const chains: Wall[][] = []

  function dfs(wall: Wall, chain: Wall[]) {
    if (visited.has(wall.id)) return
    visited.add(wall.id)
    chain.push(wall)

    for (const other of walls) {
      if (!visited.has(other.id) && areWallsConnected(wall, other, tolerance)) {
        dfs(other, chain)
      }
    }
  }

  for (const wall of walls) {
    if (!visited.has(wall.id)) {
      const chain: Wall[] = []
      dfs(wall, chain)
      if (chain.length > 0) {
        chains.push(chain)
      }
    }
  }

  return chains
}

/**
 * 벽체 체인을 순서대로 정렬 (시작점-끝점 연결)
 */
function orderWallChain(walls: Wall[], tolerance: number = SNAP_DISTANCE): Wall[] {
  if (walls.length <= 1) return walls

  const ordered: Wall[] = []
  const remaining = [...walls]

  // 첫 번째 벽체 선택
  ordered.push(remaining.shift()!)

  while (remaining.length > 0) {
    const lastWall = ordered[ordered.length - 1]!
    let foundNext = false

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i]!

      // lastWall의 끝점과 candidate의 시작점이 연결되는지
      if (distance(lastWall.endX, lastWall.endY, candidate.startX, candidate.startY) <= tolerance) {
        ordered.push(candidate)
        remaining.splice(i, 1)
        foundNext = true
        break
      }
      // lastWall의 끝점과 candidate의 끝점이 연결되면 candidate를 뒤집어야 함
      if (distance(lastWall.endX, lastWall.endY, candidate.endX, candidate.endY) <= tolerance) {
        // 벽체 방향 반전
        const reversed: Wall = {
          ...candidate,
          startX: candidate.endX,
          startY: candidate.endY,
          endX: candidate.startX,
          endY: candidate.startY,
        }
        ordered.push(reversed)
        remaining.splice(i, 1)
        foundNext = true
        break
      }
    }

    // 연결 못 찾으면 첫 번째 벽체 앞에서도 검색
    if (!foundNext && ordered.length > 0) {
      const firstWall = ordered[0]!
      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i]!

        if (distance(firstWall.startX, firstWall.startY, candidate.endX, candidate.endY) <= tolerance) {
          ordered.unshift(candidate)
          remaining.splice(i, 1)
          foundNext = true
          break
        }
        if (distance(firstWall.startX, firstWall.startY, candidate.startX, candidate.startY) <= tolerance) {
          const reversed: Wall = {
            ...candidate,
            startX: candidate.endX,
            startY: candidate.endY,
            endX: candidate.startX,
            endY: candidate.startY,
          }
          ordered.unshift(reversed)
          remaining.splice(i, 1)
          foundNext = true
          break
        }
      }
    }

    if (!foundNext) {
      // 연결 안 되는 벽체는 그냥 추가
      ordered.push(remaining.shift()!)
    }
  }

  return ordered
}

/**
 * 벽체의 법선 벡터 계산 (왼쪽 방향)
 */
function getWallNormal(wall: Wall): { nx: number; ny: number } {
  const dx = wall.endX - wall.startX
  const dy = wall.endY - wall.startY
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return { nx: 0, ny: -1 }

  // 90도 회전 (왼쪽 방향이 바깥쪽)
  return {
    nx: -dy / len,
    ny: dx / len,
  }
}

/**
 * 벽체들을 폴리곤으로 변환
 * - 외곽선: 벽 두께/2 만큼 바깥으로 offset
 * - 내곽선: 벽 두께/2 만큼 안쪽으로 offset
 */
export function wallsToPolygon(walls: Wall[]): WallPolygon | null {
  if (walls.length === 0) return null

  // 벽체 체인 정렬
  const orderedWalls = orderWallChain(walls)

  // 평균 두께 계산
  const avgThickness = orderedWalls.reduce((sum, w) => sum + w.thickness, 0) / orderedWalls.length

  // 닫힌 폴리곤인지 확인 (첫 벽체 시작점과 마지막 벽체 끝점이 연결되는지)
  const firstWall = orderedWalls[0]!
  const lastWall = orderedWalls[orderedWalls.length - 1]!
  const isClosed = distance(lastWall.endX, lastWall.endY, firstWall.startX, firstWall.startY) <= SNAP_DISTANCE

  // 중심선 점들 추출
  const centerPoints: Array<{ x: number; y: number }> = []
  for (const wall of orderedWalls) {
    centerPoints.push({ x: wall.startX, y: wall.startY })
  }
  // 마지막 벽체의 끝점 추가
  centerPoints.push({ x: lastWall.endX, y: lastWall.endY })

  // 외곽선/내곽선 계산
  const outerPoints: number[] = []
  const innerPoints: number[] = []
  const halfThickness = avgThickness / 2

  for (let i = 0; i < orderedWalls.length; i++) {
    const wall = orderedWalls[i]!
    const normal = getWallNormal(wall)

    // 시작점의 외곽/내곽 좌표
    const outerStartX = wall.startX + normal.nx * halfThickness
    const outerStartY = wall.startY + normal.ny * halfThickness
    const innerStartX = wall.startX - normal.nx * halfThickness
    const innerStartY = wall.startY - normal.ny * halfThickness

    outerPoints.push(outerStartX, outerStartY)
    innerPoints.push(innerStartX, innerStartY)
  }

  // 마지막 벽체의 끝점 추가
  const lastNormal = getWallNormal(lastWall)
  outerPoints.push(lastWall.endX + lastNormal.nx * halfThickness)
  outerPoints.push(lastWall.endY + lastNormal.ny * halfThickness)
  innerPoints.push(lastWall.endX - lastNormal.nx * halfThickness)
  innerPoints.push(lastWall.endY - lastNormal.ny * halfThickness)

  // 닫힌 폴리곤이면 내곽선을 뒤집어서 하나의 도형으로 만듦
  if (isClosed) {
    // 외곽선 닫기
    outerPoints.push(outerPoints[0]!, outerPoints[1]!)
    // 내곽선도 닫기
    innerPoints.push(innerPoints[0]!, innerPoints[1]!)
  }

  return {
    id: `polygon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    outerPoints,
    innerPoints,
    wallIds: orderedWalls.map((w) => w.id),
    thickness: avgThickness,
    isClosed,
    color: orderedWalls[0]?.color ?? WALL_COLORS.interior,
  }
}
