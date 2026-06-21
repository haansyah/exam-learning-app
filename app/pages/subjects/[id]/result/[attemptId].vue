<script setup lang="ts">
definePageMeta({
  ssr: false
})

const route = useRoute()
const subjectId = route.params.id as string
const attemptId = route.params.attemptId as string

const manifest = await useSubjectManifest()
const subject = manifest.value?.find(entry => entry.id === subjectId)

if (!subject) {
  throw createError({ statusCode: 404, statusMessage: 'Subject not found' })
}

const pendingResultStore = usePendingResultStore()
const historyStore = useHistoryStore()
const freshAttempt = pendingResultStore.take(attemptId)
const attempt = freshAttempt
  ?? historyStore.getAttemptById(attemptId)
  ?? null

const questionData = await useSubjectQuestions(subject.questionFile)

onMounted(() => {
  if (freshAttempt?.passed) {
    playPassSound()
  }
})

useSeoMeta({
  title: `Result — ${subject.name}`
})
</script>

<template>
  <UContainer class="py-8 space-y-6 max-w-3xl">
    <template v-if="attempt">
      <UButton
        :to="`/subjects/${subjectId}`"
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        size="sm"
      >
        Back to Subject
      </UButton>

      <h1 class="text-3xl font-bold">
        {{ subject.name }} — Results
      </h1>

      <ResultReview
        :attempt="attempt"
        :questions="questionData?.questions ?? []"
        :subject="subject"
      />
    </template>

    <UCard v-else>
      <div class="space-y-4 text-center py-8">
        <UIcon
          name="i-lucide-file-question"
          class="size-10 mx-auto text-muted"
        />
        <p class="text-muted">
          This result was not found. It may have been cleared from this browser.
        </p>
        <UButton
          :to="`/subjects/${subjectId}`"
          color="primary"
        >
          Back to Subject
        </UButton>
      </div>
    </UCard>
  </UContainer>
</template>
