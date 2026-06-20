import manifest from './public/data/manifest.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vite-pwa/nuxt'
  ],

  ssr: true,

  nitro: {
    preset: 'static',
    prerender: {
      routes: [
        '/history',
        ...manifest.flatMap(subject => [
          `/subjects/${subject.id}`,
          `/subjects/${subject.id}/history`
        ])
      ]
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css', 'katex/dist/katex.min.css'],

  routeRules: {
    '/**': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  pwa: {
    registerType: 'prompt',
    manifest: {
      name: 'Exam Learning App',
      short_name: 'ExamLearn',
      description: 'Practice exams with instant feedback and progress tracking',
      theme_color: '#18181b',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
      navigateFallback: '/'
    },
    client: {
      installPrompt: true
    }
  }
})
