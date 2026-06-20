<script setup lang="ts">
definePageMeta({
  ssr: false
})

const route = useRoute()
const router = useRouter()
const subjectId = route.params.id as string
const shuffleQuery = route.query.shuffle === '1'

const manifest = await useSubjectManifest()
const subject = manifest.value?.find(entry => entry.id === subjectId)

if (!subject) {
  throw createError({ statusCode: 404, statusMessage: 'Subject not found' })
}

const questionData = await useSubjectQuestions(subject.questionFile)
const examStore = useExamStore()
const historyStore = useHistoryStore()
const pendingResultStore = usePendingResultStore()

const questionCount = computed(() => questionData.value?.questions.length ?? 0)
const timeLimitSeconds = computed(() =>
  resolveTimeLimitSeconds(questionCount.value, subject.timeLimitMinutes)
)

onMounted(() => {
  if (!examStore.isActive || examStore.subjectId !== subjectId) {
    examStore.startExam(
      subjectId,
      subject.passThreshold,
      questionData.value?.questions ?? [],
      shuffleQuery,
      timeLimitSeconds.value
    )
  }
})

onUnmounted(() => {
  if (examStore.phase === 'complete') {
    examStore.resetSession()
  }
})

function goToResults() {
  const attempt = examStore.buildAttempt()
  if (!attempt) {
    return
  }

  historyStore.addAttempt(attempt)
  pendingResultStore.set(attempt)
  router.replace(`/subjects/${subjectId}/result/${attempt.attemptId}`)
}

watch(
  () => examStore.phase,
  (phase) => {
    if (phase === 'complete') {
      goToResults()
    }
  }
)

useSeoMeta({
  title: `Exam — ${subject.name}`
})
</script>

<template>
  <UContainer class="py-6 space-y-4 max-w-3xl">
    <template v-if="examStore.phase === 'exam'">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <UBadge
          color="neutral"
          variant="subtle"
          size="lg"
        >
          Question {{ examStore.progressLabel }}
        </UBadge>
        <ExamTimer :seconds-remaining="examStore.timerSecondsRemaining" />
      </div>

      <ExamQuestionCard
        v-if="examStore.currentQuestion && examStore.currentState"
        :question="examStore.currentQuestion"
        :selected-option-id="examStore.currentState.selectedOptionId"
        :checked="examStore.currentState.checked"
        :correct-option-id="examStore.currentQuestion.correctOptionId"
        @select="examStore.selectOption"
      />

      <div class="flex flex-wrap gap-3">
        <UButton
          v-if="!examStore.currentState?.checked"
          color="primary"
          :disabled="!examStore.canCheckAnswer"
          @click="examStore.checkAnswer"
        >
          Check Answer
        </UButton>
        <UButton
          v-else
          color="primary"
          icon="i-lucide-arrow-right"
          @click="examStore.goNext"
        >
          {{ examStore.isLastQuestion ? 'Finish' : 'Next' }}
        </UButton>
      </div>
    </template>

    <template v-else-if="examStore.phase === 'complete'">
      <div class="flex items-center justify-center py-16">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-8 animate-spin text-muted"
        />
        <span class="sr-only">Loading results…</span>
      </div>
    </template>

    <template v-else-if="examStore.phase === 'skipped-summary'">
      <UCard>
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-clock-alert"
              class="size-6 text-warning"
            />
            <h2 class="text-xl font-semibold">
              Time's up!
            </h2>
          </div>
          <p class="text-muted">
            The following questions were not answered and marked as skipped:
          </p>
          <ul class="list-disc pl-5 space-y-1">
            <li
              v-for="question in examStore.skippedQuestions"
              :key="question.id"
            >
              {{ question.text }}
            </li>
          </ul>
          <UButton
            color="primary"
            @click="examStore.continueAfterSkippedSummary"
          >
            View Results
          </UButton>
        </div>
      </UCard>
    </template>
  </UContainer>
</template>
