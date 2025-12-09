<template>
  <!-- 완료된 측정들 -->
  <template v-for="m in measurements" :key="m.id">
    <v-line
      class="measurement-line"
      :config="{
        points: [m.start.x, m.start.y, m.end.x, m.end.y],
        stroke: '#ef4444',
        strokeWidth: 2,
        dash: [6, 4],
      }"
    />
    <!-- 시작점 -->
    <v-circle
      :config="{
        x: m.start.x,
        y: m.start.y,
        radius: 4,
        fill: '#ef4444',
      }"
    />
    <!-- 끝점 -->
    <v-circle
      :config="{
        x: m.end.x,
        y: m.end.y,
        radius: 4,
        fill: '#ef4444',
      }"
    />
    <!-- 거리 텍스트 -->
    <v-text
      :config="{
        x: (m.start.x + m.end.x) / 2,
        y: (m.start.y + m.end.y) / 2 - 12,
        text: formatDistance(m.distance, scale),
        fontSize: 14,
        fontStyle: 'bold',
        fill: '#ef4444',
        offsetX: 20,
      }"
    />
  </template>

  <!-- 현재 측정 중인 선 (시작점이 설정되고 마우스 이동 중) -->
  <template v-if="startPoint && currentPoint">
    <v-line
      :config="{
        points: [startPoint.x, startPoint.y, currentPoint.x, currentPoint.y],
        stroke: '#f97316',
        strokeWidth: 2,
        dash: [6, 4],
      }"
    />
    <!-- 시작점 -->
    <v-circle
      :config="{
        x: startPoint.x,
        y: startPoint.y,
        radius: 4,
        fill: '#f97316',
      }"
    />
    <!-- 현재 점 -->
    <v-circle
      :config="{
        x: currentPoint.x,
        y: currentPoint.y,
        radius: 4,
        fill: '#f97316',
      }"
    />
  </template>

  <!-- 시작점만 설정된 경우 -->
  <template v-else-if="startPoint">
    <v-circle
      :config="{
        x: startPoint.x,
        y: startPoint.y,
        radius: 5,
        fill: '#f97316',
        stroke: '#ffffff',
        strokeWidth: 2,
      }"
    />
  </template>
</template>

<script setup lang="ts">
import { formatDistance, type Measurement, type Point } from '~/utils/measureTool'

// Props
defineProps<{
  measurements: Measurement[]
  startPoint: Point | null
  currentPoint: Point | null
  scale: number
}>()
</script>
