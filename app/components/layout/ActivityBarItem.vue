<template>
  <button
    class="relative w-10 h-10 flex items-center justify-center rounded transition-colors group"
    :class="[
      active
        ? 'bg-gray-700 text-white'
        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
    ]"
    @click="$emit('click')"
  >
    <!-- 활성화 표시 바 -->
    <div
      v-if="active"
      class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r"
    />

    <!-- 아이콘 -->
    <component :is="iconComponent" class="w-5 h-5" />

    <!-- 툴팁 -->
    <div
      class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none"
    >
      {{ label }}
      <div class="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'

const props = defineProps<{
  icon: string
  label: string
  active?: boolean
}>()

defineEmits<{
  click: []
}>()

const iconComponent = computed(() => {
  switch (props.icon) {
    case 'furniture':
      return {
        render: () => h('svg', {
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          class: 'w-5 h-5'
        }, [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
          })
        ])
      }
    case 'layers':
      return {
        render: () => h('svg', {
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          class: 'w-5 h-5'
        }, [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
          })
        ])
      }
    case 'history':
      return {
        render: () => h('svg', {
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          class: 'w-5 h-5'
        }, [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
          })
        ])
      }
    case 'settings':
      return {
        render: () => h('svg', {
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          class: 'w-5 h-5'
        }, [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
          }),
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          })
        ])
      }
    default:
      return {
        render: () => h('div', { class: 'w-5 h-5 bg-current rounded' })
      }
  }
})
</script>
