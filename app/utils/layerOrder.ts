// 레이어 순서를 가진 아이템 인터페이스
export interface LayerItem {
  id: string
  zIndex: number
}

/**
 * 다음 zIndex 값을 반환 (새 아이템 추가시 사용)
 */
export function getNextZIndex<T extends LayerItem>(items: T[]): number {
  if (items.length === 0) return 0
  return Math.max(...items.map((item) => item.zIndex)) + 1
}

/**
 * zIndex 순서로 정렬된 배열 반환
 */
export function sortByZIndex<T extends LayerItem>(items: T[]): T[] {
  return [...items].sort((a, b) => a.zIndex - b.zIndex)
}

/**
 * 선택한 아이템을 맨 앞으로 이동 (최상위 레이어)
 */
export function bringToFront<T extends LayerItem>(items: T[], targetId: string): T[] {
  const target = items.find((item) => item.id === targetId)
  if (!target) return items

  const maxZIndex = Math.max(...items.map((item) => item.zIndex))
  if (target.zIndex === maxZIndex) return items

  return items.map((item) =>
    item.id === targetId ? { ...item, zIndex: maxZIndex + 1 } : item
  )
}

/**
 * 선택한 아이템을 맨 뒤로 이동 (최하위 레이어)
 */
export function sendToBack<T extends LayerItem>(items: T[], targetId: string): T[] {
  const target = items.find((item) => item.id === targetId)
  if (!target) return items

  const minZIndex = Math.min(...items.map((item) => item.zIndex))
  if (target.zIndex === minZIndex) return items

  return items.map((item) =>
    item.id === targetId ? { ...item, zIndex: minZIndex - 1 } : item
  )
}

/**
 * 선택한 아이템을 한 단계 앞으로 이동
 */
export function bringForward<T extends LayerItem>(items: T[], targetId: string): T[] {
  const target = items.find((item) => item.id === targetId)
  if (!target) return items

  // zIndex 기준 정렬
  const sorted = sortByZIndex(items)
  const targetIndex = sorted.findIndex((item) => item.id === targetId)

  // 이미 맨 앞이면 변경 없음
  if (targetIndex === sorted.length - 1) return items

  // 바로 앞 아이템과 zIndex 교환
  const nextItem = sorted[targetIndex + 1]!

  return items.map((item) => {
    if (item.id === targetId) return { ...item, zIndex: nextItem.zIndex }
    if (item.id === nextItem.id) return { ...item, zIndex: target.zIndex }
    return item
  })
}

/**
 * 선택한 아이템을 한 단계 뒤로 이동
 */
export function sendBackward<T extends LayerItem>(items: T[], targetId: string): T[] {
  const target = items.find((item) => item.id === targetId)
  if (!target) return items

  // zIndex 기준 정렬
  const sorted = sortByZIndex(items)
  const targetIndex = sorted.findIndex((item) => item.id === targetId)

  // 이미 맨 뒤면 변경 없음
  if (targetIndex === 0) return items

  // 바로 뒤 아이템과 zIndex 교환
  const prevItem = sorted[targetIndex - 1]!

  return items.map((item) => {
    if (item.id === targetId) return { ...item, zIndex: prevItem.zIndex }
    if (item.id === prevItem.id) return { ...item, zIndex: target.zIndex }
    return item
  })
}

/**
 * 아이템을 특정 위치로 이동 (드래그 앤 드롭용)
 * @param items 아이템 배열
 * @param fromId 이동할 아이템 ID
 * @param toIndex 이동할 위치 인덱스 (역순 정렬 기준, 0이 맨 위)
 */
export function reorderToPosition<T extends LayerItem>(
  items: T[],
  fromId: string,
  toIndex: number
): T[] {
  if (items.length <= 1) return items

  // 역순 정렬 (높은 zIndex가 앞)
  const sorted = [...sortByZIndex(items)].reverse()
  const fromIndex = sorted.findIndex((item) => item.id === fromId)

  if (fromIndex === -1 || fromIndex === toIndex) return items

  // 새로운 순서로 배열 재구성
  const newOrder = [...sorted]
  const [movedItem] = newOrder.splice(fromIndex, 1)
  newOrder.splice(toIndex, 0, movedItem!)

  // zIndex 재할당 (역순이므로 큰 값부터)
  const maxZIndex = newOrder.length - 1
  return items.map((item) => {
    const newIndex = newOrder.findIndex((o) => o.id === item.id)
    return { ...item, zIndex: maxZIndex - newIndex }
  })
}
