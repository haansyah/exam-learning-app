import { defineStore } from 'pinia'
import type { ExamDraftSession } from '~/types/exam'

export const useExamDraftStore = defineStore('exam-draft', {
  state: () => ({
    drafts: {} as Record<string, ExamDraftSession>
  }),

  getters: {
    hasDraft: (state) => {
      return (subjectId: string) => Boolean(state.drafts[subjectId])
    },

    getDraft: (state) => {
      return (subjectId: string): ExamDraftSession | null =>
        state.drafts[subjectId] ?? null
    }
  },

  actions: {
    saveDraft(session: ExamDraftSession) {
      this.drafts[session.subjectId] = session
    },

    clearDraft(subjectId: string) {
      const { [subjectId]: _removed, ...remaining } = this.drafts
      this.drafts = remaining
    }
  },

  persist: true
})
