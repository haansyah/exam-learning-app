<script setup lang="ts">
const manifest = await useSubjectManifest()
const historyStore = useHistoryStore()

const questionCounts = ref<Record<string, number>>({})

if (manifest.value) {
  await Promise.all(
    manifest.value.map(async (subject) => {
      const data = await useSubjectQuestions(subject.questionFile)
      questionCounts.value[subject.id] = data.value?.questions.length ?? 0
    })
  )
}

useSeoMeta({
  title: 'Exam Learning App',
  description: 'Practice exams with instant feedback and progress tracking'
})
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold">
          Exam Learning
        </h1>
        <p class="text-muted mt-1">
          Choose a subject to start practicing
        </p>
      </div>
      <UButton
        to="/history"
        icon="i-lucide-history"
        variant="outline"
        color="neutral"
      >
        History
      </UButton>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <UCard
        v-for="subject in manifest"
        :key="subject.id"
        class="hover:ring-2 hover:ring-primary/30 transition-all"
      >
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-2">
            <h2 class="text-xl font-semibold">
              {{ subject.name }}
            </h2>
            <UBadge
              v-if="historyStore.bestScoreForSubject(subject.id) !== null"
              color="primary"
              variant="subtle"
            >
              Best: {{ historyStore.bestScoreForSubject(subject.id) }}%
            </UBadge>
          </div>
          <p class="text-sm text-muted line-clamp-2">
            {{ subject.description }}
          </p>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">
              {{ questionCounts[subject.id] ?? '…' }} questions
            </span>
            <UButton
              :to="`/subjects/${subject.id}`"
              color="primary"
              size="sm"
            >
              View
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
