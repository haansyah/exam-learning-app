import { defineStore } from 'pinia'
import type { ExamAttempt, ExamDraftSession, Question, QuestionSessionState } from '~/types/exam'
import { EXAM_DURATION_SECONDS } from '~/types/exam'
import { useExamDraftStore } from '~/stores/exam-draft'
import {
  buildResponses,
  calculateScorePercent,
  createAttemptId,
  determinePass,
  prepareExamQuestions
} from '~/utils/exam'

type ExamPhase = 'idle' | 'exam' | 'skipped-summary' | 'complete'

export const useExamStore = defineStore('exam', {
  state: () => ({
    subjectId: null as string | null,
    passThreshold: 70,
    shuffleEnabled: false,
    questions: [] as Question[],
    questionStates: [] as QuestionSessionState[],
    currentIndex: 0,
    startedAt: null as string | null,
    timerDurationSeconds: EXAM_DURATION_SECONDS,
    timerSecondsRemaining: EXAM_DURATION_SECONDS,
    phase: 'idle' as ExamPhase,
    timerIntervalId: null as ReturnType<typeof setInterval> | null
  }),

  getters: {
    currentQuestion(state): Question | null {
      return state.questions[state.currentIndex] ?? null
    },

    currentState(state): QuestionSessionState | null {
      return state.questionStates[state.currentIndex] ?? null
    },

    progressLabel(state): string {
      if (state.questions.length === 0) {
        return '0 of 0'
      }
      return `${state.currentIndex + 1} of ${state.questions.length}`
    },

    isLastQuestion(state): boolean {
      return state.currentIndex >= state.questions.length - 1
    },

    skippedQuestions(state): Question[] {
      const skippedIds = new Set(
        state.questionStates
          .filter(questionState => questionState.wasSkipped)
          .map(questionState => questionState.questionId)
      )
      return state.questions.filter(question => skippedIds.has(question.id))
    },

    canCheckAnswer(state): boolean {
      const current = state.questionStates[state.currentIndex]
      return Boolean(current && !current.checked && current.selectedOptionId)
    },

    canGoNext(state): boolean {
      const current = state.questionStates[state.currentIndex]
      return Boolean(current?.checked)
    },

    canSkipQuestion(state): boolean {
      const current = state.questionStates[state.currentIndex]
      return Boolean(current && !current.checked)
    },

    hasPendingSkippedQuestions(state): boolean {
      return state.questionStates.some(questionState =>
        questionState.wasSkipped && !questionState.checked
      )
    },

    shouldShowFinish(state): boolean {
      const current = state.questionStates[state.currentIndex]
      if (!current?.checked) {
        return false
      }

      if (state.questionStates.some(questionState =>
        questionState.wasSkipped && !questionState.checked
      )) {
        return false
      }

      const allChecked = state.questionStates.every(questionState => questionState.checked)
      return state.currentIndex >= state.questions.length - 1 || allChecked
    },

    isActive(state): boolean {
      return state.phase === 'exam' || state.phase === 'skipped-summary'
    },

    hasResumableSession(state) {
      return (subjectId: string) =>
        (state.phase === 'exam' || state.phase === 'skipped-summary')
        && state.subjectId === subjectId
        && state.questions.length > 0
    }
  },

  actions: {
    startExam(
      subjectId: string,
      passThreshold: number,
      questions: Question[],
      shuffleEnabled: boolean,
      durationSeconds: number = EXAM_DURATION_SECONDS
    ) {
      useExamDraftStore().clearDraft(subjectId)
      this.resetSession()
      const prepared = prepareExamQuestions(questions, shuffleEnabled)

      this.subjectId = subjectId
      this.passThreshold = passThreshold
      this.shuffleEnabled = shuffleEnabled
      this.questions = prepared.questions
      this.questionStates = prepared.questions.map(question => ({
        questionId: question.id,
        selectedOptionId: null,
        checked: false,
        wasSkipped: false
      }))
      this.currentIndex = 0
      this.startedAt = new Date().toISOString()
      this.timerDurationSeconds = durationSeconds
      this.timerSecondsRemaining = durationSeconds
      this.phase = 'exam'
      this.startTimer()
    },

    selectOption(optionId: string) {
      const current = this.questionStates[this.currentIndex]
      if (!current || current.checked) {
        return
      }
      current.selectedOptionId = optionId
    },

    checkAnswer() {
      const current = this.questionStates[this.currentIndex]
      if (!current || current.checked || !current.selectedOptionId) {
        return
      }
      current.wasSkipped = false
      current.checked = true
    },

    skipQuestion() {
      const current = this.questionStates[this.currentIndex]
      if (!current || current.checked) {
        return
      }

      current.wasSkipped = true
      current.selectedOptionId = null

      if (!this.isLastQuestion) {
        this.currentIndex += 1
        return
      }

      const pendingSkippedIndex = this.findFirstPendingSkippedIndex()
      if (pendingSkippedIndex !== -1 && pendingSkippedIndex !== this.currentIndex) {
        this.currentIndex = pendingSkippedIndex
      }
    },

    goToQuestion(index: number) {
      if (this.phase !== 'exam') {
        return
      }

      if (index < 0 || index >= this.questions.length) {
        return
      }

      this.currentIndex = index
    },

    goNext() {
      const current = this.questionStates[this.currentIndex]
      if (!current?.checked) {
        return
      }

      if (this.isLastQuestion) {
        const pendingSkippedIndex = this.findFirstPendingSkippedIndex()
        if (pendingSkippedIndex !== -1) {
          this.currentIndex = pendingSkippedIndex
          return
        }

        this.finishExam()
        return
      }

      this.currentIndex += 1
    },

    findFirstPendingSkippedIndex(): number {
      return this.questionStates.findIndex(questionState =>
        questionState.wasSkipped && !questionState.checked
      )
    },

    markRemainingAsSkipped() {
      for (const state of this.questionStates) {
        if (!state.checked) {
          state.wasSkipped = true
          state.checked = true
          state.selectedOptionId = null
        }
      }
    },

    handleTimeout() {
      if (this.phase !== 'exam') {
        return
      }

      this.markRemainingAsSkipped()
      this.stopTimer()
      this.phase = 'skipped-summary'
    },

    finishExam() {
      this.markRemainingAsSkipped()
      this.stopTimer()
      this.phase = 'complete'
    },

    continueAfterSkippedSummary() {
      if (this.phase !== 'skipped-summary') {
        return
      }
      this.phase = 'complete'
    },

    buildAttempt(): ExamAttempt | null {
      if (!this.subjectId || !this.startedAt) {
        return null
      }

      const completedAt = new Date().toISOString()
      const durationSeconds = Math.max(
        0,
        this.timerDurationSeconds - this.timerSecondsRemaining
      )
      const responses = buildResponses(this.questionStates, this.questions)
      const scorePercent = calculateScorePercent(responses)
      const passed = determinePass(scorePercent, this.passThreshold)

      return {
        attemptId: createAttemptId(),
        subjectId: this.subjectId,
        startedAt: this.startedAt,
        completedAt,
        durationSeconds,
        shuffleEnabled: this.shuffleEnabled,
        scorePercent,
        passed,
        responses
      }
    },

    startTimer() {
      this.stopTimer()
      this.timerIntervalId = setInterval(() => {
        if (this.timerSecondsRemaining <= 0) {
          this.handleTimeout()
          return
        }
        this.timerSecondsRemaining -= 1
        if (this.timerSecondsRemaining <= 0) {
          this.handleTimeout()
        }
      }, 1000)
    },

    stopTimer() {
      if (this.timerIntervalId) {
        clearInterval(this.timerIntervalId)
        this.timerIntervalId = null
      }
    },

    exportDraft(): ExamDraftSession | null {
      if (!this.isActive || !this.subjectId || !this.startedAt) {
        return null
      }

      return {
        subjectId: this.subjectId,
        passThreshold: this.passThreshold,
        shuffleEnabled: this.shuffleEnabled,
        questions: this.questions,
        questionStates: this.questionStates,
        currentIndex: this.currentIndex,
        startedAt: this.startedAt,
        timerDurationSeconds: this.timerDurationSeconds,
        timerSecondsRemaining: this.timerSecondsRemaining,
        phase: this.phase as ExamDraftSession['phase'],
        savedAt: new Date().toISOString()
      }
    },

    pauseExam() {
      const draft = this.exportDraft()
      if (draft) {
        useExamDraftStore().saveDraft(draft)
      }
      this.stopTimer()
    },

    restoreFromDraft(draft: ExamDraftSession) {
      this.stopTimer()
      this.subjectId = draft.subjectId
      this.passThreshold = draft.passThreshold
      this.shuffleEnabled = draft.shuffleEnabled
      this.questions = draft.questions
      this.questionStates = draft.questionStates
      this.currentIndex = draft.currentIndex
      this.startedAt = draft.startedAt
      this.timerDurationSeconds = draft.timerDurationSeconds
      this.timerSecondsRemaining = draft.timerSecondsRemaining
      this.phase = draft.phase
    },

    resumeExam() {
      if (this.phase === 'exam') {
        this.startTimer()
      }
    },

    resetSession() {
      const subjectId = this.subjectId
      this.stopTimer()
      this.subjectId = null
      this.passThreshold = 70
      this.shuffleEnabled = false
      this.questions = []
      this.questionStates = []
      this.currentIndex = 0
      this.startedAt = null
      this.timerDurationSeconds = EXAM_DURATION_SECONDS
      this.timerSecondsRemaining = EXAM_DURATION_SECONDS
      this.phase = 'idle'
      if (subjectId) {
        useExamDraftStore().clearDraft(subjectId)
      }
    }
  }
})
