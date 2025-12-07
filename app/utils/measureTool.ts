// 점 타입
export interface Point {
  x: number
  y: number
}

// 측정 객체 타입
export interface Measurement {
  id: string
  start: Point
  end: Point
  distance: number
}

/**
 * 두 점 사이의 거리를 계산한다
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 두 점으로 측정 객체를 생성한다
 */
export function createMeasurement(start: Point, end: Point): Measurement {
  return {
    id: `measure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    start,
    end,
    distance: calculateDistance(start, end),
  }
}

/**
 * 측정선의 중점을 계산한다
 */
export function getMeasurementMidpoint(measurement: Measurement): Point {
  return {
    x: (measurement.start.x + measurement.end.x) / 2,
    y: (measurement.start.y + measurement.end.y) / 2,
  }
}

/**
 * 측정선의 각도를 계산한다 (도 단위)
 */
export function getMeasurementAngle(measurement: Measurement): number {
  const dx = measurement.end.x - measurement.start.x
  const dy = measurement.end.y - measurement.start.y
  const radians = Math.atan2(dy, dx)
  const degrees = radians * (180 / Math.PI)
  return degrees
}

/**
 * 픽셀 거리를 cm 문자열로 변환한다
 */
export function formatDistance(pixelDistance: number, scale: number): string {
  const cm = Math.round(pixelDistance / scale)
  return `${cm}cm`
}
