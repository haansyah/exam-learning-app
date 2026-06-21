<script setup lang="ts">
const route = useRoute()
const subjectId = route.params.id as string

const manifest = await useSubjectManifest()
const subject = manifest.value?.find(entry => entry.id === subjectId)

if (!subject) {
  throw createError({ statusCode: 404, statusMessage: 'Subject not found' })
}

const historyStore = useHistoryStore()
const subjectAttempts = computed(() => historyStore.attemptsBySubject(subjectId))

useSeoMeta({
  title: `History — ${subject.name}`
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
      {{ subject.name }} — History
    </h1>

    <SubjectScoreChart
      v-if="subjectAttempts.length > 0"
      :attempts="subjectAttempts"
      :pass-threshold="subject.passThreshold"
    />

    <HistoryList
      :attempts="subjectAttempts"
      :subjects="manifest ?? []"
    />
  </UContainer>
</template>
