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

const bestScore = computed(() => historyStore.bestScoreForSubject(subjectId))
const attemptCount = computed(() => historyStore.attemptCountForSubject(subjectId))

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
      <h1 class="text-3xl font-bold">
        {{ subject.name }}
      </h1>
      <p class="text-muted">
        {{ subject.description }}
      </p>
    </div>

    <UCard>
      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <p class="text-sm text-muted">
            Questions
          </p>
          <p class="text-xl font-semibold">
            {{ questionData?.questions.length ?? 0 }}
          </p>
        </div>
        <div>
          <p class="text-sm text-muted">
            Best score
          </p>
          <p class="text-xl font-semibold">
            {{ bestScore !== null ? `${bestScore}%` : '—' }}
          </p>
        </div>
        <div>
          <p class="text-sm text-muted">
            Attempts
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
