<template>
  <!-- 벽/가구까지의 거리선 -->
  <template v-for="dist in distanceLines" :key="dist.id">
    <!-- 거리선 -->
    <v-line
      :config="{
        points: dist.points,
        stroke: dist.color,
        strokeWidth: 1,
        dash: [4, 4],
      }"
    />
    <!-- 거리 텍스트 -->
    <v-text
      :config="{
        text: `${dist.distance}cm`,
        fontSize: 11,
        fill: dist.color,
        fontStyle: 'bold',
        x: dist.textX,
        y: dist.textY,
        offsetX: dist.offsetX || 0,
        offsetY: dist.offsetY || 0,
      }"
    />
  </template>
</template>

<script setup lang="ts">
import type { DistanceLine } from '~/types/editor'

// Props
defineProps<{
  distanceLines: DistanceLine[]
}>()
</script>
