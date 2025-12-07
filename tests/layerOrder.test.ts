import { describe, it, expect } from 'vitest'
import {
  bringToFront,
  sendToBack,
  bringForward,
  sendBackward,
  sortByZIndex,
  getNextZIndex,
  type LayerItem,
} from '../app/utils/layerOrder'

describe('layerOrder', () => {
  // 테스트용 아이템 생성 헬퍼
  const createItem = (id: string, zIndex: number): LayerItem => ({ id, zIndex })

  describe('getNextZIndex', () => {
    it('빈 배열에서 0을 반환한다', () => {
      expect(getNextZIndex([])).toBe(0)
    })

    it('아이템이 있을 때 최대 zIndex + 1을 반환한다', () => {
      const items = [createItem('1', 0), createItem('2', 5), createItem('3', 3)]
      expect(getNextZIndex(items)).toBe(6)
    })
  })

  describe('sortByZIndex', () => {
    it('zIndex 순서로 정렬한다', () => {
      const items = [createItem('1', 2), createItem('2', 0), createItem('3', 1)]
      const sorted = sortByZIndex(items)
      expect(sorted.map((i) => i.id)).toEqual(['2', '3', '1'])
    })

    it('빈 배열을 처리한다', () => {
      expect(sortByZIndex([])).toEqual([])
    })
  })

  describe('bringToFront', () => {
    it('선택한 아이템을 맨 앞으로 이동한다', () => {
      const items = [createItem('1', 0), createItem('2', 1), createItem('3', 2)]
      const result = bringToFront(items, '1')
      const target = result.find((i) => i.id === '1')
      expect(target?.zIndex).toBe(3)
    })

    it('이미 맨 앞인 아이템은 그대로 유지한다', () => {
      const items = [createItem('1', 0), createItem('2', 1), createItem('3', 2)]
      const result = bringToFront(items, '3')
      const target = result.find((i) => i.id === '3')
      expect(target?.zIndex).toBe(2)
    })

    it('존재하지 않는 id는 원본을 반환한다', () => {
      const items = [createItem('1', 0), createItem('2', 1)]
      const result = bringToFront(items, 'unknown')
      expect(result).toEqual(items)
    })
  })

  describe('sendToBack', () => {
    it('선택한 아이템을 맨 뒤로 이동한다', () => {
      const items = [createItem('1', 0), createItem('2', 1), createItem('3', 2)]
      const result = sendToBack(items, '3')
      const target = result.find((i) => i.id === '3')
      const others = result.filter((i) => i.id !== '3')
      expect(target?.zIndex).toBe(-1)
      // 다른 아이템들의 zIndex는 유지됨
      expect(others.find((i) => i.id === '1')?.zIndex).toBe(0)
      expect(others.find((i) => i.id === '2')?.zIndex).toBe(1)
    })

    it('이미 맨 뒤인 아이템은 그대로 유지한다', () => {
      const items = [createItem('1', 0), createItem('2', 1), createItem('3', 2)]
      const result = sendToBack(items, '1')
      const target = result.find((i) => i.id === '1')
      expect(target?.zIndex).toBe(0)
    })
  })

  describe('bringForward', () => {
    it('선택한 아이템을 한 단계 앞으로 이동한다', () => {
      const items = [createItem('1', 0), createItem('2', 1), createItem('3', 2)]
      const result = bringForward(items, '1')
      const sorted = sortByZIndex(result)
      expect(sorted.map((i) => i.id)).toEqual(['2', '1', '3'])
    })

    it('이미 맨 앞인 아이템은 그대로 유지한다', () => {
      const items = [createItem('1', 0), createItem('2', 1), createItem('3', 2)]
      const result = bringForward(items, '3')
      expect(result.find((i) => i.id === '3')?.zIndex).toBe(2)
    })

    it('연속되지 않은 zIndex에서도 작동한다', () => {
      const items = [createItem('1', 0), createItem('2', 5), createItem('3', 10)]
      const result = bringForward(items, '1')
      const sorted = sortByZIndex(result)
      expect(sorted.map((i) => i.id)).toEqual(['2', '1', '3'])
    })
  })

  describe('sendBackward', () => {
    it('선택한 아이템을 한 단계 뒤로 이동한다', () => {
      const items = [createItem('1', 0), createItem('2', 1), createItem('3', 2)]
      const result = sendBackward(items, '3')
      const sorted = sortByZIndex(result)
      expect(sorted.map((i) => i.id)).toEqual(['1', '3', '2'])
    })

    it('이미 맨 뒤인 아이템은 그대로 유지한다', () => {
      const items = [createItem('1', 0), createItem('2', 1), createItem('3', 2)]
      const result = sendBackward(items, '1')
      expect(result.find((i) => i.id === '1')?.zIndex).toBe(0)
    })

    it('연속되지 않은 zIndex에서도 작동한다', () => {
      const items = [createItem('1', 0), createItem('2', 5), createItem('3', 10)]
      const result = sendBackward(items, '3')
      const sorted = sortByZIndex(result)
      expect(sorted.map((i) => i.id)).toEqual(['1', '3', '2'])
    })
  })
})
