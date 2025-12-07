import { describe, it, expect } from 'vitest'
import {
  calculateDistance,
  createMeasurement,
  getMeasurementMidpoint,
  getMeasurementAngle,
  formatDistance,
  type Point,
  type Measurement,
} from '../app/utils/measureTool'

describe('measureTool', () => {
  describe('calculateDistance', () => {
    it('두 점 사이의 거리를 계산한다 (수평)', () => {
      const p1: Point = { x: 0, y: 0 }
      const p2: Point = { x: 100, y: 0 }
      expect(calculateDistance(p1, p2)).toBe(100)
    })

    it('두 점 사이의 거리를 계산한다 (수직)', () => {
      const p1: Point = { x: 0, y: 0 }
      const p2: Point = { x: 0, y: 50 }
      expect(calculateDistance(p1, p2)).toBe(50)
    })

    it('두 점 사이의 거리를 계산한다 (대각선)', () => {
      const p1: Point = { x: 0, y: 0 }
      const p2: Point = { x: 3, y: 4 }
      expect(calculateDistance(p1, p2)).toBe(5) // 3-4-5 삼각형
    })

    it('동일한 점의 거리는 0이다', () => {
      const p1: Point = { x: 50, y: 50 }
      const p2: Point = { x: 50, y: 50 }
      expect(calculateDistance(p1, p2)).toBe(0)
    })

    it('음수 좌표도 처리한다', () => {
      const p1: Point = { x: -10, y: -10 }
      const p2: Point = { x: 10, y: 10 }
      // 거리 = sqrt(20^2 + 20^2) = sqrt(800) ≈ 28.28
      expect(calculateDistance(p1, p2)).toBeCloseTo(28.28, 1)
    })
  })

  describe('createMeasurement', () => {
    it('두 점으로 측정 객체를 생성한다', () => {
      const start: Point = { x: 0, y: 0 }
      const end: Point = { x: 100, y: 0 }
      const measurement = createMeasurement(start, end)

      expect(measurement.id).toBeDefined()
      expect(measurement.start).toEqual(start)
      expect(measurement.end).toEqual(end)
      expect(measurement.distance).toBe(100)
    })

    it('고유한 ID를 생성한다', () => {
      const start: Point = { x: 0, y: 0 }
      const end: Point = { x: 100, y: 0 }
      const m1 = createMeasurement(start, end)
      const m2 = createMeasurement(start, end)

      expect(m1.id).not.toBe(m2.id)
    })
  })

  describe('getMeasurementMidpoint', () => {
    it('측정선의 중점을 계산한다', () => {
      const measurement: Measurement = {
        id: 'test',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 100 },
        distance: 141.42,
      }
      const midpoint = getMeasurementMidpoint(measurement)

      expect(midpoint.x).toBe(50)
      expect(midpoint.y).toBe(50)
    })

    it('음수 좌표도 처리한다', () => {
      const measurement: Measurement = {
        id: 'test',
        start: { x: -50, y: -50 },
        end: { x: 50, y: 50 },
        distance: 141.42,
      }
      const midpoint = getMeasurementMidpoint(measurement)

      expect(midpoint.x).toBe(0)
      expect(midpoint.y).toBe(0)
    })
  })

  describe('getMeasurementAngle', () => {
    it('수평선의 각도는 0도이다', () => {
      const measurement: Measurement = {
        id: 'test',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 0 },
        distance: 100,
      }
      expect(getMeasurementAngle(measurement)).toBe(0)
    })

    it('수직선의 각도는 90도이다', () => {
      const measurement: Measurement = {
        id: 'test',
        start: { x: 0, y: 0 },
        end: { x: 0, y: 100 },
        distance: 100,
      }
      expect(getMeasurementAngle(measurement)).toBe(90)
    })

    it('45도 대각선의 각도를 계산한다', () => {
      const measurement: Measurement = {
        id: 'test',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 100 },
        distance: 141.42,
      }
      expect(getMeasurementAngle(measurement)).toBeCloseTo(45, 1)
    })

    it('역방향 수평선의 각도는 180도이다', () => {
      const measurement: Measurement = {
        id: 'test',
        start: { x: 100, y: 0 },
        end: { x: 0, y: 0 },
        distance: 100,
      }
      expect(getMeasurementAngle(measurement)).toBe(180)
    })
  })

  describe('formatDistance', () => {
    it('픽셀 거리를 cm로 변환한다 (scale=2)', () => {
      expect(formatDistance(200, 2)).toBe('100cm')
    })

    it('소수점을 반올림한다', () => {
      expect(formatDistance(201, 2)).toBe('101cm')
      expect(formatDistance(199, 2)).toBe('100cm')
    })

    it('100cm 이상은 m 단위로 표시한다', () => {
      expect(formatDistance(200, 2)).toBe('100cm')
      expect(formatDistance(202, 2)).toBe('101cm')
    })

    it('0 거리를 처리한다', () => {
      expect(formatDistance(0, 2)).toBe('0cm')
    })
  })
})
