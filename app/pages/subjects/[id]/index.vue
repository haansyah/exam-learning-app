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
const examStore = useExamStore()
const examDraftStore = useExamDraftStore()

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

const unlockStatus = computed(() =>
  getEnglishLevelUnlockStatus(
    subjectId,
    manifest.value ?? [],
    historyStore.hasPassedSubject
  )
)

const lockMessage = computed(() => formatEnglishLevelLockMessage(unlockStatus.value))

const savedExamProgress = computed(() => {
  if (examStore.hasResumableSession(subjectId)) {
    return {
      progressLabel: examStore.progressLabel,
      timerSecondsRemaining: examStore.timerSecondsRemaining,
      shuffleEnabled: examStore.shuffleEnabled
    }
  }

  const draft = examDraftStore.getDraft(subjectId)
  if (!draft) {
    return null
  }

  const total = draft.questions.length
  const current = total === 0 ? 0 : draft.currentIndex + 1
  return {
    progressLabel: `${current} of ${total}`,
    timerSecondsRemaining: draft.timerSecondsRemaining,
    shuffleEnabled: draft.shuffleEnabled
  }
})

const hasSavedExam = computed(() => savedExamProgress.value !== null)

function startExam() {
  if (!unlockStatus.value.unlocked) {
    return
  }

  navigateTo({
    path: `/subjects/${subjectId}/exam`,
    query: shuffleEnabled.value ? { shuffle: '1' } : {}
  })
}

function continueExam() {
  if (!unlockStatus.value.unlocked || !hasSavedExam.value) {
    return
  }

  navigateTo(`/subjects/${subjectId}/exam`)
}

function restartExam() {
  if (!unlockStatus.value.unlocked) {
    return
  }

  examStore.resetSession()
  examDraftStore.clearDraft(subjectId)
  startExam()
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

    <UAlert
      v-if="!unlockStatus.unlocked"
      color="warning"
      icon="i-lucide-lock"
      :title="'Level terkunci'"
      :description="lockMessage"
    />

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
        <USwitch
          v-model="shuffleEnabled"
          :disabled="!unlockStatus.unlocked"
        />
      </div>
    </UCard>

    <UAlert
      v-if="hasSavedExam && unlockStatus.unlocked"
      color="info"
      icon="i-lucide-bookmark"
      title="Ujian belum selesai"
      :description="`Progress tersimpan: soal ${savedExamProgress?.progressLabel}, sisa waktu ${formatTimer(savedExamProgress?.timerSecondsRemaining ?? 0)}.`"
    />

    <UCard v-if="hasSavedExam && unlockStatus.unlocked">
      <div class="flex flex-wrap gap-3">
        <UButton
          color="primary"
          size="lg"
          icon="i-lucide-play"
          @click="continueExam"
        >
          Lanjutkan
        </UButton>
        <UButton
          variant="outline"
          color="neutral"
          size="lg"
          icon="i-lucide-rotate-ccw"
          @click="restartExam"
        >
          Mulai Ulang
        </UButton>
      </div>
    </UCard>

    <div class="flex flex-wrap gap-3">
      <UButton
        v-if="!hasSavedExam"
        color="primary"
        size="lg"
        :icon="unlockStatus.unlocked ? 'i-lucide-play' : 'i-lucide-lock'"
        :disabled="!unlockStatus.unlocked"
        @click="startExam"
        class="cursor-pointer"
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
