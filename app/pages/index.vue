<template>
  <div class="flex flex-1">
    <SidebarFurnitureLibrary @add-door="onAddDoor" />
    <EditorFloorPlanCanvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
const canvasRef = ref<any>(null)

const onAddDoor = () => {
  if (canvasRef.value?.room) {
    canvasRef.value.showDoorModal = true
  }
}

useHead({
  title: '에디터 - 이사할 때',
})
</script>
