import { describe, it, expect } from 'vitest'
import {
  snapDoorToWall,
  getDoorGroupPosition,
  getDoorArcRotation,
  getDoorArcConfig,
  getDoorPanelEndPoint,
  type Room,
} from '~/utils/door'

describe('snapDoorToWall', () => {
  const room: Room = { x: 100, y: 100, width: 400, height: 300 }
  const scale = 2
  const doorWidthPx = 160 // 80cm * 2

  it('상단 벽에 가장 가까우면 top 반환', () => {
    const result = snapDoorToWall(200, 110, doorWidthPx, room, scale)
    expect(result.wall).toBe('top')
  })

  it('하단 벽에 가장 가까우면 bottom 반환', () => {
    const result = snapDoorToWall(200, 390, doorWidthPx, room, scale)
    expect(result.wall).toBe('bottom')
  })

  it('좌측 벽에 가장 가까우면 left 반환', () => {
    const result = snapDoorToWall(110, 250, doorWidthPx, room, scale)
    expect(result.wall).toBe('left')
  })

  it('우측 벽에 가장 가까우면 right 반환', () => {
    const result = snapDoorToWall(490, 250, doorWidthPx, room, scale)
    expect(result.wall).toBe('right')
  })

  it('문 위치가 벽 범위 내로 클램핑됨 (음수 방지)', () => {
    const result = snapDoorToWall(50, 110, doorWidthPx, room, scale)
    expect(result.x).toBeGreaterThanOrEqual(0)
    expect(result.y).toBeGreaterThanOrEqual(0)
  })

  it('문 위치가 벽 범위 내로 클램핑됨 (최대값 제한)', () => {
    const result = snapDoorToWall(600, 110, doorWidthPx, room, scale)
    // 최대 x = (400 - 160) / 2 = 120
    expect(result.x).toBeLessThanOrEqual(120)
  })
})

describe('getDoorGroupPosition', () => {
  const room: Room = { x: 100, y: 100, width: 400, height: 300 }
  const scale = 2

  it('top 벽: y는 room.y - 5', () => {
    const pos = getDoorGroupPosition(50, 0, 'top', room, scale)
    expect(pos.y).toBe(95)
    expect(pos.x).toBe(200) // 100 + 50*2
  })

  it('bottom 벽: y는 room.y + room.height - 5', () => {
    const pos = getDoorGroupPosition(50, 0, 'bottom', room, scale)
    expect(pos.y).toBe(395) // 100 + 300 - 5
    expect(pos.x).toBe(200)
  })

  it('left 벽: x는 room.x - 5', () => {
    const pos = getDoorGroupPosition(0, 50, 'left', room, scale)
    expect(pos.x).toBe(95)
    expect(pos.y).toBe(200)
  })

  it('right 벽: x는 room.x + room.width - 5', () => {
    const pos = getDoorGroupPosition(0, 50, 'right', room, scale)
    expect(pos.x).toBe(495) // 100 + 400 - 5
    expect(pos.y).toBe(200)
  })
})

describe('getDoorArcRotation', () => {
  // top 벽 테스트 - inside면 아래(방 안)로, outside면 위(방 밖)로
  it('top 벽, 안쪽 열림, 왼쪽 경첩: 0도', () => {
    const rotation = getDoorArcRotation('top', 'inside', 'left')
    expect(rotation).toBe(0)
  })

  it('top 벽, 안쪽 열림, 오른쪽 경첩: 90도', () => {
    const rotation = getDoorArcRotation('top', 'inside', 'right')
    expect(rotation).toBe(90)
  })

  it('top 벽, 바깥 열림, 왼쪽 경첩: 180도', () => {
    const rotation = getDoorArcRotation('top', 'outside', 'left')
    expect(rotation).toBe(180)
  })

  // bottom 벽 테스트 - inside면 위(방 안)로, outside면 아래(방 밖)로
  it('bottom 벽, 안쪽 열림, 왼쪽 경첩: 180도', () => {
    const rotation = getDoorArcRotation('bottom', 'inside', 'left')
    expect(rotation).toBe(180)
  })

  it('bottom 벽, 안쪽 열림, 오른쪽 경첩: 90도', () => {
    const rotation = getDoorArcRotation('bottom', 'inside', 'right')
    expect(rotation).toBe(90)
  })

  // left 벽 테스트 - inside면 오른쪽(방 안)으로
  it('left 벽, 안쪽 열림, 왼쪽 경첩: 0도', () => {
    const rotation = getDoorArcRotation('left', 'inside', 'left')
    expect(rotation).toBe(0)
  })

  // right 벽 테스트 - inside면 왼쪽(방 안)으로
  it('right 벽, 안쪽 열림, 왼쪽 경첩: 180도', () => {
    const rotation = getDoorArcRotation('right', 'inside', 'left')
    expect(rotation).toBe(180)
  })
})

