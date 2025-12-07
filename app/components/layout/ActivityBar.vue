<template>
  <nav class="w-12 bg-gray-800 flex flex-col items-center py-2 shrink-0">
    <!-- 상단 아이콘 그룹 -->
    <div class="flex flex-col gap-1">
      <LayoutActivityBarItem
        v-for="item in topItems"
        :key="item.id"
        :icon="item.icon"
        :label="item.label"
        :active="activePanel === item.id"
        @click="onItemClick(item.id)"
      />
    </div>

    <!-- 하단 아이콘 그룹 -->
    <div class="mt-auto flex flex-col gap-1">
      <LayoutActivityBarItem
        v-for="item in bottomItems"
        :key="item.id"
        :icon="item.icon"
        :label="item.label"
        :active="activePanel === item.id"
        @click="onItemClick(item.id)"
      />
    </div>
  </nav>
</template>

<script setup lang="ts">
export type PanelId = 'furniture' | 'layers' | 'history' | 'settings'

interface ActivityItem {
  id: PanelId
  icon: string
  label: string
}

const props = defineProps<{
  activePanel: PanelId
}>()

const emit = defineEmits<{
  'update:activePanel': [panel: PanelId]
}>()

const topItems: ActivityItem[] = [
  { id: 'furniture', icon: 'furniture', label: '가구 라이브러리' },
  { id: 'layers', icon: 'layers', label: '레이어' },
  { id: 'history', icon: 'history', label: '히스토리' },
]

const bottomItems: ActivityItem[] = [
  { id: 'settings', icon: 'settings', label: '설정' },
]

const onItemClick = (id: PanelId) => {
  emit('update:activePanel', id)
}
</script>
