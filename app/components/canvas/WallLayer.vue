<template>
  <!-- 폴리곤 뷰 (연결된 벽체를 폴리곤으로 렌더링) -->
  <template v-if="showPolygonView">
    <template v-for="polygon in wallPolygons" :key="polygon.id">
      <v-line
        :config="getPolygonRenderConfig(polygon)"
      />
    </template>
  </template>

  <!-- 기존 벽체들 (폴리곤 뷰가 아닐 때만) -->
  <template v-if="!showPolygonView" v-for="wall in walls" :key="wall.id">
    <v-rect
      :config="{
        ...getWallRenderConfig(wall),
        draggable: selectedWallId === wall.id && !isWallDrawMode,
      }"
      @click="(e: any) => emit('click', wall, e)"
      @dblclick="emit('dblclick', wall)"
      @dragstart="(e: any) => emit('dragstart', e, wall)"
      @dragend="(e: any) => emit('dragend', e, wall)"
    />
    <!-- 벽체 길이 표시 -->
    <v-text
      :config="getWallLengthTextConfig(wall)"
    />
    <!-- 선택된 벽체의 끝점 핸들 -->
    <template v-if="selectedWallId === wall.id && !isWallDrawMode">
      <!-- 시작점 핸들 -->
      <v-circle
        :config="{
          x: wall.startX * scale,
          y: wall.startY * scale,
          radius: 8,
          fill: '#3b82f6',
          stroke: '#ffffff',
          strokeWidth: 2,
          draggable: true,
          name: 'wall-handle-start',
        }"
        @dragmove="(e: any) => emit('endpointDrag', e, wall, 'start')"
        @dragend="(e: any) => emit('endpointDragEnd', e, wall, 'start')"
      />
      <!-- 끝점 핸들 -->
      <v-circle
        :config="{
          x: wall.endX * scale,
          y: wall.endY * scale,
          radius: 8,
          fill: '#3b82f6',
          stroke: '#ffffff',
          strokeWidth: 2,
          draggable: true,
          name: 'wall-handle-end',
        }"
        @dragmove="(e: any) => emit('endpointDrag', e, wall, 'end')"
        @dragend="(e: any) => emit('endpointDragEnd', e, wall, 'end')"
      />
    </template>
  </template>

  <!-- 벽체 그리기 프리뷰 -->
  <v-line
    v-if="wallDrawPreview"
    :config="{
      points: [wallDrawPreview.startX, wallDrawPreview.startY, wallDrawPreview.endX, wallDrawPreview.endY],
      stroke: '#22c55e',
      strokeWidth: 15 * scale,
      lineCap: 'round',
      dash: [10, 5],
      opacity: 0.7,
    }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type Wall, type WallPolygon, getWallRenderRect, getWallLength, WALL_COLORS, findConnectedWallChains, wallsToPolygon } from '~/utils/wall'

// Props
const props = defineProps<{
  walls: Wall[]
  scale: number
  selectedWallId: string | null
  multiSelectedIds: string[]
  isWallDrawMode: boolean
  showPolygonView: boolean
  wallDrawPreview: {
    startX: number
    startY: number
    endX: number
    endY: number
  } | null
}>()

// Emits
const emit = defineEmits<{
  click: [wall: Wall, e: any]
  dblclick: [wall: Wall]
  dragstart: [e: any, wall: Wall]
  dragend: [e: any, wall: Wall]
  endpointDrag: [e: any, wall: Wall, endpoint: 'start' | 'end']
  endpointDragEnd: [e: any, wall: Wall, endpoint: 'start' | 'end']
}>()

// 다중 선택 확인
const isMultiSelected = (wallId: string) => {
  return props.multiSelectedIds.includes(wallId)
}

// 벽체 폴리곤 계산
const wallPolygons = computed((): WallPolygon[] => {
  if (!props.showPolygonView || props.walls.length === 0) return []

  const chains = findConnectedWallChains(props.walls)
  const polygons: WallPolygon[] = []

  chains.forEach((chain, index) => {
    const polygon = wallsToPolygon(chain)
    if (polygon) {
      polygons.push({
        ...polygon,
        id: `polygon-${index}`,
      })
    }
  })

  return polygons
})

// 벽체 렌더링 설정
const getWallRenderConfig = (wall: Wall) => {
  const rect = getWallRenderRect(wall, props.scale)
  const isSelected = props.selectedWallId === wall.id
  const isMulti = isMultiSelected(wall.id)

  let fillColor = wall.color || WALL_COLORS.interior
  let strokeColor = '#374151'
  let strokeWidth = 1

  if (isMulti) {
    strokeColor = '#22c55e'
    strokeWidth = 3
  } else if (isSelected) {
    fillColor = '#3b82f6'
    strokeColor = '#1d4ed8'
    strokeWidth = 2
  }

  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    rotation: rect.rotation,
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    dash: isMulti ? [8, 4] : undefined,
    offsetX: 0,
    offsetY: rect.height / 2,
  }
}

// 벽체 길이 텍스트 설정
const getWallLengthTextConfig = (wall: Wall) => {
  const length = getWallLength(wall)
  const midX = ((wall.startX + wall.endX) / 2) * props.scale
  const midY = ((wall.startY + wall.endY) / 2) * props.scale
  const angle = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX)
  const offsetY = -20

  return {
    x: midX + Math.sin(angle) * offsetY,
    y: midY - Math.cos(angle) * offsetY,
    text: `${Math.round(length)}cm`,
    fontSize: 12,
    fill: '#374151',
    align: 'center',
    offsetX: 20,
  }
}

// 폴리곤 렌더링 설정
const getPolygonRenderConfig = (polygon: WallPolygon) => {
  const s = props.scale

  const reversedInner: number[] = []
  for (let i = polygon.innerPoints.length - 2; i >= 0; i -= 2) {
    reversedInner.push(polygon.innerPoints[i]! * s, polygon.innerPoints[i + 1]! * s)
  }

  const outerScaled = polygon.outerPoints.map(p => p * s)
  const points = [...outerScaled, ...reversedInner]

  return {
    points,
    stroke: polygon.color,
    strokeWidth: 1,
    closed: true,
    fill: polygon.color,
    opacity: 0.8,
  }
}
</script>
