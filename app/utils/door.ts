export interface Room {
  x: number
  y: number
  width: number
  height: number
}

export type WallType = 'top' | 'bottom' | 'left' | 'right'

export interface SnapResult {
  wall: WallType
  x: number
  y: number
}

/**
 * 주어진 좌표에서 가장 가까운 벽을 찾아 문 위치를 스냅
 */
export function snapDoorToWall(
  worldX: number,
  worldY: number,
  doorWidthPx: number,
  room: Room,
  scale: number
): SnapResult {
  // 각 벽까지의 거리 계산
  const distTop = Math.abs(worldY - room.y)
  const distBottom = Math.abs(worldY - (room.y + room.height))
  const distLeft = Math.abs(worldX - room.x)
  const distRight = Math.abs(worldX - (room.x + room.width))

  const minDist = Math.min(distTop, distBottom, distLeft, distRight)

  if (minDist === distTop) {
    const posX = Math.max(0, Math.min((room.width - doorWidthPx) / scale, (worldX - room.x) / scale))
    return { wall: 'top', x: posX, y: 0 }
  } else if (minDist === distBottom) {
    const posX = Math.max(0, Math.min((room.width - doorWidthPx) / scale, (worldX - room.x) / scale))
    return { wall: 'bottom', x: posX, y: 0 }
  } else if (minDist === distLeft) {
    const posY = Math.max(0, Math.min((room.height - doorWidthPx) / scale, (worldY - room.y) / scale))
    return { wall: 'left', x: 0, y: posY }
  } else {
    const posY = Math.max(0, Math.min((room.height - doorWidthPx) / scale, (worldY - room.y) / scale))
    return { wall: 'right', x: 0, y: posY }
  }
}

/**
 * 문의 그룹 위치 계산 (캔버스 좌표)
 */
export function getDoorGroupPosition(
  doorX: number,
  doorY: number,
  wall: WallType,
  room: Room,
  scale: number
): { x: number; y: number } {
  let x = 0
  let y = 0

  switch (wall) {
    case 'top':
      x = room.x + doorX * scale
      y = room.y - 5
      break
    case 'bottom':
      x = room.x + doorX * scale
      y = room.y + room.height - 5
      break
    case 'left':
      x = room.x - 5
      y = room.y + doorY * scale
      break
    case 'right':
      x = room.x + room.width - 5
      y = room.y + doorY * scale
      break
  }

  return { x, y }
}

export type OpenDirection = 'inside' | 'outside'
export type HingeSide = 'left' | 'right'

/**
 * 문 열림 호(arc) 회전 각도 계산
 * 호는 항상 문이 열리는 방향(방 내부/외부)으로 그려짐
 *
 * Konva Arc: rotation에서 시작하여 반시계방향으로 angle도 그림
 * rotation=0: 오른쪽(+x), 90: 아래(+y), 180: 왼쪽(-x), -90(270): 위(-y)
 */
export function getDoorArcRotation(
  wall: WallType,
  openDirection: OpenDirection,
  hingeSide: HingeSide
): number {
  const isInside = openDirection === 'inside'
  const isLeftHinge = hingeSide === 'left'

  let rotation = 0

  switch (wall) {
    case 'top':
      if (isInside) {
        rotation = isLeftHinge ? 0 : 90
      } else {
        rotation = isLeftHinge ? 180 : -90
      }
      break

    case 'bottom':
      if (isInside) {
        rotation = isLeftHinge ? 180 : 90
      } else {
        rotation = isLeftHinge ? 0 : -90
      }
      break

    case 'left':
      if (isInside) {
        rotation = isLeftHinge ? 0 : 90
      } else {
        rotation = isLeftHinge ? 180 : -90
      }
      break

    case 'right':
      if (isInside) {
        rotation = isLeftHinge ? 180 : 90
      } else {
        rotation = isLeftHinge ? 0 : -90
      }
      break
  }

  return rotation
}

export interface DoorArcConfig {
  x: number        // 경첩 x 위치 (그룹 내 로컬 좌표)
  y: number        // 경첩 y 위치 (그룹 내 로컬 좌표)
  rotation: number // 호 시작 각도
}

/**
 * 문 열림 호(arc) 설정 계산
 * - x, y: 경첩 위치 (호의 중심점)
 * - rotation: 호가 그려지는 시작 각도
 *
 * 가로 벽(top/bottom): 경첩은 hingeSide에 따라 좌/우 끝에 위치
 * 세로 벽(left/right): 경첩은 hingeSide에 따라 상/하 끝에 위치
 */
