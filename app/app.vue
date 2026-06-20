<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

const needRefresh = ref(false)
const updateServiceWorker = ref<(() => Promise<void>) | undefined>()

if (import.meta.client) {
  const { needRefresh: refresh, updateServiceWorker: update } = useRegisterSW({
    onNeedRefresh() {
      needRefresh.value = true
    }
  })
  watch(refresh, value => { needRefresh.value = value }, { immediate: true })
  updateServiceWorker.value = update
}

function refreshApp() {
  updateServiceWorker.value?.()
}

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'Exam Learning App',
  description: 'Practice exams with instant feedback and progress tracking',
  ogTitle: 'Exam Learning App',
  ogDescription: 'Practice exams with instant feedback and progress tracking'
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="font-bold text-lg"
        >
          ExamLearn
        </NuxtLink>
      </template>

      <template #right>
        <UButton
          to="/history"
          icon="i-lucide-history"
          variant="ghost"
          color="neutral"
          aria-label="History"
        />
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Exam Learning App • {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>

    <div
      v-if="needRefresh"
      class="fixed bottom-4 right-4 z-50 max-w-sm"
    >
      <UAlert
        color="primary"
        variant="subtle"
        title="Update available"
        description="New content is ready. Refresh to get the latest version."
        :actions="[
          {
            label: 'Refresh',
            color: 'primary',
            onClick: refreshApp
          }
        ]"
      />
    </div>
  </UApp>
</template>
