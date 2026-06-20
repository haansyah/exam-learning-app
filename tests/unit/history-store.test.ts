import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useHistoryStore } from '~/stores/history'
import type { ExamAttempt } from '~/types/exam'

function makeAttempt(overrides: Partial<ExamAttempt> = {}): ExamAttempt {
  return {
    attemptId: crypto.randomUUID(),
    subjectId: 'ekma4213',
    startedAt: '2026-01-01T10:00:00.000Z',
    completedAt: '2026-01-01T10:30:00.000Z',
    durationSeconds: 1800,
    shuffleEnabled: false,
    scorePercent: 80,
    passed: true,
    responses: [],
    ...overrides
  }
}

describe('history store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('adds new attempt per retry without overwriting', () => {
    const store = useHistoryStore()
    const first = makeAttempt({ attemptId: 'a1', scorePercent: 60 })
    const second = makeAttempt({ attemptId: 'a2', scorePercent: 80 })

    store.addAttempt(first)
    store.addAttempt(second)

    expect(store.attempts).toHaveLength(2)
    expect(store.attempts.map(a => a.attemptId)).toEqual(['a1', 'a2'])
  })

  it('sorts attempts by most recent first', () => {
    const store = useHistoryStore()
    store.addAttempt(makeAttempt({
      attemptId: 'old',
      completedAt: '2026-01-01T10:00:00.000Z'
    }))
    store.addAttempt(makeAttempt({
      attemptId: 'new',
      completedAt: '2026-02-01T10:00:00.000Z'
    }))

    expect(store.sortedAttempts[0]?.attemptId).toBe('new')
  })

  it('filters attempts by subject', () => {
    const store = useHistoryStore()
    store.addAttempt(makeAttempt({ subjectId: 'ekma4213' }))
    store.addAttempt(makeAttempt({ subjectId: 'math101' }))

    expect(store.attemptsBySubject('ekma4213')).toHaveLength(1)
  })

  it('derives best score and attempt count', () => {
    const store = useHistoryStore()
    store.addAttempt(makeAttempt({ subjectId: 'ekma4213', scorePercent: 60 }))
    store.addAttempt(makeAttempt({ subjectId: 'ekma4213', scorePercent: 85 }))

    expect(store.bestScoreForSubject('ekma4213')).toBe(85)
    expect(store.attemptCountForSubject('ekma4213')).toBe(2)
  })

  it('detects passed subject from attempt history', () => {
    const store = useHistoryStore()
    store.addAttempt(makeAttempt({
      subjectId: 'ekma4213',
      scorePercent: 65,
      passed: false
    }))
    store.addAttempt(makeAttempt({
      subjectId: 'math101',
      scorePercent: 80,
      passed: true
    }))

    expect(store.hasPassedSubject('ekma4213', 70)).toBe(false)
    expect(store.hasPassedSubject('math101', 75)).toBe(true)
  })
})
