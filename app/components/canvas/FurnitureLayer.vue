<template>
  <!-- 가구들 -->
  <v-group
    v-for="furniture in furnitureList"
    :key="furniture.id"
    :ref="(el: any) => setFurnitureRef(furniture.id, el)"
    :config="getFurnitureGroupConfig(furniture)"
    @dragstart="(e: any) => emit('dragstart', furniture, e)"
    @dragmove="(e: any) => emit('dragmove', furniture, e)"
    @dragend="(e: any) => emit('dragend', furniture, e)"
    @click="(e: any) => emit('select', furniture, e)"
    @dblclick="emit('dblclick', furniture)"
    @transformend="(e: any) => emit('transformend', furniture, e)"
  >
    <!-- 다중 선택 표시용 배경 -->
    <v-rect
      v-if="isMultiSelected(furniture.id)"
      :config="{
        x: -4,
        y: -4,
        width: furniture.width * scale + 8,
        height: furniture.height * scale + 8,
        stroke: '#22c55e',
        strokeWidth: 2,
        dash: [6, 3],
        cornerRadius: 6,
        listening: false,
      }"
    />
    <!-- 사각형 (기본) -->
    <v-rect
      v-if="!furniture.shape || furniture.shape === 'rect'"
      :config="{
        width: furniture.width * scale,
        height: furniture.height * scale,
        fill: furniture.color,
        stroke: isMultiSelected(furniture.id) ? '#22c55e' : '#374151',
        strokeWidth: isMultiSelected(furniture.id) ? 2 : 1,
        cornerRadius: 4,
      }"
    />
    <!-- 원형 -->
    <v-circle
      v-else-if="furniture.shape === 'circle'"
      :config="{
        x: (furniture.width * scale) / 2,
        y: (furniture.height * scale) / 2,
        radius: Math.min(furniture.width, furniture.height) * scale / 2,
        fill: furniture.color,
        stroke: isMultiSelected(furniture.id) ? '#22c55e' : '#374151',
        strokeWidth: isMultiSelected(furniture.id) ? 2 : 1,
      }"
    />
    <!-- 타원형 -->
    <v-ellipse
      v-else-if="furniture.shape === 'ellipse'"
      :config="{
        x: (furniture.width * scale) / 2,
        y: (furniture.height * scale) / 2,
        radiusX: (furniture.width * scale) / 2,
        radiusY: (furniture.height * scale) / 2,
        fill: furniture.color,
        stroke: isMultiSelected(furniture.id) ? '#22c55e' : '#374151',
        strokeWidth: isMultiSelected(furniture.id) ? 2 : 1,
      }"
    />
    <!-- L자형 -->
    <v-line
      v-else-if="furniture.shape === 'l-shape'"
      :config="getLShapeConfig(furniture)"
    />
    <!-- 가구 이름 -->
    <v-text
      :config="getFurnitureTextConfig(furniture)"
    />
    <!-- 가로 치수 (상단 내부 테두리) -->
    <v-text
      :config="{
        text: `${furniture.width}cm`,
        fontSize: 10,
        fill: '#374151',
        x: (furniture.width * scale) / 2,
        y: 4,
        offsetX: 15,
      }"
    />
    <!-- 세로 치수 (좌측 내부 테두리) -->
    <v-text
      :config="{
        text: `${furniture.height}cm`,
        fontSize: 10,
        fill: '#374151',
        x: 4,
        y: (furniture.height * scale) / 2,
        rotation: -90,
        offsetX: 15,
      }"
    />
  </v-group>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Furniture } from '~/types/furniture'

// Props
const props = defineProps<{
  furnitureList: Furniture[]
  scale: number
  multiSelectedIds: string[]
}>()

// Emits
const emit = defineEmits<{
  dragstart: [furniture: Furniture, e: any]
  dragmove: [furniture: Furniture, e: any]
  dragend: [furniture: Furniture, e: any]
  select: [furniture: Furniture, e: any]
  dblclick: [furniture: Furniture]
  transformend: [furniture: Furniture, e: any]
}>()

// Furniture refs map (for Transformer)
const furnitureRefs = ref<Map<string, any>>(new Map())

const setFurnitureRef = (id: string, el: any) => {
  if (el) {
    furnitureRefs.value.set(id, el)
  } else {
    furnitureRefs.value.delete(id)
  }
}

// 다중 선택 확인
const isMultiSelected = (furnitureId: string) => {
  return props.multiSelectedIds.includes(furnitureId)
}

// 가구 그룹 설정
const getFurnitureGroupConfig = (furniture: Furniture) => {
  return {
    x: furniture.x + (furniture.width * props.scale) / 2,
    y: furniture.y + (furniture.height * props.scale) / 2,
    offsetX: (furniture.width * props.scale) / 2,
    offsetY: (furniture.height * props.scale) / 2,
    rotation: furniture.rotation,
    draggable: true,
    name: `furniture-${furniture.id}`,
    zIndex: furniture.zIndex,
  }
}

// L자형 가구 config 생성
const getLShapeConfig = (furniture: Furniture) => {
  const w = furniture.width * props.scale
  const h = furniture.height * props.scale
  const ratioW = furniture.lShapeRatioW ?? furniture.lShapeRatio ?? 0.5
  const ratioH = furniture.lShapeRatioH ?? furniture.lShapeRatio ?? 0.5
  const direction = furniture.lShapeDirection || 'bottom-right'

  let points: number[] = []
  const cutW = w * ratioW
  const cutH = h * ratioH

  switch (direction) {
    case 'bottom-right':
      points = [0, cutH, cutW, cutH, cutW, 0, w, 0, w, h, 0, h]
      break
    case 'bottom-left':
      points = [0, 0, w - cutW, 0, w - cutW, cutH, w, cutH, w, h, 0, h]
      break
    case 'top-right':
      points = [0, 0, w, 0, w, h - cutH, w - cutW, h - cutH, w - cutW, h, 0, h]
      break
    case 'top-left':
      points = [0, 0, w, 0, w, h, cutW, h, cutW, h - cutH, 0, h - cutH]
      break
  }

  return {
    points,
    fill: furniture.color,
    stroke: '#374151',
    strokeWidth: 1,
    closed: true,
  }
}

// 가구 이름 텍스트 config
const getFurnitureTextConfig = (furniture: Furniture) => {
  const w = furniture.width * props.scale
  const h = furniture.height * props.scale

  if (furniture.shape !== 'l-shape') {
    return {
      text: furniture.name,
      fontSize: 12,
      fill: '#ffffff',
      width: w,
      height: h,
      align: 'center',
      verticalAlign: 'middle',
      padding: 4,
    }
  }

  const ratioW = furniture.lShapeRatioW ?? furniture.lShapeRatio ?? 0.5
  const ratioH = furniture.lShapeRatioH ?? furniture.lShapeRatio ?? 0.5
  const direction = furniture.lShapeDirection || 'bottom-right'
  const cutH = h * ratioH

  let textX = 0
  let textY = 0
  let textW = w
  let textH = h

  switch (direction) {
    case 'bottom-right':
    case 'bottom-left':
      textX = 0
      textY = cutH
      textW = w
      textH = h - cutH
      break
    case 'top-right':
    case 'top-left':
      textX = 0
      textY = 0
      textW = w
      textH = h - cutH
      break
  }

  return {
    text: furniture.name,
    fontSize: 12,
    fill: '#ffffff',
    x: textX,
    y: textY,
    width: textW,
    height: textH,
    align: 'center',
    verticalAlign: 'middle',
    padding: 4,
  }
}

// Expose refs for parent component
defineExpose({
  furnitureRefs,
  setFurnitureRef,
})
</script>
