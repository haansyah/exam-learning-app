<script setup lang="ts">
const route = useRoute()
const subjectId = route.params.id as string
const attemptId = route.params.attemptId as string

const manifest = await useSubjectManifest()
const subject = manifest.value?.find(entry => entry.id === subjectId)

if (!subject) {
  throw createError({ statusCode: 404, statusMessage: 'Subject not found' })
}

const historyStore = useHistoryStore()
const attempt = historyStore.getAttemptById(attemptId)

if (!attempt || attempt.subjectId !== subjectId) {
  throw createError({ statusCode: 404, statusMessage: 'Attempt not found' })
}

const questionData = await useSubjectQuestions(subject.questionFile)

useSeoMeta({
  title: `Result — ${subject.name}`
})
</script>

<template>
  <UContainer class="py-8 space-y-6 max-w-3xl">
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
  </UContainer>
</template>
