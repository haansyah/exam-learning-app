<script setup lang="ts">
const manifest = await useSubjectManifest()
const historyStore = useHistoryStore()

useSeoMeta({
  title: 'History',
  description: 'View all your past exam attempts'
})
</script>

<template>
  <UContainer class="py-8 space-y-6 max-w-3xl">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold">
        History
      </h1>
      <p class="text-sm text-muted">
        Attempts are saved locally in this browser. Clearing browser data or switching devices will remove your history.
      </p>
    </div>

    <HistoryList
      :attempts="historyStore.sortedAttempts"
      :subjects="manifest ?? []"
    />
  </UContainer>
</template>
