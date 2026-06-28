import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question, TestMode, TestAnswer, TestSession } from '../types'
import { generateId } from '../utils'

interface TestStore {
  session: TestSession | null
  questionBank: Question[]
  setQuestionBank: (questions: Question[]) => void
  startTest: (mode: TestMode, questions: Question[], duration?: number) => void
  setAnswer: (questionId: string, answer: number | null) => void
  toggleMarkForReview: (questionId: string) => void
  setCurrentIndex: (index: number) => void
  clearResponse: (questionId: string) => void
  submitTest: () => void
  resetTest: () => void
  restoreSession: () => void
}

const DURATIONS: Record<TestMode, number> = {
  'full-mock': 120 * 60,
  'section-a': 55 * 60,
  'section-b': 65 * 60,
  'topic-practice': 30 * 60,
  'previous-mistakes': 30 * 60,
  'daily-challenge': 20 * 60,
  'rapid-revision': 45 * 60,
}

export const useTestStore = create<TestStore>()(
  persist(
    (set, get) => ({
      session: null,
      questionBank: [],
      setQuestionBank: (questions) => set({ questionBank: questions }),
      startTest: (mode, questions, duration) => {
        const newSession: TestSession = {
          id: generateId(),
          mode,
          questions,
          answers: {},
          currentIndex: 0,
          startTime: Date.now(),
          duration: duration || DURATIONS[mode],
          isCompleted: false,
          submittedAt: null,
        }
        set({ session: newSession })
      },
      setAnswer: (questionId, answer) => {
        const session = get().session
        if (!session || session.isCompleted) return
        const existing = session.answers[questionId]
        const now = Date.now()
        const timeSpent = existing ? now - existing.timestamp : 0
        set({
          session: {
            ...session,
            answers: {
              ...session.answers,
              [questionId]: {
                questionId,
                selectedAnswer: answer,
                isMarkedForReview: existing?.isMarkedForReview || false,
                timeSpent: existing ? existing.timeSpent + timeSpent : 0,
                timestamp: now,
              },
            },
          },
        })
      },
      toggleMarkForReview: (questionId) => {
        const session = get().session
        if (!session) return
        const existing = session.answers[questionId]
        set({
          session: {
            ...session,
            answers: {
              ...session.answers,
              [questionId]: {
                questionId,
                selectedAnswer: existing?.selectedAnswer ?? null,
                isMarkedForReview: !existing?.isMarkedForReview,
                timeSpent: existing?.timeSpent || 0,
                timestamp: existing?.timestamp || Date.now(),
              },
            },
          },
        })
      },
      setCurrentIndex: (index) => {
        const session = get().session
        if (!session) return
        set({ session: { ...session, currentIndex: index } })
      },
      clearResponse: (questionId) => {
        const session = get().session
        if (!session) return
        set({
          session: {
            ...session,
            answers: {
              ...session.answers,
              [questionId]: {
                questionId,
                selectedAnswer: null,
                isMarkedForReview: false,
                timeSpent: 0,
                timestamp: Date.now(),
              },
            },
          },
        })
      },
      submitTest: () => {
        const session = get().session
        if (!session) return
        set({
          session: { ...session, isCompleted: true, submittedAt: Date.now() },
        })
      },
      resetTest: () => set({ session: null }),
      restoreSession: () => {},
    }),
    {
      name: 'cdac-test-session',
      partialize: (state) => ({ session: state.session }),
    }
  )
)
