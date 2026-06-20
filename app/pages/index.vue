<script setup lang="ts">
import type { SubjectCategory, SubjectManifestEntry } from '~/types/exam'

const manifest = await useSubjectManifest()
const historyStore = useHistoryStore()

const questionCounts = ref<Record<string, number>>({})
const timeLimits = ref<Record<string, number>>({})

if (manifest.value) {
  await Promise.all(
    manifest.value.map(async (subject) => {
      const data = await useSubjectQuestions(subject.questionFile)
      const count = data.value?.questions.length ?? 0
      questionCounts.value[subject.id] = count
      timeLimits.value[subject.id] = resolveTimeLimitMinutes(count, subject.timeLimitMinutes)
    })
  )
}

const sections: { id: SubjectCategory, title: string, description: string }[] = [
  {
    id: 'kuliah',
    title: 'Pembelajaran Kuliah',
    description: 'Latihan soal mata kuliah universitas dan materi akademik.'
  },
  {
    id: 'bahasa',
    title: 'Pembelajaran Bahasa',
    description: 'Latihan kosakata, tata bahasa, dan pemahaman bahasa.'
  }
]

const subjectsByCategory = computed(() => {
  const grouped: Record<SubjectCategory, SubjectManifestEntry[]> = {
    kuliah: [],
    bahasa: []
  }

  for (const subject of manifest.value ?? []) {
    grouped[subject.category].push(subject)
  }

  return grouped
})

function hasPassed(subject: SubjectManifestEntry) {
  return historyStore.hasPassedSubject(subject.id, subject.passThreshold)
}

useSeoMeta({
  title: 'Exam Learning App',
  description: 'Practice exams with instant feedback and progress tracking'
})
</script>

<template>
  <UContainer class="py-8 space-y-10">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold">
          Exam Learning
        </h1>
        <p class="text-muted mt-1">
          Pilih kategori pembelajaran untuk mulai berlatih
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

    <section
      v-for="section in sections"
      :key="section.id"
      class="space-y-4"
    >
      <div>
        <h2 class="text-2xl font-semibold">
          {{ section.title }}
        </h2>
        <p class="text-muted mt-1">
          {{ section.description }}
        </p>
      </div>

      <div
        v-if="subjectsByCategory[section.id].length > 0"
        class="grid gap-4 sm:grid-cols-2"
      >
        <UCard
          v-for="subject in subjectsByCategory[section.id]"
          :key="subject.id"
          class="hover:ring-2 hover:ring-primary/30 transition-all"
        >
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-1.5 min-w-0">
                <h3 class="text-xl font-semibold">
                  {{ subject.name }}
                </h3>
                <UIcon
                  v-if="hasPassed(subject)"
                  name="i-lucide-star"
                  class="size-5 shrink-0 mt-0.5 text-warning fill-warning"
                  title="Lulus"
                />
              </div>
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
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <span>{{ questionCounts[subject.id] ?? '…' }} soal</span>
              <span>{{ formatTimeLimit(timeLimits[subject.id] ?? 40) }}</span>
              <span>Min. {{ subject.passThreshold }}%</span>
            </div>
            <div class="flex items-center justify-end">
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

      <UCard
        v-else
        class="border-dashed"
      >
        <div class="py-6 text-center text-muted">
          <UIcon
            name="i-lucide-book-open"
            class="mx-auto mb-2 size-8 opacity-60"
          />
          <p>Belum ada mata pelajaran di kategori ini.</p>
        </div>
      </UCard>
    </section>
  </UContainer>
</template>
