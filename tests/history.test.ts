import { describe, it, expect, beforeEach } from 'vitest'
import { useHistory } from '~/composables/useHistory'

describe('useHistory', () => {
  describe('기본 동작', () => {
    it('초기 상태에서 undo/redo 불가능해야 함', () => {
      const { canUndo, canRedo } = useHistory()
      expect(canUndo.value).toBe(false)
      expect(canRedo.value).toBe(false)
    })

    it('상태 저장 후 undo 가능해야 함', () => {
      const { pushState, canUndo } = useHistory<{ value: number }>()

      pushState({ value: 1 })
      pushState({ value: 2 })

      expect(canUndo.value).toBe(true)
    })

    it('undo 실행 시 이전 상태를 반환해야 함', () => {
      const { pushState, undo } = useHistory<{ value: number }>()

      pushState({ value: 1 })
      pushState({ value: 2 })
      pushState({ value: 3 })

      const state = undo()
      expect(state).toEqual({ value: 2 })
    })

    it('undo 후 redo 가능해야 함', () => {
      const { pushState, undo, canRedo } = useHistory<{ value: number }>()

      pushState({ value: 1 })
      pushState({ value: 2 })
      undo()

      expect(canRedo.value).toBe(true)
    })

    it('redo 실행 시 다음 상태를 반환해야 함', () => {
      const { pushState, undo, redo } = useHistory<{ value: number }>()

      pushState({ value: 1 })
      pushState({ value: 2 })
      pushState({ value: 3 })

      undo() // -> 2
      undo() // -> 1

      const state = redo()
      expect(state).toEqual({ value: 2 })
    })

    it('새 상태 저장 시 redo 스택이 초기화되어야 함', () => {
      const { pushState, undo, canRedo } = useHistory<{ value: number }>()

      pushState({ value: 1 })
      pushState({ value: 2 })
      undo()

      expect(canRedo.value).toBe(true)

      pushState({ value: 3 })

      expect(canRedo.value).toBe(false)
    })
  })

  describe('히스토리 제한', () => {
    it('최대 개수를 초과하면 오래된 상태가 삭제되어야 함', () => {
      const { pushState, undo } = useHistory<{ value: number }>({ maxHistory: 3 })

      pushState({ value: 1 })
      pushState({ value: 2 })
      pushState({ value: 3 })
      pushState({ value: 4 })

      // 최대 3개이므로 1은 삭제됨
      undo() // -> 3
      undo() // -> 2
      const state = undo() // -> undefined (1은 삭제됨)

      expect(state).toBeUndefined()
    })
  })

  describe('초기화', () => {
    it('clear 호출 시 모든 히스토리가 삭제되어야 함', () => {
      const { pushState, clear, canUndo, canRedo } = useHistory<{ value: number }>()

      pushState({ value: 1 })
      pushState({ value: 2 })

      clear()

      expect(canUndo.value).toBe(false)
      expect(canRedo.value).toBe(false)
    })
  })

  describe('현재 상태', () => {
    it('현재 상태를 반환해야 함', () => {
      const { pushState, currentState } = useHistory<{ value: number }>()

      pushState({ value: 1 })
      pushState({ value: 2 })

      expect(currentState.value).toEqual({ value: 2 })
    })

    it('undo 후 현재 상태가 변경되어야 함', () => {
      const { pushState, undo, currentState } = useHistory<{ value: number }>()

      pushState({ value: 1 })
      pushState({ value: 2 })
      undo()

      expect(currentState.value).toEqual({ value: 1 })
    })
  })

  describe('깊은 복사', () => {
    it('저장된 상태는 원본과 독립적이어야 함', () => {
      const { pushState, undo } = useHistory<{ arr: number[] }>()

      const original = { arr: [1, 2, 3] }
      pushState(original)

      original.arr.push(4)
      pushState(original)

      const restored = undo()
      expect(restored).toEqual({ arr: [1, 2, 3] })
    })
  })
})
