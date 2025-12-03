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
    // 호 끝점이 문 범위(0~dw) 내에 있어야 함

    it('안쪽 열림, 왼쪽 경첩: 호가 위쪽으로 (rotation=-90)', () => {
      // 경첩이 왼쪽(x=0), 호는 오른쪽으로 그려짐
      // rotation=-90(위)에서 반시계로 90도 → 오른쪽(0) 방향까지
      // 끝점: x=0+dw*cos(0)=dw (범위 내)
      const config = getDoorArcConfig('bottom', 'inside', 'left', dw)
      expect(config.x).toBe(0)       // 경첩 왼쪽
      expect(config.y).toBe(0)       // 방 안쪽(위)
      expect(config.rotation).toBe(-90)
    })

    it('안쪽 열림, 오른쪽 경첩: 호가 위쪽으로 (rotation=180)', () => {
      // 경첩이 오른쪽(x=dw), 호는 왼쪽으로 그려짐
      // rotation=180(왼쪽)에서 반시계로 90도 → 위(-90) 방향까지
      // 끝점: x=dw+dw*cos(270)=dw (범위 내)
      const config = getDoorArcConfig('bottom', 'inside', 'right', dw)
      expect(config.x).toBe(dw)      // 경첩 오른쪽
      expect(config.y).toBe(0)       // 방 안쪽(위)
      expect(config.rotation).toBe(180)
    })

    it('바깥쪽 열림, 오른쪽 경첩: 호가 아래쪽으로 (rotation=90)', () => {
      // 경첩이 오른쪽, 문이 왼쪽으로 열리며 아래(방 밖)로 향함
      // rotation=90(아래)에서 반시계로 90도 → 180도(왼쪽) 방향까지
      // 호가 문 프레임(y=10) 아래에서 그려져야 함
      const config = getDoorArcConfig('bottom', 'outside', 'right', dw)
      expect(config.x).toBe(dw)
      expect(config.y).toBe(10)      // 방 바깥(아래)
      expect(config.rotation).toBe(90)
    })

    it('바깥쪽 열림, 왼쪽 경첩: 호가 아래쪽으로 (rotation=0)', () => {
      // 경첩이 왼쪽, 문이 오른쪽으로 열리며 아래(방 밖)로 향함
      // rotation=0(오른쪽)에서 반시계로 90도 → 90도(아래) 방향까지
      const config = getDoorArcConfig('bottom', 'outside', 'left', dw)
      expect(config.x).toBe(0)
      expect(config.y).toBe(10)
      expect(config.rotation).toBe(0)
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
    // 호 끝점이 문 범위(0~dw) 내에 있어야 함

    it('안쪽 열림, 오른쪽(아래) 경첩: 호가 왼쪽으로 (rotation=180)', () => {
      // 경첩이 아래(y=dw), 호는 위쪽으로 그려짐
      // rotation=180(왼쪽)에서 반시계로 90도 → 위(-90) 방향까지
      // 끝점: y=dw+dw*sin(270)=0 (범위 내)
      const config = getDoorArcConfig('right', 'inside', 'right', dw)
      expect(config.x).toBe(0)       // 방 안쪽(왼쪽)
      expect(config.y).toBe(dw)      // 경첩 아래
      expect(config.rotation).toBe(180)
    })

    it('안쪽 열림, 왼쪽(위) 경첩: 호가 왼쪽으로 (rotation=90)', () => {
      // 경첩이 위(y=0), 호는 아래쪽으로 그려짐
      // rotation=90(아래)에서 반시계로 90도 → 왼쪽(180) 방향까지
      // 끝점: y=0+dw*sin(180)=0... 아니면 y=0+dw*sin(180)=0
      const config = getDoorArcConfig('right', 'inside', 'left', dw)
      expect(config.x).toBe(0)
      expect(config.y).toBe(0)       // 경첩 위
      expect(config.rotation).toBe(90)
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

    it('안쪽 열림, 오른쪽(아래) 경첩: 호가 오른쪽으로 (rotation=-90)', () => {
      // 경첩이 아래(y=dw), 문이 위쪽으로 열리며 오른쪽(방 안)으로 향함
      // rotation=-90(위)에서 시작, 반시계로 90도 → 0도(오른쪽)까지
      const config = getDoorArcConfig('left', 'inside', 'right', dw)
      expect(config.x).toBe(10)
      expect(config.y).toBe(dw)      // 경첩 아래
      expect(config.rotation).toBe(-90)
    })
  })
})

