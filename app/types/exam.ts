export interface SubjectManifestEntry {
  id: string
  name: string
  description: string
  passThreshold: number
  questionFile: string
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

export const EXAM_DURATION_SECONDS = 40 * 60
