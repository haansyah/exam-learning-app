<script setup lang="ts">
import type { ExamQuestionStatus } from '~/utils/exam-question-status'
import type { Question, QuestionSessionState } from '~/types/exam'
import {
  buildExamQuestionStatuses,
  getExamQuestionStatusColor,
  getExamQuestionStatusLabel
} from '~/utils/exam-question-status'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  questions: Question[]
  questionStates: QuestionSessionState[]
  currentIndex: number
}>()

const emit = defineEmits<{
  navigate: [index: number]
}>()

const statuses = computed(() =>
  buildExamQuestionStatuses(props.questions, props.questionStates)
)

const legendItems: ExamQuestionStatus[] = [
  'unanswered',
  'skipped',
  'correct',
  'incorrect'
]

function statusButtonClass(status: ExamQuestionStatus, index: number): string {
  const color = getExamQuestionStatusColor(status)
  const isCurrent = index === props.currentIndex

  const colorClass = {
    neutral: 'border-default bg-default/50 hover:border-primary/50',
    warning: 'border-warning/60 bg-warning/10 hover:border-warning',
    success: 'border-success/60 bg-success/10 hover:border-success',
    error: 'border-error/60 bg-error/10 hover:border-error'
  }[color]

  return [
    colorClass,
    isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-default' : ''
  ].filter(Boolean).join(' ')
}

function handleNavigate(index: number) {
  emit('navigate', index)
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Minimap Soal"
    description="Lihat status jawaban dan pindah ke soal lain."
  >
    <template #body>
      <div class="space-y-5">
        <div class="flex flex-wrap gap-3">
          <div
            v-for="status in legendItems"
            :key="status"
            class="flex items-center gap-2 text-sm text-muted"
          >
            <span
              class="size-3 rounded-full border"
              :class="{
                'border-default bg-default/50': status === 'unanswered',
                'border-warning/60 bg-warning/10': status === 'skipped',
                'border-success/60 bg-success/10': status === 'correct',
                'border-error/60 bg-error/10': status === 'incorrect'
              }"
            />
            <span>{{ getExamQuestionStatusLabel(status) }}</span>
          </div>
        </div>

        <div class="grid grid-cols-5 gap-2 sm:grid-cols-8">
          <button
            v-for="(status, index) in statuses"
            :key="questions[index]?.id ?? index"
            type="button"
            class="flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition-colors"
            :class="statusButtonClass(status, index)"
            :title="`Soal ${index + 1}: ${getExamQuestionStatusLabel(status)}`"
            @click="handleNavigate(index)"
          >
            {{ index + 1 }}
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>
