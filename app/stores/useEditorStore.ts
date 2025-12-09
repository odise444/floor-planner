import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ToolType, ModeType } from '~/types/editor'

export const useEditorStore = defineStore('editor', () => {
  // ========== 도구 상태 ==========

  // 활성 도구
  const activeTool = ref<ToolType>('select')

  // 현재 모드
  const mode = ref<ModeType>('normal')

  // ========== 모드 플래그 ==========

  // 측정 모드
  const isMeasureMode = ref(false)

  // 벽체 그리기 모드
  const isWallDrawMode = ref(false)

  // 폴리곤 뷰 모드
  const showPolygonView = ref(false)

  // ========== 뷰 상태 ==========

  // 줌 레벨
  const zoom = ref(1)

  // 팬 위치
  const panX = ref(0)
  const panY = ref(0)

  // 팬 중 여부
  const isPanning = ref(false)

  // 마지막 포인터 위치
  const lastPointerPos = ref<{ x: number; y: number } | null>(null)

  // ========== UI 상태 ==========

  // 그리드 표시
  const showGrid = ref(true)

  // 눈금자 표시
  const showRuler = ref(false)

  // 스냅 활성화
  const snapEnabled = ref(true)

  // ========== 모달/폼 상태 ==========

  // 방 생성 모달
  const showRoomModal = ref(false)

  // 문 추가 모달
  const showDoorModal = ref(false)

  // 가구 편집 폼
  const showEditForm = ref(false)

  // 방 편집 폼
  const showRoomEditForm = ref(false)

  // 벽체 편집 폼
  const showWallEditForm = ref(false)

  // ========== 벽체 그리기 상태 ==========

  // 벽체 그리기 시작점
  const wallDrawStart = ref<{ x: number; y: number } | null>(null)

  // 벽체 그리기 프리뷰
  const wallDrawPreview = ref<{
    startX: number
    startY: number
    endX: number
    endY: number
  } | null>(null)

  // ========== Computed ==========

  // 현재 줌 퍼센트
  const zoomPercent = computed(() => Math.round(zoom.value * 100))

  // 편집 모드인지
  const isEditMode = computed(() => {
    return isMeasureMode.value || isWallDrawMode.value
  })

  // ========== 액션 (Actions) ==========

  // 도구 변경
  function setActiveTool(tool: ToolType) {
    activeTool.value = tool

    // 도구에 따른 모드 변경
    if (tool === 'measure') {
      isMeasureMode.value = true
      isWallDrawMode.value = false
    } else if (tool === 'wall') {
      isWallDrawMode.value = true
      isMeasureMode.value = false
    } else {
      isMeasureMode.value = false
      isWallDrawMode.value = false
    }
  }

  // 측정 모드 토글
  function toggleMeasureMode() {
    isMeasureMode.value = !isMeasureMode.value
    if (isMeasureMode.value) {
      isWallDrawMode.value = false
      activeTool.value = 'measure'
    } else {
      activeTool.value = 'select'
    }
  }

  // 벽체 그리기 모드 토글
  function toggleWallDrawMode() {
    isWallDrawMode.value = !isWallDrawMode.value
    if (isWallDrawMode.value) {
      isMeasureMode.value = false
      activeTool.value = 'wall'
    } else {
      activeTool.value = 'select'
      wallDrawStart.value = null
      wallDrawPreview.value = null
    }
  }

  // 폴리곤 뷰 토글
  function togglePolygonView() {
    showPolygonView.value = !showPolygonView.value
  }

  // 줌 인
  function zoomIn() {
    const newZoom = zoom.value * 1.2
    zoom.value = Math.min(newZoom, 3)
  }

  // 줌 아웃
  function zoomOut() {
    const newZoom = zoom.value / 1.2
    zoom.value = Math.max(newZoom, 0.3)
  }

  // 줌 설정
  function setZoom(value: number) {
    zoom.value = Math.max(0.3, Math.min(3, value))
  }

  // 팬 시작
  function startPanning(x: number, y: number) {
    isPanning.value = true
    lastPointerPos.value = { x, y }
  }

  // 팬 종료
  function stopPanning() {
    isPanning.value = false
    lastPointerPos.value = null
  }

  // 뷰 리셋
  function resetView() {
    zoom.value = 1
    panX.value = 0
    panY.value = 0
  }

  // 모달 열기/닫기
  function openRoomModal() {
    showRoomModal.value = true
  }

  function closeRoomModal() {
    showRoomModal.value = false
  }

  function openDoorModal() {
    showDoorModal.value = true
  }

  function closeDoorModal() {
    showDoorModal.value = false
  }

  // 편집 폼 열기/닫기
  function openEditForm() {
    showEditForm.value = true
  }

  function closeEditForm() {
    showEditForm.value = false
  }

  function openRoomEditForm() {
    showRoomEditForm.value = true
  }

  function closeRoomEditForm() {
    showRoomEditForm.value = false
  }

  function openWallEditForm() {
    showWallEditForm.value = true
  }

  function closeWallEditForm() {
    showWallEditForm.value = false
  }

  // 모든 모달/폼 닫기
  function closeAllModals() {
    showRoomModal.value = false
    showDoorModal.value = false
    showEditForm.value = false
    showRoomEditForm.value = false
    showWallEditForm.value = false
  }

  // 모든 모드 종료
  function exitAllModes() {
    isMeasureMode.value = false
    isWallDrawMode.value = false
    wallDrawStart.value = null
    wallDrawPreview.value = null
    activeTool.value = 'select'
  }

  // 벽체 그리기 시작점 설정
  function setWallDrawStart(pos: { x: number; y: number } | null) {
    wallDrawStart.value = pos
  }

  // 벽체 그리기 프리뷰 설정
  function setWallDrawPreview(preview: {
    startX: number
    startY: number
    endX: number
    endY: number
  } | null) {
    wallDrawPreview.value = preview
  }

  return {
    // 도구 State
    activeTool,
    mode,

    // 모드 플래그
    isMeasureMode,
    isWallDrawMode,
    showPolygonView,

    // 뷰 State
    zoom,
    panX,
    panY,
    isPanning,
    lastPointerPos,

    // UI State
    showGrid,
    showRuler,
    snapEnabled,

    // 모달/폼 State
    showRoomModal,
    showDoorModal,
    showEditForm,
    showRoomEditForm,
    showWallEditForm,

    // 벽체 그리기 State
    wallDrawStart,
    wallDrawPreview,

    // Computed
    zoomPercent,
    isEditMode,

    // 도구 Actions
    setActiveTool,
    toggleMeasureMode,
    toggleWallDrawMode,
    togglePolygonView,

    // 줌/팬 Actions
    zoomIn,
    zoomOut,
    setZoom,
    startPanning,
    stopPanning,
    resetView,

    // 모달 Actions
    openRoomModal,
    closeRoomModal,
    openDoorModal,
    closeDoorModal,

    // 편집 폼 Actions
    openEditForm,
    closeEditForm,
    openRoomEditForm,
    closeRoomEditForm,
    openWallEditForm,
    closeWallEditForm,
    closeAllModals,

    // 모드 Actions
    exitAllModes,

    // 벽체 그리기 Actions
    setWallDrawStart,
    setWallDrawPreview,
  }
})
