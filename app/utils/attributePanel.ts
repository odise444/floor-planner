/**
 * 속성 패널 유틸리티 함수
 */

import type { Furniture } from '~/types/furniture'
import type { Room } from '~/types/room'

// 벽과의 거리 타입
export interface WallDistances {
  top: number    // 상단 벽 거리 (cm)
  bottom: number // 하단 벽 거리 (cm)
  left: number   // 좌측 벽 거리 (cm)
  right: number  // 우측 벽 거리 (cm)
}

// 위치 정보 타입
export interface Position {
  x: number // X 좌표 (cm)
  y: number // Y 좌표 (cm)
}

// 크기 정보 타입
export interface Size {
  width: number  // 가로 (cm)
  height: number // 세로 (cm)
}

/**
 * 픽셀을 cm로 변환
 */
export function pixelToCm(pixel: number, scale: number): number {
  const cm = pixel / scale
  return Math.round(cm * 100) / 100 // 소수점 둘째 자리까지
}

/**
 * cm를 픽셀로 변환
 */
export function cmToPixel(cm: number, scale: number): number {
  return cm * scale
}

/**
 * 가구 위치를 방 기준 상대 좌표(cm)로 반환
 */
export function formatPosition(furniture: Furniture, room: Room | null, scale: number): Position {
  if (room) {
    // 방 기준 상대 좌표
    const relativeX = furniture.x - room.x
    const relativeY = furniture.y - room.y
    return {
      x: pixelToCm(relativeX, scale),
      y: pixelToCm(relativeY, scale),
    }
  }

  // 방이 없으면 절대 좌표
  return {
    x: pixelToCm(furniture.x, scale),
    y: pixelToCm(furniture.y, scale),
  }
}

/**
 * 가구 크기를 cm로 반환
 */
export function formatSize(furniture: Furniture, scale: number): Size {
  return {
    width: pixelToCm(furniture.width, scale),
    height: pixelToCm(furniture.height, scale),
  }
}

/**
 * 회전된 가구의 실제 바운딩 박스 크기 계산
 */
function getRotatedBoundingBox(width: number, height: number, rotation: number): { width: number; height: number } {
  const rad = (rotation * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))

  // 90도, 270도 회전 시 width와 height가 바뀜
  if (rotation === 90 || rotation === 270) {
    return { width: height, height: width }
  }

  // 일반적인 회전
  return {
    width: width * cos + height * sin,
    height: width * sin + height * cos,
  }
}

/**
 * 가구와 방 벽 사이 거리 계산
 */
export function calculateWallDistances(
  furniture: Furniture,
  room: Room | null,
  scale: number
): WallDistances | null {
  if (!room) return null

  // 회전을 고려한 바운딩 박스 크기
  const boundingBox = getRotatedBoundingBox(furniture.width, furniture.height, furniture.rotation)

  // 방 기준 상대 좌표 (픽셀)
  const relativeX = furniture.x - room.x
  const relativeY = furniture.y - room.y

  // 각 벽과의 거리 계산 (픽셀)
  const topPx = relativeY
  const bottomPx = room.height - (relativeY + boundingBox.height)
  const leftPx = relativeX
  const rightPx = room.width - (relativeX + boundingBox.width)

  return {
    top: pixelToCm(topPx, scale),
    bottom: pixelToCm(bottomPx, scale),
    left: pixelToCm(leftPx, scale),
    right: pixelToCm(rightPx, scale),
  }
}
