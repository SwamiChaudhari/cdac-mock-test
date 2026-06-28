import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface QuestionTracker {
  /** Set of all question IDs the user has attempted */
  attemptedQuestionIds: string[]
  /** Map of questionId -> number of times attempted */
  attemptCounts: Record<string, number>
  /** Map of questionId -> last attempt timestamp */
  lastAttempted: Record<string, number>
  /** Map of questionId -> whether answered correctly last time */
  lastResult: Record<string, boolean>
  /** Session IDs that have been completed */
  completedSessions: string[]
  
  // Actions
  recordAttempt: (questionId: string, correct: boolean) => void
  recordSessionComplete: (sessionQuestionIds: string[], sessionId: string) => void
  getExcludeIds: () => Set<string>
  getAttemptedCount: (questionId: string) => number
  isAttempted: (questionId: string) => boolean
  reset: () => void
  /** Get stats for analytics */
  getStats: () => {
    totalAttempted: number
    totalCorrect: number
    totalWrong: string[]
    neverAttempted: number
  }
}

export const useQuestionTracker = create<QuestionTracker>()(
  persist(
    (set, get) => ({
      attemptedQuestionIds: [],
      attemptCounts: {},
      lastAttempted: {},
      lastResult: {},
      completedSessions: [],

      recordAttempt: (questionId: string, correct: boolean) => {
        const state = get()
        const attempted = new Set(state.attemptedQuestionIds)
        attempted.add(questionId)
        
        set({
          attemptedQuestionIds: [...attempted],
          attemptCounts: {
            ...state.attemptCounts,
            [questionId]: (state.attemptCounts[questionId] || 0) + 1,
          },
          lastAttempted: {
            ...state.lastAttempted,
            [questionId]: Date.now(),
          },
          lastResult: {
            ...state.lastResult,
            [questionId]: correct,
          },
        })
      },

      recordSessionComplete: (sessionQuestionIds: string[], sessionId: string) => {
        const state = get()
        const attempted = new Set(state.attemptedQuestionIds)
        sessionQuestionIds.forEach(id => attempted.add(id))
        
        set({
          attemptedQuestionIds: [...attempted],
          completedSessions: [...state.completedSessions, sessionId],
          attemptCounts: sessionQuestionIds.reduce((acc, id) => ({
            ...acc,
            [id]: (state.attemptCounts[id] || 0) + 1,
          }), state.attemptCounts),
          lastAttempted: sessionQuestionIds.reduce((acc, id) => ({
            ...acc,
            [id]: Date.now(),
          }), state.lastAttempted),
        })
      },

      getExcludeIds: () => {
        return new Set(get().attemptedQuestionIds)
      },

      getAttemptedCount: (questionId: string) => {
        return get().attemptCounts[questionId] || 0
      },

      isAttempted: (questionId: string) => {
        return get().attemptedQuestionIds.includes(questionId)
      },

      reset: () => set({
        attemptedQuestionIds: [],
        attemptCounts: {},
        lastAttempted: {},
        lastResult: {},
        completedSessions: [],
      }),

      getStats: () => {
        const state = get()
        const totalAttempted = state.attemptedQuestionIds.length
        const totalCorrect = Object.values(state.lastResult).filter(Boolean).length
        const totalWrong = Object.entries(state.lastResult)
          .filter(([, correct]) => !correct)
          .map(([id]) => id)
        
        return {
          totalAttempted,
          totalCorrect,
          totalWrong,
          neverAttempted: 0, // Will be calculated by caller with total question count
        }
      },
    }),
    {
      name: 'cdac-question-tracker',
    }
  )
)
