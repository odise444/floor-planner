<template>
  <!-- 방 렌더링 -->
  <v-rect
    v-if="room"
    ref="roomRectRef"
    :config="{
      x: room.x,
      y: room.y,
      width: room.width,
      height: room.height,
      fill: '#ffffff',
      stroke: isSelected ? '#3b82f6' : '#374151',
      strokeWidth: isSelected ? 4 : 3,
      opacity: room.opacity,
      name: 'room',
    }"
    @mousedown="emit('mousedown', $event)"
    @click="emit('click')"
    @dblclick="emit('dblclick')"
    @transformend="emit('transformend', $event)"
  />

  <!-- 치수선 표시 -->
  <template v-if="room">
    <!-- 가로 치수 -->
    <v-text
      :config="{
        x: room.x + room.width / 2,
        y: room.y - 25,
        text: `${Math.round(room.width / scale)}cm`,
        fontSize: 14,
        fill: '#374151',
        align: 'center',
        offsetX: 25,
      }"
    />
    <!-- 세로 치수 -->
    <v-text
      :config="{
        x: room.x - 25,
        y: room.y + room.height / 2,
        text: `${Math.round(room.height / scale)}cm`,
        fontSize: 14,
        fill: '#374151',
        align: 'center',
        rotation: -90,
        offsetX: 25,
      }"
    />
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Room } from '~/types/room'

// Props
defineProps<{
  room: Room | null
  scale: number
  isSelected: boolean
}>()

// Emits
const emit = defineEmits<{
  mousedown: [e: any]
  click: []
  dblclick: []
  transformend: [e: any]
}>()

// Refs (expose to parent for Transformer)
const roomRectRef = ref<any>(null)

defineExpose({
  roomRectRef,
})
</script>
