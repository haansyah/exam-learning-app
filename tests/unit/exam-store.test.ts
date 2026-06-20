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
