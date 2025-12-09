<template>
  <!-- 그룹 바운딩 박스 -->
  <template v-for="group in groups" :key="group.id">
    <v-rect
      :config="{
        x: group.x,
        y: group.y,
        width: group.width,
        height: group.height,
        fill: 'transparent',
        stroke: selectedGroupId === group.id ? '#8b5cf6' : group.color,
        strokeWidth: selectedGroupId === group.id ? 3 : 2,
        dash: [8, 4],
        cornerRadius: 4,
        draggable: !group.locked,
        name: `group-${group.id}`,
      }"
      @click="(e: any) => emit('click', group, e)"
      @dragstart="(e: any) => emit('dragstart', e, group)"
      @dragend="(e: any) => emit('dragend', e, group)"
    />
    <!-- 그룹 라벨 -->
    <v-text
      :config="{
        x: group.x,
        y: group.y - 18,
        text: group.name,
        fontSize: 12,
        fill: selectedGroupId === group.id ? '#8b5cf6' : group.color,
        fontStyle: 'bold',
      }"
    />
  </template>
</template>

<script setup lang="ts">
import type { ObjectGroup } from '~/utils/group'

// Props
defineProps<{
  groups: ObjectGroup[]
  selectedGroupId: string | null
}>()

// Emits
const emit = defineEmits<{
  click: [group: ObjectGroup, e: any]
  dragstart: [e: any, group: ObjectGroup]
  dragend: [e: any, group: ObjectGroup]
}>()
</script>
