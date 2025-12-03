// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  ssr: false, // vue-konva는 클라이언트 전용

  app: {
    head: {
      title: '이사할 때 - 평면도 제작 도구',
      meta: [
        { name: 'description', content: '이사 전 가구 배치를 시뮬레이션하세요' }
      ],
    }
  }
})
