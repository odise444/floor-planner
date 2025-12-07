/**
 * 그룹(Group) 유틸리티 함수
 * - 여러 객체를 하나의 그룹으로 묶어 관리
 */

import type { Furniture } from '~/types/furniture'
import type { Wall } from '~/utils/wall'

// 그룹 멤버 타입
export type GroupMemberType = 'furniture' | 'wall' | 'group'

// 그룹 멤버 인터페이스
export interface GroupMember {
  id: string
  type: GroupMemberType
}

// 그룹 인터페이스
export interface ObjectGroup {
  id: string
  name: string
  members: GroupMember[]
  x: number // 그룹 기준점 X
  y: number // 그룹 기준점 Y
  width: number // 바운딩 박스 너비
  height: number // 바운딩 박스 높이
  rotation: number // 그룹 전체 회전
  zIndex: number
  color: string // 그룹 표시 색상
  locked: boolean // 그룹 잠금 여부
  createdAt: number
}

// 그룹 생성 옵션
export interface CreateGroupOptions {
  name?: string
  color?: string
  zIndex?: number
}

/**
 * 고유 ID 생성
 */
function generateId(): string {
  return `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 바운딩 박스 계산
 */
export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
  centerX: number
  centerY: number
}

/**
 * 가구의 바운딩 박스 계산
 */
export function getFurnitureBounds(furniture: Furniture, scale: number): BoundingBox {
  const x = furniture.x
  const y = furniture.y
  const w = furniture.width * scale
  const h = furniture.height * scale

  return {
    minX: x,
    minY: y,
    maxX: x + w,
    maxY: y + h,
    width: w,
    height: h,
    centerX: x + w / 2,
    centerY: y + h / 2,
  }
}

/**
 * 벽체의 바운딩 박스 계산
 */
export function getWallBounds(wall: Wall, scale: number): BoundingBox {
  const x1 = wall.startX * scale
  const y1 = wall.startY * scale
  const x2 = wall.endX * scale
  const y2 = wall.endY * scale
  const thickness = wall.thickness * scale / 2

  const minX = Math.min(x1, x2) - thickness
  const minY = Math.min(y1, y2) - thickness
  const maxX = Math.max(x1, x2) + thickness
  const maxY = Math.max(y1, y2) + thickness

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  }
}

/**
 * 여러 바운딩 박스를 합친 전체 바운딩 박스 계산
 */
export function mergeBoundingBoxes(boxes: BoundingBox[]): BoundingBox | null {
  if (boxes.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const box of boxes) {
    minX = Math.min(minX, box.minX)
    minY = Math.min(minY, box.minY)
    maxX = Math.max(maxX, box.maxX)
    maxY = Math.max(maxY, box.maxY)
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  }
}

/**
 * 그룹 생성
 */
export function createGroup(
  members: GroupMember[],
  bounds: BoundingBox,
  options: CreateGroupOptions = {}
): ObjectGroup {
  return {
    id: generateId(),
    name: options.name || `그룹 ${new Date().toLocaleTimeString()}`,
    members: [...members],
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.width,
    height: bounds.height,
    rotation: 0,
    zIndex: options.zIndex ?? 100,
    color: options.color || '#8b5cf6', // 보라색
    locked: false,
    createdAt: Date.now(),
  }
}

/**
 * 그룹에 멤버 추가
 */
export function addMemberToGroup(group: ObjectGroup, member: GroupMember): ObjectGroup {
  if (group.members.some((m) => m.id === member.id && m.type === member.type)) {
    return group // 이미 존재하는 멤버
  }

  return {
    ...group,
    members: [...group.members, member],
  }
}

/**
 * 그룹에서 멤버 제거
 */
export function removeMemberFromGroup(group: ObjectGroup, memberId: string): ObjectGroup {
  return {
    ...group,
    members: group.members.filter((m) => m.id !== memberId),
  }
}

/**
 * 그룹 해제 (멤버들만 반환)
 */
export function ungroupMembers(group: ObjectGroup): GroupMember[] {
  return [...group.members]
}

/**
 * 객체가 그룹에 속해있는지 확인
 */
export function isInGroup(groups: ObjectGroup[], itemId: string, itemType: GroupMemberType): ObjectGroup | null {
  for (const group of groups) {
    if (group.members.some((m) => m.id === itemId && m.type === itemType)) {
      return group
    }
  }
  return null
}

/**
 * 그룹 이동
 */
export function moveGroup(group: ObjectGroup, dx: number, dy: number): ObjectGroup {
  return {
    ...group,
    x: group.x + dx,
    y: group.y + dy,
  }
}

/**
 * 그룹 바운딩 박스 업데이트
 */
export function updateGroupBounds(group: ObjectGroup, bounds: BoundingBox): ObjectGroup {
  return {
    ...group,
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.width,
    height: bounds.height,
  }
}
