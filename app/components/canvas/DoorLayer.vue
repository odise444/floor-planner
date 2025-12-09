<template>
  <v-group
    v-for="door in doors"
    :key="door.id"
    :config="getDoorGroupConfig(door)"
    @click="(e: any) => emit('select', door, e)"
    @dblclick="emit('dblclick', door)"
    @dragend="(e: any) => emit('dragend', door, e)"
  >
    <!-- 문 프레임 (벽 끊김 표시) -->
    <v-rect
      :config="{
        width: door.wall === 'top' || door.wall === 'bottom' ? door.width * scale : 10,
        height: door.wall === 'left' || door.wall === 'right' ? door.width * scale : 10,
        fill: '#ffffff',
        stroke: isMultiSelected(door.id) ? '#22c55e' : (selectedDoorId === door.id ? '#3b82f6' : '#374151'),
        strokeWidth: isMultiSelected(door.id) || selectedDoorId === door.id ? 2 : 1,
      }"
    />
    <!-- 다중 선택 표시용 외곽선 -->
    <v-rect
      v-if="isMultiSelected(door.id)"
      :config="{
        x: -4,
        y: -4,
        width: (door.wall === 'top' || door.wall === 'bottom' ? door.width * scale : 10) + 8,
        height: (door.wall === 'left' || door.wall === 'right' ? door.width * scale : 10) + 8,
        stroke: '#22c55e',
        strokeWidth: 2,
        dash: [6, 3],
        listening: false,
      }"
    />
    <!-- 문 열림 호 (arc) -->
    <v-arc
      :config="getDoorArcConfig(door)"
    />
    <!-- 문 패널 -->
    <v-line
      :config="getDoorPanelConfig(door)"
    />
    <!-- 문 크기 표시 -->
    <v-text
      :config="{
        text: `${door.width}`,
        fontSize: 10,
        fill: '#374151',
        x: door.wall === 'top' || door.wall === 'bottom' ? (door.width * scale) / 2 - 10 : -15,
        y: door.wall === 'left' || door.wall === 'right' ? (door.width * scale) / 2 - 5 : -15,
      }"
    />
  </v-group>
</template>

<script setup lang="ts">
import type { Door } from '~/types/door'
import type { Room } from '~/types/room'
import { getDoorArcConfig as getDoorArcConfigUtil } from '~/utils/door'

// Props
const props = defineProps<{
  doors: Door[]
  room: Room | null
  scale: number
  selectedDoorId: string | null
  multiSelectedIds: string[]
}>()

// Emits
const emit = defineEmits<{
  select: [door: Door, e: any]
  dblclick: [door: Door]
  dragend: [door: Door, e: any]
}>()

// 다중 선택 확인
const isMultiSelected = (doorId: string) => {
  return props.multiSelectedIds.includes(doorId)
}

// 문 그룹 설정 (위치 + 드래그)
const getDoorGroupConfig = (door: Door) => {
  if (!props.room) return { x: 0, y: 0, draggable: true }
  const r = props.room

  let x = 0
  let y = 0

  switch (door.wall) {
    case 'top':
      x = r.x + door.x * props.scale
      y = r.y - 5
      break
    case 'bottom':
      x = r.x + door.x * props.scale
      y = r.y + r.height - 5
      break
    case 'left':
      x = r.x - 5
      y = r.y + door.y * props.scale
      break
    case 'right':
      x = r.x + r.width - 5
      y = r.y + door.y * props.scale
      break
  }

  return { x, y, draggable: true }
}

// 문 열림 호(arc) 설정
const getDoorArcConfig = (door: Door) => {
  const dw = door.width * props.scale
  const config = getDoorArcConfigUtil(door.wall, door.openDirection, door.hingeSide, dw)

  return {
    x: config.x,
    y: config.y,
    innerRadius: 0,
    outerRadius: dw,
    angle: 90,
    rotation: config.rotation,
    clockwise: false,
    fill: 'transparent',
    stroke: '#6b7280',
    strokeWidth: 1,
    dash: [4, 4],
  }
}

// 문 패널(열린 문) 설정
const getDoorPanelConfig = (door: Door) => {
  const dw = door.width * props.scale
  const arcConfig = getDoorArcConfig(door)

  const cx = arcConfig.x
  const cy = arcConfig.y

  const angleRad = ((arcConfig.rotation + 45) * Math.PI) / 180
  const endX = cx + dw * Math.cos(angleRad)
  const endY = cy + dw * Math.sin(angleRad)

  return {
    points: [cx, cy, endX, endY],
    stroke: '#374151',
    strokeWidth: 2,
  }
}
</script>
