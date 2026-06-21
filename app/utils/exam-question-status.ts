import type { Question, QuestionSessionState } from '~/types/exam'

export type ExamQuestionStatus
  = 'unanswered'
    | 'skipped'
    | 'correct'
    | 'incorrect'
    | 'skipped-final'

export function getExamQuestionStatus(
  state: QuestionSessionState,
  correctOptionId: string
): ExamQuestionStatus {
  if (state.checked) {
    if (state.wasSkipped || state.selectedOptionId === null) {
      return 'skipped-final'
    }

    return state.selectedOptionId === correctOptionId ? 'correct' : 'incorrect'
  }

  if (state.wasSkipped) {
    return 'skipped'
  }

  return 'unanswered'
}

export function getExamQuestionStatusLabel(status: ExamQuestionStatus): string {
  switch (status) {
    case 'unanswered':
      return 'Belum dijawab'
    case 'skipped':
      return 'Dilewati'
    case 'correct':
      return 'Benar'
    case 'incorrect':
      return 'Salah'
    case 'skipped-final':
      return 'Dilewati'
  }
}

export function getExamQuestionStatusColor(status: ExamQuestionStatus): string {
  switch (status) {
    case 'unanswered':
      return 'neutral'
    case 'skipped':
    case 'skipped-final':
      return 'warning'
    case 'correct':
      return 'success'
    case 'incorrect':
      return 'error'
  }
}

export function buildExamQuestionStatuses(
  questions: Question[],
  questionStates: QuestionSessionState[]
): ExamQuestionStatus[] {
  const stateByQuestionId = new Map(
    questionStates.map(state => [state.questionId, state])
  )

  return questions.map((question) => {
    const state = stateByQuestionId.get(question.id)
    if (!state) {
      return 'unanswered'
    }

    return getExamQuestionStatus(state, question.correctOptionId)
  })
}
