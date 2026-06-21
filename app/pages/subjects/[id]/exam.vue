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

const subjectMeta = subject

const questionData = await useSubjectQuestions(subject.questionFile)
const examStore = useExamStore()
const historyStore = useHistoryStore()
const pendingResultStore = usePendingResultStore()
const examDraftStore = useExamDraftStore()

const questionCount = computed(() => questionData.value?.questions.length ?? 0)
const timeLimitSeconds = computed(() =>
  resolveTimeLimitSeconds(questionCount.value, subjectMeta.timeLimitMinutes)
)

const unlockStatus = computed(() =>
  getEnglishLevelUnlockStatus(
    subjectId,
    manifest.value ?? [],
    historyStore.hasPassedSubject
  )
)

function initializeExam() {
  if (!unlockStatus.value.unlocked) {
    router.replace(`/subjects/${subjectId}`)
    return
  }

  if (examStore.hasResumableSession(subjectId)) {
    examStore.resumeExam()
    return
  }

  const draft = examDraftStore.getDraft(subjectId)
  if (draft) {
    examStore.restoreFromDraft(draft)
    examStore.resumeExam()
    return
  }

  examStore.startExam(
    subjectId,
    subjectMeta.passThreshold,
    questionData.value?.questions ?? [],
    shuffleQuery,
    timeLimitSeconds.value
  )
}

function pauseAndLeave() {
  if (examStore.isActive) {
    examStore.pauseExam()
  }
  router.push(`/subjects/${subjectId}`)
}

function handleBeforeUnload() {
  if (examStore.isActive) {
    examStore.pauseExam()
  }
}

onMounted(() => {
  initializeExam()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)

  if (examStore.phase === 'complete') {
    examStore.resetSession()
  } else if (examStore.isActive) {
    examStore.pauseExam()
  }
})

function handleCheckAnswer() {
  const question = examStore.currentQuestion
  const selectedOptionId = examStore.currentState?.selectedOptionId

  if (!question || !selectedOptionId) {
    return
  }

  examStore.checkAnswer()

  if (selectedOptionId === question.correctOptionId) {
    playCorrectAnswerSound()
  } else {
    playIncorrectAnswerSound()
  }
}

function goToResults() {
  const attempt = examStore.buildAttempt()
  if (!attempt) {
    return
  }

  examDraftStore.clearDraft(subjectId)
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
  title: `Exam — ${subjectMeta.name}`
})
</script>

<template>
  <UContainer class="py-6 space-y-4 max-w-3xl">
    <template v-if="examStore.phase === 'exam'">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            icon="i-lucide-arrow-left"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="pauseAndLeave"
          >
            Keluar
          </UButton>
          <UBadge
            color="neutral"
            variant="subtle"
            size="lg"
          >
            Question {{ examStore.progressLabel }}
          </UBadge>
        </div>
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
          :class="examStore.canCheckAnswer ? 'bg-primary' : 'opacity-20 bg-neutral/10'"
          :color="examStore.canCheckAnswer ? 'primary' : 'neutral'"
          :disabled="!examStore.canCheckAnswer"
          @click="handleCheckAnswer"
        >
          {{ examStore.canCheckAnswer ? 'Check Answer' : 'Select Answer First' }}
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
