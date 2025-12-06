import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  validateFurnitureEdit,
  validateDoorEdit,
  applyFurnitureEdit,
  applyDoorEdit,
} from '~/utils/objectEdit'

// 오브젝트 편집 유틸리티 테스트
describe('오브젝트 편집 유틸리티', () => {
  describe('가구 편집 유효성 검사', () => {
    it('이름이 빈 문자열이면 에러 반환', () => {
      const result = validateFurnitureEdit({
        name: '',
        width: 100,
        height: 60,
        color: '#6366f1',
        rotation: 0,
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('이름을 입력해주세요')
    })

    it('이름이 공백만 있으면 에러 반환', () => {
      const result = validateFurnitureEdit({
        name: '   ',
        width: 100,
        height: 60,
        color: '#6366f1',
        rotation: 0,
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('이름을 입력해주세요')
    })

    it('너비가 0 이하면 에러 반환', () => {
      const result = validateFurnitureEdit({
        name: '소파',
        width: 0,
        height: 60,
        color: '#6366f1',
        rotation: 0,
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('너비는 양수여야 합니다')
    })

    it('너비가 음수면 에러 반환', () => {
      const result = validateFurnitureEdit({
        name: '소파',
        width: -50,
        height: 60,
        color: '#6366f1',
        rotation: 0,
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('너비는 양수여야 합니다')
    })

    it('높이가 0 이하면 에러 반환', () => {
      const result = validateFurnitureEdit({
        name: '소파',
        width: 100,
        height: 0,
        color: '#6366f1',
        rotation: 0,
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('높이는 양수여야 합니다')
    })

    it('높이가 음수면 에러 반환', () => {
      const result = validateFurnitureEdit({
        name: '소파',
        width: 100,
        height: -30,
        color: '#6366f1',
        rotation: 0,
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('높이는 양수여야 합니다')
    })

    it('회전 값이 유효하지 않으면 에러 반환', () => {
      const result = validateFurnitureEdit({
        name: '소파',
        width: 100,
        height: 60,
        color: '#6366f1',
        rotation: 45, // 0, 90, 180, 270만 허용
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('회전은 0, 90, 180, 270 중 하나여야 합니다')
    })

    it('유효한 가구 데이터는 통과', () => {
      const result = validateFurnitureEdit({
        name: '소파',
        width: 100,
        height: 60,
        color: '#6366f1',
        rotation: 90,
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('여러 에러를 동시에 반환', () => {
      const result = validateFurnitureEdit({
        name: '',
        width: -10,
        height: 0,
        color: '#6366f1',
        rotation: 45,
      })
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('문 편집 유효성 검사', () => {
    it('너비가 0 이하면 에러 반환', () => {
      const result = validateDoorEdit({
        width: 0,
        openDirection: 'inside',
        hingeSide: 'left',
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('너비는 양수여야 합니다')
    })

    it('너비가 음수면 에러 반환', () => {
      const result = validateDoorEdit({
        width: -30,
        openDirection: 'inside',
        hingeSide: 'left',
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('너비는 양수여야 합니다')
    })

    it('유효한 문 데이터는 통과', () => {
      const result = validateDoorEdit({
        width: 90,
        openDirection: 'outside',
        hingeSide: 'right',
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('가구 편집 적용', () => {
    it('가구 속성을 업데이트한다', () => {
      const furniture = {
        id: 'test-1',
        name: '소파',
        x: 100,
        y: 100,
        width: 200,
        height: 90,
        color: '#6366f1',
        rotation: 0,
      }

      const editData = {
        name: '새 소파',
        width: 250,
        height: 100,
        color: '#ff0000',
        rotation: 90,
      }

      const result = applyFurnitureEdit(furniture, editData)

      expect(result.name).toBe('새 소파')
      expect(result.width).toBe(250)
      expect(result.height).toBe(100)
      expect(result.color).toBe('#ff0000')
      expect(result.rotation).toBe(90)
      // 위치는 유지
      expect(result.x).toBe(100)
      expect(result.y).toBe(100)
      expect(result.id).toBe('test-1')
    })
  })

  describe('문 편집 적용', () => {
    it('문 속성을 업데이트한다', () => {
      const door = {
        id: 'door-1',
        x: 100,
        y: 0,
        width: 90,
        wall: 'bottom' as const,
        openDirection: 'inside' as const,
        hingeSide: 'left' as const,
      }

      const editData = {
        width: 100,
        openDirection: 'outside' as const,
        hingeSide: 'right' as const,
      }

      const result = applyDoorEdit(door, editData)

      expect(result.width).toBe(100)
      expect(result.openDirection).toBe('outside')
      expect(result.hingeSide).toBe('right')
      // 위치와 벽은 유지
      expect(result.x).toBe(100)
      expect(result.wall).toBe('bottom')
      expect(result.id).toBe('door-1')
    })
  })
})
