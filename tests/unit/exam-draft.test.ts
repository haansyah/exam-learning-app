import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useExamDraftStore } from '~/stores/exam-draft'
import { useExamStore } from '~/stores/exam'
import type { Question } from '~/types/exam'

const questions: Question[] = [
  {
    id: 'q1',
    text: 'Q1',
    options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
    correctOptionId: 'a',
    explanation: 'A'
  },
  {
    id: 'q2',
    text: 'Q2',
    options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
    correctOptionId: 'b',
    explanation: 'B'
  }
]

describe('exam draft resume', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })

  it('saves draft when pausing an active exam', () => {
    const examStore = useExamStore()
    const draftStore = useExamDraftStore()

    examStore.startExam('ekma4213', 70, questions, false)
    examStore.selectOption('a')
    examStore.pauseExam()

    const draft = draftStore.getDraft('ekma4213')
    expect(draft).not.toBeNull()
    expect(draft?.currentIndex).toBe(0)
    expect(draft?.questionStates[0]?.selectedOptionId).toBe('a')
    expect(draft?.timerSecondsRemaining).toBeLessThanOrEqual(examStore.timerDurationSeconds)
  })

  it('restores draft and resumes timer', () => {
    const examStore = useExamStore()
    const draftStore = useExamDraftStore()

    examStore.startExam('ekma4213', 70, questions, false)
    examStore.selectOption('a')
    examStore.checkAnswer()
    examStore.goNext()
    examStore.pauseExam()

    const draft = draftStore.getDraft('ekma4213')
    expect(draft).not.toBeNull()

    examStore.resetSession()
    expect(examStore.phase).toBe('idle')

    examStore.restoreFromDraft(draft!)
    examStore.resumeExam()

    expect(examStore.phase).toBe('exam')
    expect(examStore.currentIndex).toBe(1)
    expect(examStore.questionStates[0]?.checked).toBe(true)

    const remainingBefore = examStore.timerSecondsRemaining
    vi.advanceTimersByTime(2000)
    expect(examStore.timerSecondsRemaining).toBe(remainingBefore - 2)
  })

  it('clears draft when starting a new exam', () => {
    const examStore = useExamStore()
    const draftStore = useExamDraftStore()

    examStore.startExam('ekma4213', 70, questions, false)
    examStore.pauseExam()
    expect(draftStore.hasDraft('ekma4213')).toBe(true)

    examStore.startExam('ekma4213', 70, questions, true)
    expect(draftStore.hasDraft('ekma4213')).toBe(false)
  })
})
