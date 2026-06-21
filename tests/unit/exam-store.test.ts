import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
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

describe('exam store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })

  it('prevents going back after checking and advancing', () => {
    const store = useExamStore()
    store.startExam('ekma4213', 70, questions, false)

    store.selectOption('a')
    store.checkAnswer()
    store.goNext()

    expect(store.currentIndex).toBe(1)
    expect(store.questionStates[0]?.checked).toBe(true)
  })

  it('skips the last question and returns to the first pending skipped question', () => {
    const store = useExamStore()
    store.startExam('ekma4213', 70, questions, false)

    store.skipQuestion()
    store.skipQuestion()

    expect(store.currentIndex).toBe(0)
    expect(store.questionStates[0]).toMatchObject({
      wasSkipped: true,
      checked: false,
      selectedOptionId: null
    })
    expect(store.questionStates[1]).toMatchObject({
      wasSkipped: true,
      checked: false,
      selectedOptionId: null
    })
  })

  it('skips the current question and allows revisiting it from minimap navigation', () => {
    const store = useExamStore()
    store.startExam('ekma4213', 70, questions, false)

    store.skipQuestion()

    expect(store.currentIndex).toBe(1)
    expect(store.questionStates[0]).toMatchObject({
      wasSkipped: true,
      checked: false,
      selectedOptionId: null
    })

    store.goToQuestion(0)
    store.selectOption('a')
    store.checkAnswer()

    expect(store.questionStates[0]).toMatchObject({
      wasSkipped: false,
      checked: true,
      selectedOptionId: 'a'
    })
  })

  it('returns to the first skipped question instead of finishing on the last question', () => {
    const store = useExamStore()
    store.startExam('ekma4213', 70, questions, false)

    store.skipQuestion()
    store.selectOption('b')
    store.checkAnswer()
    store.goNext()

    expect(store.currentIndex).toBe(0)
    expect(store.phase).toBe('exam')
    expect(store.shouldShowFinish).toBe(false)
  })

  it('shows finish only when the last question is answered and no skipped remain', () => {
    const store = useExamStore()
    store.startExam('ekma4213', 70, questions, false)

    store.selectOption('a')
    store.checkAnswer()
    store.goNext()
    store.selectOption('b')
    store.checkAnswer()

    expect(store.shouldShowFinish).toBe(true)

    store.goNext()
    expect(store.phase).toBe('complete')
  })

  it('marks unchecked questions as skipped when finishing', () => {
    const store = useExamStore()
    store.startExam('ekma4213', 70, questions, false)

    store.skipQuestion()
    store.selectOption('b')
    store.checkAnswer()
    store.finishExam()

    expect(store.questionStates[0]?.wasSkipped).toBe(true)
    expect(store.questionStates[0]?.checked).toBe(true)
    expect(store.questionStates[1]?.wasSkipped).toBe(false)
    expect(store.questionStates[1]?.checked).toBe(true)
  })

  it('auto-submits on timeout and marks remaining as skipped', () => {
    const store = useExamStore()
    store.startExam('ekma4213', 70, questions, false)

    store.timerSecondsRemaining = 1
    vi.advanceTimersByTime(2000)

    expect(store.phase).toBe('skipped-summary')
    expect(store.questionStates.every(state => state.checked)).toBe(true)
    expect(store.questionStates.filter(state => state.wasSkipped).length).toBeGreaterThan(0)
  })

  it('builds attempt with score on completion', () => {
    const store = useExamStore()
    store.startExam('ekma4213', 70, questions, false)

    store.selectOption('a')
    store.checkAnswer()
    store.goNext()
    store.selectOption('b')
    store.checkAnswer()
    store.finishExam()

    const attempt = store.buildAttempt()
    expect(attempt?.scorePercent).toBe(100)
    expect(attempt?.passed).toBe(true)
  })
})
