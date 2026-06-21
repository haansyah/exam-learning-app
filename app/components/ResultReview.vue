<script setup lang="ts">
import type { ExamAttempt, Question, SubjectManifestEntry } from '~/types/exam'
import { formatDuration } from '~/utils/exam'

const props = defineProps<{
  attempt: ExamAttempt
  questions: Question[]
  subject?: SubjectManifestEntry
  readOnly?: boolean
}>()

const questionMap = computed(() => new Map(props.questions.map(q => [q.id, q])))

function getOptionText(question: Question | undefined, optionId: string | null) {
  if (!optionId) {
    return '—'
  }
  if (!question) {
    return optionId
  }

  const option = question.options.find(entry => entry.id === optionId)
  if (!option) {
    return optionId
  }

  const letter = getOptionLetterById(question, optionId)
  return letter ? formatOptionLabel(letter, option.text) : option.text
}

function getQuestionText(questionId: string) {
  return questionMap.value.get(questionId)?.text ?? 'Question unavailable'
}

function getExplanation(questionId: string) {
  return questionMap.value.get(questionId)?.explanation
}
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <div class="flex flex-wrap items-center gap-4">
        <div>
          <p class="text-sm text-muted">
            Score
          </p>
          <p class="text-3xl font-bold">
            {{ attempt.scorePercent }}%
          </p>
        </div>
        <div>
          <p class="text-sm text-muted">
            Time taken
          </p>
          <p class="text-lg font-medium">
            {{ formatDuration(attempt.durationSeconds) }}
          </p>
        </div>
        <UBadge
          :color="attempt.passed ? 'success' : 'error'"
          variant="subtle"
          size="lg"
        >
          {{ attempt.passed ? 'Passed' : 'Failed' }}
        </UBadge>
        <p
          v-if="subject"
          class="text-sm text-muted"
        >
          Pass threshold: {{ subject.passThreshold }}%
        </p>
      </div>
    </UCard>

    <div class="space-y-4">
      <h2 class="text-xl font-semibold">
        Question Review
      </h2>

      <UCard
        v-for="(response, index) in attempt.responses"
        :key="response.questionId"
        :class="{
          'ring-2 ring-warning/50': response.wasSkipped,
          'ring-2 ring-error/30': !response.wasSkipped && !response.isCorrect,
          'ring-2 ring-success/30': response.isCorrect
        }"
      >
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-2">
            <p class="font-medium">
              {{ index + 1 }}. {{ getQuestionText(response.questionId) }}
            </p>
            <UBadge
              v-if="response.wasSkipped"
              color="warning"
              variant="subtle"
            >
              Skipped
            </UBadge>
            <UBadge
              v-else-if="response.isCorrect"
              color="success"
              variant="subtle"
            >
              Correct
            </UBadge>
            <UBadge
              v-else
              color="error"
              variant="subtle"
            >
              Wrong
            </UBadge>
          </div>

          <div class="text-sm space-y-1">
            <p>
              <span class="text-muted">Your answer:</span>
              {{ response.wasSkipped ? 'Not answered' : getOptionText(questionMap.get(response.questionId), response.selectedOptionId) }}
            </p>
            <p v-if="!response.isCorrect">
              <span class="text-muted">Correct answer:</span>
              {{ getOptionText(questionMap.get(response.questionId), questionMap.get(response.questionId)?.correctOptionId ?? null) }}
            </p>
          </div>

          <p
            v-if="getExplanation(response.questionId)"
            class="text-sm text-muted"
          >
            {{ getExplanation(response.questionId) }}
          </p>
        </div>
      </UCard>
    </div>

    <div
      v-if="!readOnly"
      class="flex flex-wrap gap-3"
    >
      <UButton
        v-if="subject"
        :to="`/subjects/${subject.id}`"
        color="primary"
      >
        Retry Exam
      </UButton>
      <UButton
        to="/"
        variant="outline"
        color="neutral"
      >
        Back to Home
      </UButton>
    </div>
  </div>
</template>
