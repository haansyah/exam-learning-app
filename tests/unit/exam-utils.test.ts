import { describe, expect, it } from 'vitest'
import {
  buildResponses,
  calculateScorePercent,
  determinePass,
  getOptionLetter,
  getOptionLetterById,
  formatOptionLabel,
  prepareExamQuestions,
  resolveTimeLimitMinutes,
  shuffleArray
} from '~/utils/exam'
import type { Question, QuestionSessionState } from '~/types/exam'

const sampleQuestions: Question[] = [
  {
    id: 'q1',
    text: 'Q1',
    options: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' }
    ],
    correctOptionId: 'a',
    explanation: 'Because A'
  },
  {
    id: 'q2',
    text: 'Q2',
    options: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' }
    ],
    correctOptionId: 'b',
    explanation: 'Because B'
  },
  {
    id: 'q3',
    text: 'Q3',
    options: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' }
    ],
    correctOptionId: 'a',
    explanation: 'Because A'
  }
]

describe('exam utils', () => {
  it('calculates score with skipped questions in denominator', () => {
    const responses = [
      { questionId: 'q1', selectedOptionId: 'a', isCorrect: true, wasSkipped: false },
      { questionId: 'q2', selectedOptionId: null, isCorrect: false, wasSkipped: true },
      { questionId: 'q3', selectedOptionId: 'b', isCorrect: false, wasSkipped: false }
    ]

    expect(calculateScorePercent(responses)).toBe(33)
  })

  it('determines pass/fail from threshold', () => {
    expect(determinePass(70, 70)).toBe(true)
    expect(determinePass(69, 70)).toBe(false)
  })

  it('shuffle keeps complete question and option sets', () => {
    const { questions } = prepareExamQuestions(sampleQuestions, true)
    expect(questions).toHaveLength(3)
    expect(new Set(questions.map(q => q.id)).size).toBe(3)
    for (const question of questions) {
      expect(question.options).toHaveLength(2)
    }
  })

  it('buildResponses marks skipped and correct answers', () => {
    const states: QuestionSessionState[] = [
      { questionId: 'q1', selectedOptionId: 'a', checked: true, wasSkipped: false },
      { questionId: 'q2', selectedOptionId: null, checked: true, wasSkipped: true },
      { questionId: 'q3', selectedOptionId: 'b', checked: true, wasSkipped: false }
    ]

    const responses = buildResponses(states, sampleQuestions)
    expect(responses[0]?.isCorrect).toBe(true)
    expect(responses[1]?.wasSkipped).toBe(true)
    expect(responses[2]?.isCorrect).toBe(false)
  })

  it('shuffleArray returns permutation of same length', () => {
    const input = [1, 2, 3, 4, 5]
    const output = shuffleArray(input)
    expect(output).toHaveLength(5)
    expect(output.sort()).toEqual(input.sort())
  })

  it('resolves time limit from question count with 40-minute default cap', () => {
    expect(resolveTimeLimitMinutes(50)).toBe(40)
    expect(resolveTimeLimitMinutes(3)).toBe(10)
    expect(resolveTimeLimitMinutes(0)).toBe(40)
    expect(resolveTimeLimitMinutes(50, 60)).toBe(60)
  })

  it('maps option indexes to A-D letters', () => {
    expect(getOptionLetter(0)).toBe('A')
    expect(getOptionLetter(3)).toBe('D')
    expect(getOptionLetterById(sampleQuestions[0]!, 'b')).toBe('B')
    expect(formatOptionLabel('C', 'Choice text')).toBe('C. Choice text')
  })
})
