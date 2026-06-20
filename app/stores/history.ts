import { defineStore } from 'pinia'
import type { ExamAttempt } from '~/types/exam'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    attempts: [] as ExamAttempt[]
  }),

  getters: {
    sortedAttempts: (state) => {
      return [...state.attempts].sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
    },

    attemptsBySubject: (state) => {
      return (subjectId: string) => {
        return [...state.attempts]
          .filter(attempt => attempt.subjectId === subjectId)
          .sort(
            (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
          )
      }
    },

    bestScoreForSubject: (state) => {
      return (subjectId: string): number | null => {
        const subjectAttempts = state.attempts.filter(attempt => attempt.subjectId === subjectId)
        if (subjectAttempts.length === 0) {
          return null
        }
        return Math.max(...subjectAttempts.map(attempt => attempt.scorePercent))
      }
    },

    attemptCountForSubject: (state) => {
      return (subjectId: string) => {
        return state.attempts.filter(attempt => attempt.subjectId === subjectId).length
      }
    },

    getAttemptById: (state) => {
      return (attemptId: string) => state.attempts.find(attempt => attempt.attemptId === attemptId)
    }
  },

  actions: {
    addAttempt(attempt: ExamAttempt) {
      this.attempts.push(attempt)
    }
  },

  persist: true
})
