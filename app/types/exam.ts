export type SubjectCategory = 'kuliah' | 'bahasa' | 'uji-coba'

export interface SubjectManifestEntry {
  id: string
  name: string
  description: string
  passThreshold: number
  questionFile: string
  category: SubjectCategory
  /** Override exam duration in minutes; defaults to computed value capped at 40 */
  timeLimitMinutes?: number
}

export interface QuestionOption {
  id: string
  text: string
  imageUrl?: string
  isFormula?: boolean
}

export interface Question {
  id: string
  text: string
  imageUrl?: string
  isFormula?: boolean
  options: QuestionOption[]
  correctOptionId: string
  explanation: string
  explanationImageUrl?: string
}

export interface SubjectQuestionFile {
  subjectId: string
  questions: Question[]
}

export interface ExamResponse {
  questionId: string
  selectedOptionId: string | null
  isCorrect: boolean
  wasSkipped: boolean
}

export interface ExamAttempt {
  attemptId: string
  subjectId: string
  startedAt: string
  completedAt: string
  durationSeconds: number
  shuffleEnabled: boolean
  scorePercent: number
  passed: boolean
  responses: ExamResponse[]
}

export interface QuestionSessionState {
  questionId: string
  selectedOptionId: string | null
  checked: boolean
  wasSkipped: boolean
}

export type ResumableExamPhase = 'exam' | 'skipped-summary'

export interface ExamDraftSession {
  subjectId: string
  passThreshold: number
  shuffleEnabled: boolean
  questions: Question[]
  questionStates: QuestionSessionState[]
  currentIndex: number
  startedAt: string
  timerDurationSeconds: number
  timerSecondsRemaining: number
  phase: ResumableExamPhase
  savedAt: string
}

export const DEFAULT_TIME_LIMIT_MINUTES = 40
export const EXAM_DURATION_SECONDS = DEFAULT_TIME_LIMIT_MINUTES * 60