export function getDoorArcConfig(
  wall: WallType,
  openDirection: OpenDirection,
  hingeSide: HingeSide,
  doorWidthPx: number
): DoorArcConfig {
  const isInside = openDirection === 'inside'
  const isLeftHinge = hingeSide === 'left'

  let x = 0
  let y = 0
  let rotation = 0

  // Konva Arc: rotation에서 시작하여 반시계방향으로 angle도 그림
  // rotation=0: 오른쪽(+x), 90: 아래(+y), 180: 왼쪽(-x), -90(270): 위(-y)
  //
  // 문 열림 규칙:
  // - 경첩 위치에서 호 중심이 시작
  // - inside: 방 안쪽으로 호가 그려짐
  // - outside: 방 바깥쪽으로 호가 그려짐
  // - left/right hinge: 가로벽은 좌/우, 세로벽은 위/아래

  switch (wall) {
    case 'top':
      // 가로 벽: 경첩 x는 좌/우 끝
      x = isLeftHinge ? 0 : doorWidthPx
      y = isInside ? 10 : 0  // inside면 아래(방 안)로 오프셋
      if (isInside) {
        // 방 안(아래)으로 열림
        rotation = isLeftHinge ? 0 : 90
      } else {
        // 방 밖(위)으로 열림 - 호가 위(-y) 방향으로 그려져야 함
        // 왼쪽 경첩: -90도(위)에서 시작 → 0도(오른쪽)까지
        // 오른쪽 경첩: 180도(왼쪽)에서 시작 → 270도(-90, 위)까지
        rotation = isLeftHinge ? -90 : 180
      }
      break

    case 'bottom':
      // 가로 벽: 경첩 x는 좌/우 끝
      x = isLeftHinge ? 0 : doorWidthPx
      y = isInside ? 0 : 10  // inside면 위(방 안)로
      if (isInside) {
        // 방 안(위)으로 열림
        // 왼쪽 경첩: -90도(위)에서 시작 → 0도(오른쪽)까지
        // 오른쪽 경첩: 180도(왼쪽)에서 시작 → 270도(-90도, 위)까지
        rotation = isLeftHinge ? -90 : 180
      } else {
        // 방 밖(아래)으로 열림 - 호가 문 프레임(y=10) 아래에서 그려져야 함
        // 왼쪽 경첩: 0도(오른쪽)에서 시작 → 90도(아래)까지
        // 오른쪽 경첩: 90도(아래)에서 시작 → 180도(왼쪽)까지
        rotation = isLeftHinge ? 0 : 90
      }
      break

    case 'left':
      // 세로 벽: 경첩 y는 상/하 끝 (left=위, right=아래)
      x = isInside ? 10 : 0  // inside면 오른쪽(방 안)으로 오프셋
      y = isLeftHinge ? 0 : doorWidthPx
      if (isInside) {
        // 방 안(오른쪽)으로 열림
        // 왼쪽(위) 경첩: 0도에서 시작, 반시계로 90도 → 아래로 그려짐
        // 오른쪽(아래) 경첩: -90도에서 시작, 반시계로 90도 → 위로 그려짐
        rotation = isLeftHinge ? 0 : -90
      } else {
        // 방 밖(왼쪽)으로 열림 - 호가 -x 방향으로 그려져야 함
        // 왼쪽(위) 경첩: 90도(아래)에서 시작 → 180도(왼쪽)까지
        // 오른쪽(아래) 경첩: 180도(왼쪽)에서 시작 → 270도(위)까지
        rotation = isLeftHinge ? 90 : 180
      }
      break

    case 'right':
      // 세로 벽: 경첩 y는 상/하 끝 (left=위, right=아래)
      x = isInside ? 0 : 10  // inside면 왼쪽(방 안)으로
      y = isLeftHinge ? 0 : doorWidthPx
      if (isInside) {
        // 방 안(왼쪽)으로 열림
        // 왼쪽(위) 경첩: 아래에서 왼쪽으로 (rotation=90, 끝점 y=0+dw*sin(180)=0)
        // 오른쪽(아래) 경첩: 위에서 왼쪽으로 (rotation=180, 끝점 y=dw+dw*sin(270)=0)
        rotation = isLeftHinge ? 90 : 180
      } else {
        // 방 밖(오른쪽)으로 열림
        rotation = isLeftHinge ? 0 : -90
      }
      break
  }

  return { x, y, rotation }
}

/**
 * 문 패널 끝점 계산 (arc 중심에서 45도 방향)
 */
export function getDoorPanelEndPoint(
  centerX: number,
  centerY: number,
  doorWidthPx: number,
  arcRotation: number
): { endX: number; endY: number } {
  const angleRad = ((arcRotation + 45) * Math.PI) / 180
  const endX = centerX + doorWidthPx * Math.cos(angleRad)
  const endY = centerY + doorWidthPx * Math.sin(angleRad)

  return { endX, endY }
}
