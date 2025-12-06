import { shallowRef, computed } from 'vue'

interface UseHistoryOptions {
  maxHistory?: number
}

export function useHistory<T>(options: UseHistoryOptions = {}) {
  const { maxHistory = 50 } = options

  const undoStack = shallowRef<T[]>([])
  const redoStack = shallowRef<T[]>([])

  const canUndo = computed(() => undoStack.value.length > 1)
  const canRedo = computed(() => redoStack.value.length > 0)

  const currentState = computed(() => {
    if (undoStack.value.length === 0) return undefined
    return undoStack.value[undoStack.value.length - 1]
  })

  // 깊은 복사
  const deepClone = (obj: T): T => {
    return JSON.parse(JSON.stringify(obj))
  }

  // 상태 저장
  const pushState = (state: T) => {
    const newStack = [...undoStack.value, deepClone(state)]

    // 최대 개수 초과 시 오래된 항목 삭제
    if (newStack.length > maxHistory) {
      newStack.shift()
    }

    undoStack.value = newStack
    // 새 상태 저장 시 redo 스택 초기화
    redoStack.value = []
  }

  // Undo
  const undo = (): T | undefined => {
    if (!canUndo.value) return undefined

    const newUndoStack = [...undoStack.value]
    const current = newUndoStack.pop()
    if (current) {
      redoStack.value = [...redoStack.value, current]
    }
    undoStack.value = newUndoStack

    if (newUndoStack.length > 0) {
      const lastItem = newUndoStack[newUndoStack.length - 1]
      return lastItem !== undefined ? deepClone(lastItem) : undefined
    }
    return undefined
  }

  // Redo
  const redo = (): T | undefined => {
    if (!canRedo.value) return undefined

    const newRedoStack = [...redoStack.value]
    const state = newRedoStack.pop()
    if (state) {
      undoStack.value = [...undoStack.value, state]
      redoStack.value = newRedoStack
      return deepClone(state)
    }

    return undefined
  }

  // 히스토리 초기화
  const clear = () => {
    undoStack.value = []
    redoStack.value = []
  }

  return {
    canUndo,
    canRedo,
    currentState,
    pushState,
    undo,
    redo,
    clear,
  }
}
