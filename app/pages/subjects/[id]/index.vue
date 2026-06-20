<script setup lang="ts">
const route = useRoute()
const subjectId = route.params.id as string

const manifest = await useSubjectManifest()
const subject = manifest.value?.find(entry => entry.id === subjectId)

if (!subject) {
  throw createError({ statusCode: 404, statusMessage: 'Subject not found' })
}

const questionData = await useSubjectQuestions(subject.questionFile)
const historyStore = useHistoryStore()

const shuffleEnabled = ref(false)

const questionCount = computed(() => questionData.value?.questions.length ?? 0)
const timeLimitMinutes = computed(() =>
  resolveTimeLimitMinutes(questionCount.value, subject.timeLimitMinutes)
)
const bestScore = computed(() => historyStore.bestScoreForSubject(subjectId))
const attemptCount = computed(() => historyStore.attemptCountForSubject(subjectId))
const hasPassed = computed(() =>
  historyStore.hasPassedSubject(subjectId, subject.passThreshold)
)

function startExam() {
  navigateTo({
    path: `/subjects/${subjectId}/exam`,
    query: shuffleEnabled.value ? { shuffle: '1' } : {}
  })
}

useSeoMeta({
  title: subject.name,
  description: subject.description
})
</script>

<template>
  <UContainer class="py-8 space-y-6 max-w-2xl">
    <UButton
      to="/"
      icon="i-lucide-arrow-left"
      variant="ghost"
      color="neutral"
      size="sm"
    >
      Back
    </UButton>

    <div class="space-y-2">
      <div class="flex items-start gap-2">
        <h1 class="text-3xl font-bold flex-1">
          {{ subject.name }}
        </h1>
        <UIcon
          v-if="hasPassed"
          name="i-lucide-star"
          class="size-7 shrink-0 text-warning fill-warning"
          title="Lulus — skor minimal tercapai"
        />
      </div>
      <p class="text-muted">
        {{ subject.description }}
      </p>
    </div>

    <UCard>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <p class="text-sm text-muted">
            Jumlah soal
          </p>
          <p class="text-xl font-semibold">
            {{ questionCount }}
          </p>
        </div>
        <div>
          <p class="text-sm text-muted">
            Batas waktu
          </p>
          <p class="text-xl font-semibold">
            {{ formatTimeLimit(timeLimitMinutes) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-muted">
            Skor minimal
          </p>
          <p class="text-xl font-semibold">
            {{ subject.passThreshold }}%
          </p>
        </div>
        <div>
          <p class="text-sm text-muted">
            Skor terbaik
          </p>
          <p class="text-xl font-semibold">
            {{ bestScore !== null ? `${bestScore}%` : '—' }}
          </p>
        </div>
        <div class="sm:col-span-2">
          <p class="text-sm text-muted">
            Percobaan
          </p>
          <p class="text-xl font-semibold">
            {{ attemptCount }}
          </p>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="font-medium">
            Shuffle questions & options
          </p>
          <p class="text-sm text-muted">
            Randomize order for this attempt
          </p>
        </div>
        <USwitch v-model="shuffleEnabled" />
      </div>
    </UCard>

    <div class="flex flex-wrap gap-3">
      <UButton
        color="primary"
        size="lg"
        icon="i-lucide-play"
        @click="startExam"
      >
        Start Exam
      </UButton>
      <UButton
        v-if="attemptCount > 0"
        :to="`/subjects/${subjectId}/history`"
        variant="outline"
        color="neutral"
        icon="i-lucide-history"
      >
        Subject History
      </UButton>
    </div>
  </UContainer>
</template>
