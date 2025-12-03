<template>
  <div class="h-screen flex flex-col bg-gray-100">
    <!-- 헤더 -->
    <header class="h-14 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
      <h1 class="text-lg font-semibold text-gray-800">이사할 때</h1>
      <div class="ml-auto flex items-center gap-2">
        <button class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
          저장
        </button>
        <button class="px-3 py-1.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded">
          내보내기
        </button>
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <div class="flex-1 flex overflow-hidden">
      <slot />
    </div>
  </div>
</template>
