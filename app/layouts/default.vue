<template>
  <div class="h-screen flex flex-col bg-gray-100">
    <!-- 헤더 -->
    <header class="h-14 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
      <h1 class="text-lg font-semibold text-gray-800">이사할 때</h1>
      <div class="ml-auto flex items-center gap-2">
        <button
          class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
          @click="onNew"
        >
          새로 만들기
        </button>
        <button
          class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
          @click="onSave"
        >
          저장
        </button>
        <button
          class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
          @click="onLoadClick"
        >
          불러오기
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          class="hidden"
          @change="onFileSelected"
        />
        <div class="relative" @click.stop>
          <button
            class="px-3 py-1.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded flex items-center gap-1"
            @click="showExportMenu = !showExportMenu"
          >
            내보내기
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <!-- 내보내기 드롭다운 메뉴 -->
          <div
            v-if="showExportMenu"
            class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 min-w-[140px] z-50"
          >
            <button
              class="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              @click="onExportImage('png')"
            >
              PNG 이미지
            </button>
            <button
              class="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              @click="onExportImage('jpeg')"
            >
              JPEG 이미지
            </button>
            <hr class="my-1 border-gray-200" />
            <button
              class="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              @click="onExportJson"
            >
              JSON 파일
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <div class="flex-1 flex overflow-hidden">
      <slot />
    </div>

    <!-- 저장 완료 토스트 -->
    <Transition name="toast">
      <div
        v-if="showToast"
        class="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { importFromJson } from '~/utils/floorPlanStorage'

const showExportMenu = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// 전역 상태에서 캔버스 참조 가져오기
const canvasRef = useState<any>('canvasRef', () => null)

// 토스트 메시지 표시
const showToastMessage = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 새로 만들기
const onNew = () => {
  if (confirm('현재 작업을 초기화하시겠습니까?\n저장하지 않은 내용은 사라집니다.')) {
    if (canvasRef?.value) {
      canvasRef.value.room = null
      canvasRef.value.furnitureList = []
      canvasRef.value.doorList = []
      showToastMessage('초기화되었습니다')
    }
  }
}

// 저장
const onSave = () => {
  if (canvasRef?.value?.saveToLocalStorage) {
    canvasRef.value.saveToLocalStorage()
    showToastMessage('저장되었습니다')
  }
  showExportMenu.value = false
}

// 불러오기 버튼 클릭
const onLoadClick = () => {
  fileInputRef.value?.click()
}

// 파일 선택됨
const onFileSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const data = await importFromJson(file)
    if (canvasRef?.value) {
      canvasRef.value.room = data.room
      canvasRef.value.furnitureList = data.furnitureList || []
      canvasRef.value.doorList = data.doorList || []
      // 뷰를 방 위치에 맞춰 조정
      nextTick(() => {
        canvasRef.value?.resetViewToRoom?.()
      })
      showToastMessage('불러오기 완료')
    }
  } catch (err: any) {
    showToastMessage(err.message || '불러오기 실패')
  }

  // 파일 입력 초기화
  input.value = ''
}

// 이미지 내보내기
const onExportImage = (format: 'png' | 'jpeg') => {
  if (canvasRef?.value?.exportImage) {
    canvasRef.value.exportImage(format)
  }
  showExportMenu.value = false
}

// JSON 내보내기
const onExportJson = () => {
  if (canvasRef?.value?.exportJson) {
    canvasRef.value.exportJson()
  }
  showExportMenu.value = false
}

// 외부 클릭 시 메뉴 닫기
const onClickOutside = (e: MouseEvent) => {
  if (showExportMenu.value) {
    showExportMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
