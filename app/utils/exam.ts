import type { ExamResponse, Question, QuestionSessionState } from '~/types/exam'
import { DEFAULT_TIME_LIMIT_MINUTES } from '~/types/exam'

const SECONDS_PER_QUESTION = 48
const MIN_TIME_LIMIT_MINUTES = 10

export function getOptionLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

export function getOptionLetterById(
  question: Question,
  optionId: string | null
): string | null {
  if (!optionId) {
    return null
  }

  const index = question.options.findIndex(option => option.id === optionId)
  return index >= 0 ? getOptionLetter(index) : null
}

export function formatOptionLabel(letter: string, text: string): string {
  return `${letter}. ${text}`
}

export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]!
    result[i] = result[j]!
    result[j] = temp
  }
  return result
}

export function prepareExamQuestions(
  questions: Question[],
  shuffleEnabled: boolean
): { questions: Question[], optionOrders: Record<string, string[]> } {
  const orderedQuestions = shuffleEnabled ? shuffleArray(questions) : [...questions]
  const optionOrders: Record<string, string[]> = {}

  const prepared = orderedQuestions.map((question) => {
    const shuffledOptions = shuffleEnabled
      ? shuffleArray(question.options)
      : [...question.options]
    optionOrders[question.id] = shuffledOptions.map(option => option.id)
    return { ...question, options: shuffledOptions }
  })

  return { questions: prepared, optionOrders }
}

export function createAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function buildResponses(
  questionStates: QuestionSessionState[],
  questions: Question[]
): ExamResponse[] {
  const questionMap = new Map(questions.map(question => [question.id, question]))

  return questionStates.map((state) => {
    const question = questionMap.get(state.questionId)
    const wasSkipped = state.wasSkipped || state.selectedOptionId === null
    const isCorrect = !wasSkipped && state.selectedOptionId === question?.correctOptionId

    return {
      questionId: state.questionId,
      selectedOptionId: wasSkipped ? null : state.selectedOptionId,
      isCorrect,
      wasSkipped
    }
  })
}

export function calculateScorePercent(responses: ExamResponse[]): number {
  if (responses.length === 0) {
    return 0
  }

  const correctCount = responses.filter(response => response.isCorrect).length
  return Math.round((correctCount / responses.length) * 100)
}

export function determinePass(scorePercent: number, passThreshold: number): boolean {
  return scorePercent >= passThreshold
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`
}

export function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function resolveTimeLimitMinutes(
  questionCount: number,
  overrideMinutes?: number
): number {
  if (overrideMinutes !== undefined) {
    return overrideMinutes
  }

  if (questionCount <= 0) {
    return DEFAULT_TIME_LIMIT_MINUTES
  }

  const computedMinutes = Math.ceil((questionCount * SECONDS_PER_QUESTION) / 60)
  return Math.min(
    DEFAULT_TIME_LIMIT_MINUTES,
    Math.max(MIN_TIME_LIMIT_MINUTES, computedMinutes)
  )
}

export function resolveTimeLimitSeconds(
  questionCount: number,
  overrideMinutes?: number
): number {
  return resolveTimeLimitMinutes(questionCount, overrideMinutes) * 60
}

export function formatTimeLimit(minutes: number): string {
  return `${minutes} menit`
}