describe('getDoorArcConfig', () => {
  const dw = 160 // 80cm * 2 scale

  // Konva Arc: rotation에서 시작하여 반시계방향으로 angle도 그림
  // rotation=0: 오른쪽(+x)에서 시작, 90: 아래(+y)에서 시작
  // 180/-180: 왼쪽(-x)에서 시작, -90/270: 위(-y)에서 시작
  //
  // 문 열림 방향 규칙:
  // - 경첩 반대편에서 호가 시작하여 열림 방향(방 안/밖)으로 90도 그려짐
  // - 예: bottom벽, 왼쪽 경첩, 안쪽 열림 → 오른쪽(0도)에서 시작하여 위(-90도 방향)로

  describe('bottom 벽 (방 안쪽 = 위)', () => {
    // bottom 벽에서 inside 열림: 호가 위(방 안쪽)로 그려져야 함
    // Konva Arc: rotation에서 시작하여 반시계방향으로 90도 그림

    it('안쪽 열림, 왼쪽 경첩: 호가 위쪽으로 (rotation=180)', () => {
      // 경첩이 왼쪽(x=0), 문이 오른쪽으로 열리며 위(방 안)로 향함
      // rotation=180(왼쪽)에서 반시계로 90도 → 위(-90/270) 방향까지
      const config = getDoorArcConfig('bottom', 'inside', 'left', dw)
      expect(config.x).toBe(0)       // 경첩 왼쪽
      expect(config.y).toBe(0)       // 방 안쪽(위)
      expect(config.rotation).toBe(180)
    })

    it('안쪽 열림, 오른쪽 경첩: 호가 위쪽으로 (rotation=90)', () => {
      // 경첩이 오른쪽(x=dw), 문이 왼쪽으로 열리며 위(방 안)로 향함
      // rotation=90(아래)에서 반시계로 90도 → 오른쪽(0) 방향까지... 하지만 위로 가야함
      // 실제: rotation=-90(위)에서 반시계로 90도 → 왼쪽(180) 방향까지
      const config = getDoorArcConfig('bottom', 'inside', 'right', dw)
      expect(config.x).toBe(dw)      // 경첩 오른쪽
      expect(config.y).toBe(0)       // 방 안쪽(위)
      expect(config.rotation).toBe(-90) // 위에서 시작하여 반시계(왼쪽)로
    })

    it('바깥쪽 열림, 오른쪽 경첩: 호가 아래쪽으로 (rotation=180)', () => {
      // 경첩이 오른쪽, 문이 왼쪽으로 열리며 아래(방 밖)로 향함
      // rotation=180(왼쪽)에서 반시계로 90도 → 아래(90) 방향까지
      const config = getDoorArcConfig('bottom', 'outside', 'right', dw)
      expect(config.x).toBe(dw)
      expect(config.y).toBe(10)      // 방 바깥(아래)
      expect(config.rotation).toBe(180)
    })

    it('바깥쪽 열림, 왼쪽 경첩: 호가 아래쪽으로 (rotation=0)', () => {
      // rotation=0(오른쪽)에서 반시계로 90도 → 아래(90) 방향까지... 아님
      // rotation=90(아래)에서 반시계로 90도 → 오른쪽(0) 방향까지
      const config = getDoorArcConfig('bottom', 'outside', 'left', dw)
      expect(config.x).toBe(0)
      expect(config.y).toBe(10)
      expect(config.rotation).toBe(90)
    })
  })

  describe('top 벽 (방 안쪽 = 아래)', () => {
    it('안쪽 열림, 왼쪽 경첩: 호가 오른쪽에서 아래로 (rotation=0)', () => {
      const config = getDoorArcConfig('top', 'inside', 'left', dw)
      expect(config.x).toBe(0)
      expect(config.y).toBe(10)      // 방 안쪽(아래)
      expect(config.rotation).toBe(0)
    })

    it('안쪽 열림, 오른쪽 경첩: 호가 왼쪽에서 아래로 (rotation=90)', () => {
      const config = getDoorArcConfig('top', 'inside', 'right', dw)
      expect(config.x).toBe(dw)
      expect(config.y).toBe(10)
      expect(config.rotation).toBe(90)
    })
  })

  describe('right 벽 (방 안쪽 = 왼쪽)', () => {
    // right 벽에서 inside 열림: 호가 왼쪽(방 안쪽)으로 그려져야 함
    // 세로 벽에서 left=위, right=아래

    it('안쪽 열림, 오른쪽(아래) 경첩: 호가 왼쪽으로 (rotation=90)', () => {
      // 경첩이 아래(y=dw), 문이 위쪽으로 열리며 왼쪽(방 안)으로 향함
      // rotation=90(아래)에서 반시계로 90도 → 왼쪽(180) 방향... 하지만 위에서 왼쪽으로
      const config = getDoorArcConfig('right', 'inside', 'right', dw)
      expect(config.x).toBe(0)       // 방 안쪽(왼쪽)
      expect(config.y).toBe(dw)      // 경첩 아래
      expect(config.rotation).toBe(90)
    })

    it('안쪽 열림, 왼쪽(위) 경첩: 호가 왼쪽으로 (rotation=180)', () => {
      // 경첩이 위(y=0), 문이 아래쪽으로 열리며 왼쪽(방 안)으로 향함
      const config = getDoorArcConfig('right', 'inside', 'left', dw)
      expect(config.x).toBe(0)
      expect(config.y).toBe(0)       // 경첩 위
      expect(config.rotation).toBe(180)
    })
  })

  describe('left 벽 (방 안쪽 = 오른쪽)', () => {
    // left 벽에서 inside 열림: 호가 오른쪽(방 안쪽)으로 그려져야 함
    // 세로 벽에서 left=위, right=아래

    it('안쪽 열림, 왼쪽(위) 경첩: 호가 오른쪽으로 (rotation=0)', () => {
      // 경첩이 위(y=0), 문이 아래쪽으로 열리며 오른쪽(방 안)으로 향함
      const config = getDoorArcConfig('left', 'inside', 'left', dw)
      expect(config.x).toBe(10)      // 방 안쪽(오른쪽)
      expect(config.y).toBe(0)       // 경첩 위
      expect(config.rotation).toBe(0)
    })

    it('안쪽 열림, 오른쪽(아래) 경첩: 호가 오른쪽으로 (rotation=90)', () => {
      // 경첩이 아래(y=dw), 문이 위쪽으로 열리며 오른쪽(방 안)으로 향함
      const config = getDoorArcConfig('left', 'inside', 'right', dw)
      expect(config.x).toBe(10)
      expect(config.y).toBe(dw)      // 경첩 아래
      expect(config.rotation).toBe(90)
    })
  })
})

describe('getDoorPanelEndPoint', () => {
  it('0도 회전: 45도 방향으로 선 그림', () => {
    const { endX, endY } = getDoorPanelEndPoint(0, 0, 100, 0)
    // 45도 = Math.cos(45°) * 100 ≈ 70.71
    expect(endX).toBeCloseTo(70.71, 1)
    expect(endY).toBeCloseTo(70.71, 1)
  })

  it('90도 회전: 135도 방향', () => {
    const { endX, endY } = getDoorPanelEndPoint(0, 0, 100, 90)
    // 135도 = Math.cos(135°) * 100 ≈ -70.71
    expect(endX).toBeCloseTo(-70.71, 1)
    expect(endY).toBeCloseTo(70.71, 1)
  })

  it('중심점 오프셋 적용', () => {
    const { endX, endY } = getDoorPanelEndPoint(50, 50, 100, 0)
    expect(endX).toBeCloseTo(120.71, 1)
    expect(endY).toBeCloseTo(120.71, 1)
  })
})
