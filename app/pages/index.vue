<template>
  <div class="flex flex-1">
    <SidebarFurnitureLibrary @add-door="onAddDoor" />
    <EditorFloorPlanCanvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
const canvasRef = ref<any>(null)

// 전역 상태로 캔버스 참조 공유
const globalCanvasRef = useState<any>('canvasRef', () => null)

watch(canvasRef, (val) => {
  globalCanvasRef.value = val
}, { immediate: true })

const onAddDoor = () => {
  if (canvasRef.value?.room) {
    canvasRef.value.showDoorModal = true
  }
}

// 페이지 로드 시 저장된 데이터 불러오기
onMounted(() => {
  nextTick(() => {
    if (canvasRef.value?.loadFromLocalStorage) {
      canvasRef.value.loadFromLocalStorage()
    }
  })
})

useHead({
  title: '에디터 - 이사할 때',
})
</script>
