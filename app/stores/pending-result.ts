import { defineStore } from 'pinia'
import type { ExamAttempt } from '~/types/exam'

export const usePendingResultStore = defineStore('pendingResult', {
  state: () => ({
    attempt: null as ExamAttempt | null
  }),

  actions: {
    set(attempt: ExamAttempt) {
      this.attempt = attempt
    },

    take(attemptId: string): ExamAttempt | null {
      if (this.attempt?.attemptId === attemptId) {
        const value = this.attempt
        this.attempt = null
        return value
      }
      return null
    }
  }
})
