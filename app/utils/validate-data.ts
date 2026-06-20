import type { Question, QuestionOption, SubjectCategory, SubjectManifestEntry, SubjectQuestionFile } from '~/types/exam'

const VALID_CATEGORIES: SubjectCategory[] = ['kuliah', 'bahasa']

export function validateManifest(manifest: SubjectManifestEntry[]): string[] {
  const errors: string[] = []

  for (const entry of manifest) {
    if (!entry.id || !entry.name || !entry.questionFile) {
      errors.push(`Invalid manifest entry: ${JSON.stringify(entry)}`)
    }
    if (!VALID_CATEGORIES.includes(entry.category)) {
      errors.push(`Invalid category for ${entry.id}: ${entry.category}`)
    }
    if (entry.passThreshold < 0 || entry.passThreshold > 100) {
      errors.push(`Invalid passThreshold for ${entry.id}: ${entry.passThreshold}`)
    }
    if (
      entry.timeLimitMinutes !== undefined
      && (entry.timeLimitMinutes < 1 || entry.timeLimitMinutes > 180)
    ) {
      errors.push(`Invalid timeLimitMinutes for ${entry.id}: ${entry.timeLimitMinutes}`)
    }
  }

  return errors
}

export function validateSubjectFile(file: SubjectQuestionFile): string[] {
  const errors: string[] = []

  if (!file.subjectId) {
    errors.push('Missing subjectId')
  }

  for (const question of file.questions) {
    if (!question.id || !question.text) {
      errors.push(`Invalid question: ${JSON.stringify(question)}`)
      continue
    }

    const optionIds = question.options.map((option: QuestionOption) => option.id)
    if (optionIds.length === 0) {
      errors.push(`Question ${question.id} has no options`)
    }

    if (!optionIds.includes(question.correctOptionId)) {
      errors.push(`Question ${question.id}: correctOptionId "${question.correctOptionId}" not in options`)
    }

    const correctCount = question.options.filter(
      (option: QuestionOption) => option.id === question.correctOptionId
    ).length
    if (correctCount !== 1) {
      errors.push(`Question ${question.id}: must have exactly one correct option`)
    }
  }

  return errors
}

export function validateQuestion(question: Question): string[] {
  const errors: string[] = []
  const optionIds = question.options.map((option: QuestionOption) => option.id)

  if (!optionIds.includes(question.correctOptionId)) {
    errors.push(`correctOptionId not found in options`)
  }

  return errors
}