describe('getDoorArcConfig - 호 범위 제한', () => {
  const dw = 160 // 80cm * 2 scale

  // 호가 문의 범위를 벗어나지 않아야 함
  // 호의 시작점(경첩)과 끝점 모두 문 범위 내에 있어야 함
  // 가로 벽(top/bottom): x가 0 ~ dw 범위 내
  // 세로 벽(left/right): y가 0 ~ dw 범위 내

  // 호 끝점 계산 헬퍼 함수
  // Konva Arc: rotation에서 시작하여 반시계방향으로 90도 그림
  const getArcEndPoint = (config: { x: number; y: number; rotation: number }, radius: number) => {
    // 호의 끝점 = 시작점에서 (rotation + 90)도 방향
    const endAngleRad = ((config.rotation + 90) * Math.PI) / 180
    return {
      endX: config.x + radius * Math.cos(endAngleRad),
      endY: config.y + radius * Math.sin(endAngleRad),
    }
  }

  describe('가로 벽 (top/bottom) - 호가 문의 왼쪽/오른쪽 끝을 벗어나지 않음', () => {
    it('top 벽, 왼쪽 경첩: 호 x 범위가 0 ~ dw', () => {
      const config = getDoorArcConfig('top', 'inside', 'left', dw)
      // 경첩이 왼쪽(x=0), 호는 오른쪽으로 그려짐
      expect(config.x).toBeGreaterThanOrEqual(0)
      expect(config.x).toBeLessThanOrEqual(dw)
    })

    it('top 벽, 오른쪽 경첩: 호 x 범위가 0 ~ dw', () => {
      const config = getDoorArcConfig('top', 'inside', 'right', dw)
      // 경첩이 오른쪽(x=dw), 호는 왼쪽으로 그려짐
      expect(config.x).toBeGreaterThanOrEqual(0)
      expect(config.x).toBeLessThanOrEqual(dw)
    })

    it('bottom 벽, 왼쪽 경첩: 호 x 범위가 0 ~ dw', () => {
      const config = getDoorArcConfig('bottom', 'inside', 'left', dw)
      expect(config.x).toBeGreaterThanOrEqual(0)
      expect(config.x).toBeLessThanOrEqual(dw)
    })

    it('bottom 벽, 오른쪽 경첩: 호 x 범위가 0 ~ dw', () => {
      const config = getDoorArcConfig('bottom', 'inside', 'right', dw)
      expect(config.x).toBeGreaterThanOrEqual(0)
      expect(config.x).toBeLessThanOrEqual(dw)
    })

    it('top 벽, outside: 호 x 범위가 0 ~ dw', () => {
      const configLeft = getDoorArcConfig('top', 'outside', 'left', dw)
      const configRight = getDoorArcConfig('top', 'outside', 'right', dw)
      expect(configLeft.x).toBeGreaterThanOrEqual(0)
      expect(configLeft.x).toBeLessThanOrEqual(dw)
      expect(configRight.x).toBeGreaterThanOrEqual(0)
      expect(configRight.x).toBeLessThanOrEqual(dw)
    })

    it('bottom 벽, outside: 호 x 범위가 0 ~ dw', () => {
      const configLeft = getDoorArcConfig('bottom', 'outside', 'left', dw)
      const configRight = getDoorArcConfig('bottom', 'outside', 'right', dw)
      expect(configLeft.x).toBeGreaterThanOrEqual(0)
      expect(configLeft.x).toBeLessThanOrEqual(dw)
      expect(configRight.x).toBeGreaterThanOrEqual(0)
      expect(configRight.x).toBeLessThanOrEqual(dw)
    })
  })

  describe('세로 벽 (left/right) - 호가 문의 위쪽/아래쪽 끝을 벗어나지 않음', () => {
    it('left 벽, 왼쪽(위) 경첩: 호 y 범위가 0 ~ dw', () => {
      const config = getDoorArcConfig('left', 'inside', 'left', dw)
      // 경첩이 위(y=0), 호는 아래로 그려짐
      expect(config.y).toBeGreaterThanOrEqual(0)
      expect(config.y).toBeLessThanOrEqual(dw)
    })

    it('left 벽, 오른쪽(아래) 경첩: 호 y 범위가 0 ~ dw', () => {
      const config = getDoorArcConfig('left', 'inside', 'right', dw)
      // 경첩이 아래(y=dw), 호는 위로 그려짐
      expect(config.y).toBeGreaterThanOrEqual(0)
      expect(config.y).toBeLessThanOrEqual(dw)
    })

    it('right 벽, 왼쪽(위) 경첩: 호 y 범위가 0 ~ dw', () => {
      const config = getDoorArcConfig('right', 'inside', 'left', dw)
      expect(config.y).toBeGreaterThanOrEqual(0)
      expect(config.y).toBeLessThanOrEqual(dw)
    })

    it('right 벽, 오른쪽(아래) 경첩: 호 y 범위가 0 ~ dw', () => {
      const config = getDoorArcConfig('right', 'inside', 'right', dw)
      expect(config.y).toBeGreaterThanOrEqual(0)
      expect(config.y).toBeLessThanOrEqual(dw)
    })

    it('left 벽, outside: 호 y 범위가 0 ~ dw', () => {
      const configLeft = getDoorArcConfig('left', 'outside', 'left', dw)
      const configRight = getDoorArcConfig('left', 'outside', 'right', dw)
      expect(configLeft.y).toBeGreaterThanOrEqual(0)
      expect(configLeft.y).toBeLessThanOrEqual(dw)
      expect(configRight.y).toBeGreaterThanOrEqual(0)
      expect(configRight.y).toBeLessThanOrEqual(dw)
    })

    it('right 벽, outside: 호 y 범위가 0 ~ dw', () => {
      const configLeft = getDoorArcConfig('right', 'outside', 'left', dw)
      const configRight = getDoorArcConfig('right', 'outside', 'right', dw)
      expect(configLeft.y).toBeGreaterThanOrEqual(0)
      expect(configLeft.y).toBeLessThanOrEqual(dw)
      expect(configRight.y).toBeGreaterThanOrEqual(0)
      expect(configRight.y).toBeLessThanOrEqual(dw)
    })
  })

  describe('호 시작점이 문 범위를 벗어나지 않음', () => {
    // 호의 시작점(rotation 각도 방향)이 문 범위 내에 있어야 함
    // 시작점 계산: x + radius * cos(rotation), y + radius * sin(rotation)
    const getArcStartPoint = (config: { x: number; y: number; rotation: number }, radius: number) => {
      const startAngleRad = (config.rotation * Math.PI) / 180
      return {
        startX: config.x + radius * Math.cos(startAngleRad),
        startY: config.y + radius * Math.sin(startAngleRad),
      }
    }

    describe('bottom 벽 (가로) - 시작점', () => {
      it('안쪽 열림, 왼쪽 경첩: 호 시작점 x가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('bottom', 'inside', 'left', dw)
        const startPoint = getArcStartPoint(config, dw)
        expect(startPoint.startX).toBeGreaterThanOrEqual(-1)
        expect(startPoint.startX).toBeLessThanOrEqual(dw + 1)
      })

      it('안쪽 열림, 오른쪽 경첩: 호 시작점 x가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('bottom', 'inside', 'right', dw)
        const startPoint = getArcStartPoint(config, dw)
        expect(startPoint.startX).toBeGreaterThanOrEqual(-1)
        expect(startPoint.startX).toBeLessThanOrEqual(dw + 1)
      })
    })

    describe('top 벽 (가로) - 시작점', () => {
      it('안쪽 열림, 왼쪽 경첩: 호 시작점 x가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('top', 'inside', 'left', dw)
        const startPoint = getArcStartPoint(config, dw)
        expect(startPoint.startX).toBeGreaterThanOrEqual(-1)
        expect(startPoint.startX).toBeLessThanOrEqual(dw + 1)
      })

      it('안쪽 열림, 오른쪽 경첩: 호 시작점 x가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('top', 'inside', 'right', dw)
        const startPoint = getArcStartPoint(config, dw)
        expect(startPoint.startX).toBeGreaterThanOrEqual(-1)
        expect(startPoint.startX).toBeLessThanOrEqual(dw + 1)
      })
    })

    describe('right 벽 (세로) - 시작점', () => {
      it('안쪽 열림, 왼쪽(위) 경첩: 호 시작점 y가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('right', 'inside', 'left', dw)
        const startPoint = getArcStartPoint(config, dw)
        expect(startPoint.startY).toBeGreaterThanOrEqual(-1)
        expect(startPoint.startY).toBeLessThanOrEqual(dw + 1)
      })

      it('안쪽 열림, 오른쪽(아래) 경첩: 호 시작점 y가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('right', 'inside', 'right', dw)
        const startPoint = getArcStartPoint(config, dw)
        expect(startPoint.startY).toBeGreaterThanOrEqual(-1)
        expect(startPoint.startY).toBeLessThanOrEqual(dw + 1)
      })
    })

    describe('left 벽 (세로) - 시작점', () => {
      it('안쪽 열림, 왼쪽(위) 경첩: 호 시작점 y가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('left', 'inside', 'left', dw)
        const startPoint = getArcStartPoint(config, dw)
        expect(startPoint.startY).toBeGreaterThanOrEqual(-1)
        expect(startPoint.startY).toBeLessThanOrEqual(dw + 1)
      })

      it('안쪽 열림, 오른쪽(아래) 경첩: 호 시작점 y가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('left', 'inside', 'right', dw)
        const startPoint = getArcStartPoint(config, dw)
        expect(startPoint.startY).toBeGreaterThanOrEqual(-1)
        expect(startPoint.startY).toBeLessThanOrEqual(dw + 1)
      })
    })
  })

  describe('호 끝점이 문 범위를 벗어나지 않음', () => {
    // 모든 케이스에서 호의 끝점이 0 ~ dw 범위 내에 있어야 함
    // 스크린샷 버그: bottom벽, 오른쪽 경첩, 안쪽 열림 → 호 끝점이 x=320으로 벗어남

    describe('bottom 벽 (가로)', () => {
      it('안쪽 열림, 오른쪽 경첩: 호 끝점 x가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('bottom', 'inside', 'right', dw)
        const endPoint = getArcEndPoint(config, dw)
        expect(endPoint.endX).toBeGreaterThanOrEqual(-1)
        expect(endPoint.endX).toBeLessThanOrEqual(dw + 1)
      })

      it('안쪽 열림, 왼쪽 경첩: 호 끝점 x가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('bottom', 'inside', 'left', dw)
        const endPoint = getArcEndPoint(config, dw)
        expect(endPoint.endX).toBeGreaterThanOrEqual(-1)
        expect(endPoint.endX).toBeLessThanOrEqual(dw + 1)
      })
    })

    describe('top 벽 (가로)', () => {
      it('안쪽 열림, 오른쪽 경첩: 호 끝점 x가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('top', 'inside', 'right', dw)
        const endPoint = getArcEndPoint(config, dw)
        expect(endPoint.endX).toBeGreaterThanOrEqual(-1)
        expect(endPoint.endX).toBeLessThanOrEqual(dw + 1)
      })

      it('안쪽 열림, 왼쪽 경첩: 호 끝점 x가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('top', 'inside', 'left', dw)
        const endPoint = getArcEndPoint(config, dw)
        expect(endPoint.endX).toBeGreaterThanOrEqual(-1)
        expect(endPoint.endX).toBeLessThanOrEqual(dw + 1)
      })
    })

    describe('left 벽 (세로)', () => {
      it('안쪽 열림, 오른쪽(아래) 경첩: 호 끝점 y가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('left', 'inside', 'right', dw)
        const endPoint = getArcEndPoint(config, dw)
        expect(endPoint.endY).toBeGreaterThanOrEqual(-1)
        expect(endPoint.endY).toBeLessThanOrEqual(dw + 1)
      })

      it('안쪽 열림, 왼쪽(위) 경첩: 호 끝점 y가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('left', 'inside', 'left', dw)
        const endPoint = getArcEndPoint(config, dw)
        expect(endPoint.endY).toBeGreaterThanOrEqual(-1)
        expect(endPoint.endY).toBeLessThanOrEqual(dw + 1)
      })
    })

    describe('right 벽 (세로)', () => {
      it('안쪽 열림, 오른쪽(아래) 경첩: 호 끝점 y가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('right', 'inside', 'right', dw)
        const endPoint = getArcEndPoint(config, dw)
        expect(endPoint.endY).toBeGreaterThanOrEqual(-1)
        expect(endPoint.endY).toBeLessThanOrEqual(dw + 1)
      })

      it('안쪽 열림, 왼쪽(위) 경첩: 호 끝점 y가 0 ~ dw 범위 내', () => {
        const config = getDoorArcConfig('right', 'inside', 'left', dw)
        const endPoint = getArcEndPoint(config, dw)
        expect(endPoint.endY).toBeGreaterThanOrEqual(-1)
        expect(endPoint.endY).toBeLessThanOrEqual(dw + 1)
      })
    })
  })
})

