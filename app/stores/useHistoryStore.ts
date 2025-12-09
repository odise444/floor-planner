import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HistoryState } from '~/types/editor'

export const useHistoryStore = defineStore('history', () => {
  // ========== 상태 (State) ==========

  // Undo 스택
  const undoStack = ref<HistoryState[]>([])

  // Redo 스택
  const redoStack = ref<HistoryState[]>([])

  // 최대 히스토리 개수
  const maxHistory = 50

  // 히스토리 복원 중 여부 (자동 저장 방지용)
  const isRestoring = ref(false)

  // ========== Computed ==========

  // Undo 가능 여부
  const canUndo = computed(() => undoStack.value.length > 1)

  // Redo 가능 여부
  const canRedo = computed(() => redoStack.value.length > 0)

  // 현재 상태
  const currentState = computed(() => {
    if (undoStack.value.length === 0) return undefined
    return undoStack.value[undoStack.value.length - 1]
  })

  // 히스토리 개수
  const historyCount = computed(() => undoStack.value.length)

  // ========== 유틸리티 ==========

  // 깊은 복사
  function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }

  // ========== 액션 (Actions) ==========

  // 상태 저장
  function pushState(state: HistoryState) {
    // 복원 중이면 저장하지 않음
    if (isRestoring.value) return

    const clonedState = deepClone(state)
    const newStack = [...undoStack.value, clonedState]

    // 최대 개수 초과 시 오래된 항목 삭제
    if (newStack.length > maxHistory) {
      newStack.shift()
    }

    undoStack.value = newStack
    // 새 상태 저장 시 redo 스택 초기화
    redoStack.value = []
  }

  // Undo
  function undo(): HistoryState | undefined {
    if (!canUndo.value) return undefined

    isRestoring.value = true

    const newUndoStack = [...undoStack.value]
    const current = newUndoStack.pop()

    if (current) {
      redoStack.value = [...redoStack.value, current]
    }

    undoStack.value = newUndoStack

    let result: HistoryState | undefined

    if (newUndoStack.length > 0) {
      const lastItem = newUndoStack[newUndoStack.length - 1]
      result = lastItem !== undefined ? deepClone(lastItem) : undefined
    }

    // 다음 틱에서 복원 플래그 해제
    setTimeout(() => {
      isRestoring.value = false
    }, 0)

    return result
  }

  // Redo
  function redo(): HistoryState | undefined {
    if (!canRedo.value) return undefined

    isRestoring.value = true

    const newRedoStack = [...redoStack.value]
    const state = newRedoStack.pop()

    let result: HistoryState | undefined

    if (state) {
      undoStack.value = [...undoStack.value, state]
      redoStack.value = newRedoStack
      result = deepClone(state)
    }

    // 다음 틱에서 복원 플래그 해제
    setTimeout(() => {
      isRestoring.value = false
    }, 0)

    return result
  }

  // 히스토리 초기화
  function clear() {
    undoStack.value = []
    redoStack.value = []
  }

  // 복원 완료 표시 (수동 호출용)
  function finishRestoring() {
    isRestoring.value = false
  }

  return {
    // State
    undoStack,
    redoStack,
    isRestoring,

    // Computed
    canUndo,
    canRedo,
    currentState,
    historyCount,

    // Actions
    pushState,
    undo,
    redo,
    clear,
    finishRestoring,
  }
})
