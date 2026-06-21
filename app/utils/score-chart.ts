import type { ExamAttempt } from '~/types/exam'

export interface ScoreChartPoint {
  index: number
  label: string
  scorePercent: number
  passed: boolean
  completedAt: string
}

export function buildScoreChartPoints(attempts: ExamAttempt[]): ScoreChartPoint[] {
  return [...attempts]
    .sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    )
    .map((attempt, index) => ({
      index,
      label: `#${index + 1}`,
      scorePercent: attempt.scorePercent,
      passed: attempt.passed,
      completedAt: attempt.completedAt
    }))
}

export function scoreToChartY(
  scorePercent: number,
  chartTop: number,
  chartBottom: number
): number {
  const clamped = Math.min(100, Math.max(0, scorePercent))
  const ratio = clamped / 100
  return chartBottom - ratio * (chartBottom - chartTop)
}

export function indexToChartX(
  index: number,
  pointCount: number,
  chartLeft: number,
  chartRight: number
): number {
  if (pointCount <= 1) {
    return (chartLeft + chartRight) / 2
  }

  const ratio = index / (pointCount - 1)
  return chartLeft + ratio * (chartRight - chartLeft)
}