describe('호 방향 (outside 케이스)', () => {
  const dw = 160

  // 호 시작점/끝점 계산 헬퍼
  const getArcPoints = (config: { x: number; y: number; rotation: number }, radius: number) => {
    const startAngleRad = (config.rotation * Math.PI) / 180
    const endAngleRad = ((config.rotation + 90) * Math.PI) / 180
    return {
      startX: config.x + radius * Math.cos(startAngleRad),
      startY: config.y + radius * Math.sin(startAngleRad),
      endX: config.x + radius * Math.cos(endAngleRad),
      endY: config.y + radius * Math.sin(endAngleRad),
    }
  }

  describe('bottom/outside - 호가 아래(+y)로 그려지고 문 프레임 아래에서 시작', () => {
    it('왼쪽 경첩: 끝점 y > 시작점 y, 시작점 y >= 문 프레임(10)', () => {
      const config = getDoorArcConfig('bottom', 'outside', 'left', dw)
      const points = getArcPoints(config, dw)
      expect(points.endY).toBeGreaterThan(points.startY)
      expect(points.startY).toBeGreaterThanOrEqual(config.y) // 문 프레임 아래에서 시작
    })

    it('오른쪽 경첩: 호가 아래에서 시작해서 왼쪽으로, 두 점 모두 문 프레임 아래', () => {
      const config = getDoorArcConfig('bottom', 'outside', 'right', dw)
      const points = getArcPoints(config, dw)
      // 오른쪽 경첩: 아래(y큰값)에서 시작 → 왼쪽(y작은값)으로 스윙
      // rotation=90: startY = 10 + 160*sin(90) = 170, endY = 10 + 160*sin(180) = 10
      expect(points.startY).toBeGreaterThan(points.endY) // 아래에서 위로
      expect(points.startY).toBeGreaterThanOrEqual(config.y) // 시작점 >= 문 프레임
      expect(points.endY).toBeGreaterThanOrEqual(config.y) // 끝점 >= 문 프레임
    })
  })

  describe('top/outside - 호가 위(-y)로 그려져야 함', () => {
    it('왼쪽 경첩: 끝점 y > 시작점 y (호가 위에서 아래로)', () => {
      // 왼쪽 경첩에서 오른쪽으로 스윙하며 위(방 밖)로 열림
      // 호는 위(-y)에서 시작해서 오른쪽(+x)으로 끝남
      const config = getDoorArcConfig('top', 'outside', 'left', dw)
      const points = getArcPoints(config, dw)
      expect(points.endY).toBeGreaterThan(points.startY) // 위에서 아래로
      // 호의 y 범위 중 최소값이 음수(위)여야 함
      expect(Math.min(points.startY, points.endY)).toBeLessThan(0)
    })

    it('오른쪽 경첩: 끝점 y < 시작점 y (호가 아래에서 위로)', () => {
      // 오른쪽 경첩에서 왼쪽으로 스윙하며 위(방 밖)로 열림
      // 호는 아래(+y)에서 시작해서 왼쪽(-x), 위(-y)로 끝남
      const config = getDoorArcConfig('top', 'outside', 'right', dw)
      const points = getArcPoints(config, dw)
      expect(points.endY).toBeLessThan(points.startY) // 아래에서 위로
      // 호의 y 범위 중 최소값이 음수(위)여야 함
      expect(Math.min(points.startY, points.endY)).toBeLessThan(0)
    })
  })

  describe('left/outside - 호가 왼쪽(-x)으로 그려져야 함', () => {
    it('왼쪽(위) 경첩: 끝점 x < 시작점 x, 호 y범위 0~dw', () => {
      // 왼쪽 벽, 바깥쪽 열림, 위쪽 경첩
      // 호가 방 바깥(왼쪽, -x)으로 그려져야 함
      const config = getDoorArcConfig('left', 'outside', 'left', dw)
      const points = getArcPoints(config, dw)
      expect(points.endX).toBeLessThan(points.startX) // 왼쪽으로 열림
      // 호의 y 범위가 문 범위(0~dw) 내에 있어야 함
      expect(Math.min(points.startY, points.endY)).toBeGreaterThanOrEqual(-1)
      expect(Math.max(points.startY, points.endY)).toBeLessThanOrEqual(dw + 1)
    })

    it('오른쪽(아래) 경첩: 호가 왼쪽(-x)으로 그려지고 y범위 0~dw', () => {
      // 왼쪽 벽, 바깥쪽 열림, 아래쪽 경첩
      // 호가 방 바깥(왼쪽, -x)으로 그려져야 함
      // 경첩이 아래에 있으므로 호는 아래에서 위로 스윙하며 왼쪽으로 감
      const config = getDoorArcConfig('left', 'outside', 'right', dw)
      const points = getArcPoints(config, dw)
      // 호의 x 범위 중 최소값이 음수(왼쪽)여야 함
      expect(Math.min(points.startX, points.endX)).toBeLessThan(0)
      // 호의 y 범위가 문 범위(0~dw) 내에 있어야 함
      expect(Math.min(points.startY, points.endY)).toBeGreaterThanOrEqual(-1)
      expect(Math.max(points.startY, points.endY)).toBeLessThanOrEqual(dw + 1)
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
