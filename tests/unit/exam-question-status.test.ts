import { describe, expect, it } from 'vitest'
import type { QuestionSessionState } from '~/types/exam'
import {
  buildExamQuestionStatuses,
  getExamQuestionStatus,
  getExamQuestionStatusLabel
} from '~/utils/exam-question-status'

function createState(overrides: Partial<QuestionSessionState>): QuestionSessionState {
  return {
    questionId: 'q1',
    selectedOptionId: null,
    checked: false,
    wasSkipped: false,
    ...overrides
  }
}

describe('exam question status', () => {
  it('returns unanswered for fresh questions', () => {
    expect(getExamQuestionStatus(createState({}), 'a')).toBe('unanswered')
  })

  it('returns skipped for voluntarily skipped questions', () => {
    expect(getExamQuestionStatus(createState({ wasSkipped: true }), 'a')).toBe('skipped')
  })

  it('returns correct and incorrect for checked answers', () => {
    expect(getExamQuestionStatus(createState({
      checked: true,
      selectedOptionId: 'a'
    }), 'a')).toBe('correct')

    expect(getExamQuestionStatus(createState({
      checked: true,
      selectedOptionId: 'b'
    }), 'a')).toBe('incorrect')
  })

  it('returns skipped-final for locked skipped questions', () => {
    expect(getExamQuestionStatus(createState({
      checked: true,
      wasSkipped: true,
      selectedOptionId: null
    }), 'a')).toBe('skipped-final')
  })

  it('builds statuses in question order', () => {
    const questions = [
      { id: 'q1', correctOptionId: 'a' },
      { id: 'q2', correctOptionId: 'b' }
    ] as const

    const questionStates: QuestionSessionState[] = [
      createState({ questionId: 'q1', checked: true, selectedOptionId: 'a' }),
      createState({ questionId: 'q2', wasSkipped: true })
    ]

    expect(buildExamQuestionStatuses([...questions], questionStates)).toEqual([
      'correct',
      'skipped'
    ])
  })

  it('uses Indonesian labels for legend items', () => {
    expect(getExamQuestionStatusLabel('unanswered')).toBe('Belum dijawab')
    expect(getExamQuestionStatusLabel('skipped')).toBe('Dilewati')
    expect(getExamQuestionStatusLabel('correct')).toBe('Benar')
    expect(getExamQuestionStatusLabel('incorrect')).toBe('Salah')
  })
})
