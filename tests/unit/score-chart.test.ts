import { describe, expect, it } from 'vitest'
import type { ExamAttempt } from '~/types/exam'
import {
  buildScoreChartPoints,
  indexToChartX,
  scoreToChartY
} from '~/utils/score-chart'

function makeAttempt(
  overrides: Partial<ExamAttempt> & Pick<ExamAttempt, 'attemptId' | 'completedAt' | 'scorePercent'>
): ExamAttempt {
  return {
    subjectId: 'math101',
    startedAt: overrides.completedAt,
    durationSeconds: 600,
    shuffleEnabled: false,
    passed: overrides.scorePercent >= 70,
    responses: [],
    ...overrides
  }
}

describe('score chart utils', () => {
  it('orders attempts chronologically for the chart', () => {
    const attempts = [
      makeAttempt({ attemptId: 'b', completedAt: '2026-06-02T10:00:00.000Z', scorePercent: 80 }),
      makeAttempt({ attemptId: 'a', completedAt: '2026-06-01T10:00:00.000Z', scorePercent: 60 }),
      makeAttempt({ attemptId: 'c', completedAt: '2026-06-03T10:00:00.000Z', scorePercent: 90 })
    ]

    const points = buildScoreChartPoints(attempts)

    expect(points.map(point => point.scorePercent)).toEqual([60, 80, 90])
    expect(points.map(point => point.label)).toEqual(['#1', '#2', '#3'])
  })

  it('maps scores to chart coordinates', () => {
    expect(scoreToChartY(0, 10, 110)).toBe(110)
    expect(scoreToChartY(100, 10, 110)).toBe(10)
    expect(scoreToChartY(50, 10, 110)).toBe(60)
  })

  it('distributes x positions across the chart width', () => {
    expect(indexToChartX(0, 1, 40, 360)).toBe(200)
    expect(indexToChartX(0, 3, 40, 360)).toBe(40)
    expect(indexToChartX(2, 3, 40, 360)).toBe(360)
  })
})
