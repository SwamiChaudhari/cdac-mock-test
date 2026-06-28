import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TestResult, TestMode } from '../types'

export type SortBy = 'date' | 'score' | 'accuracy' | 'timeSpent'
export type SortOrder = 'asc' | 'desc'

interface HistoryStore {
  /** Saved test sessions for history (separate from results in gamification) */
  testHistory: TestRecord[]
  
  // Actions
  saveTest: (record: TestRecord) => void
  deleteTest: (testId: string) => void
  clearHistory: () => void
  getTestsBySubject: (subject: string) => TestRecord[]
  getTestsByMode: (mode: TestMode) => TestRecord[]
  searchTests: (query: string) => TestRecord[]
  sortTests: (tests: TestRecord[], sortBy: SortBy, order: SortOrder) => TestRecord[]
  getReattemptData: (testId: string) => TestRecord | undefined
}

export interface TestRecord {
  id: string
  result: TestResult
  questions: {
    id: string
    question: string
    options: [string, string, string, string]
    correctAnswer: 0 | 1 | 2 | 3
    explanation: string
    subject: string
    topic: string
    difficulty: 'easy' | 'medium' | 'hard'
    marks: number
  }[]
  reattempts: ReattemptRecord[]
  savedAt: number
}

export interface ReattemptRecord {
  id: string
  date: number
  score: number
  totalMarks: number
  correct: number
  wrong: number
  skipped: number
  accuracy: number
  timeSpent: number
  answers: Record<string, number | null>
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      testHistory: [],

      saveTest: (record: TestRecord) => {
        set((state) => ({
          testHistory: [record, ...state.testHistory],
        }))
      },

      deleteTest: (testId: string) => {
        set((state) => ({
          testHistory: state.testHistory.filter((t) => t.id !== testId),
        }))
      },

      clearHistory: () => set({ testHistory: [] }),

      getTestsBySubject: (subject: string) => {
        return get().testHistory.filter((t) =>
          Object.keys(t.result.subjectAnalysis).some(
            (s) => s.toLowerCase() === subject.toLowerCase()
          )
        )
      },

      getTestsByMode: (mode: TestMode) => {
        return get().testHistory.filter((t) => t.result.mode === mode)
      },

      searchTests: (query: string) => {
        const q = query.toLowerCase().trim()
        if (!q) return get().testHistory
        return get().testHistory.filter(
          (t) =>
            t.result.testName.toLowerCase().includes(q) ||
            t.result.mode.toLowerCase().includes(q) ||
            Object.keys(t.result.subjectAnalysis).some((s) => s.toLowerCase().includes(q)) ||
            Object.keys(t.result.topicAnalysis).some((topic) => topic.toLowerCase().includes(q))
        )
      },

      sortTests: (tests: TestRecord[], sortBy: SortBy, order: SortOrder) => {
        const sorted = [...tests].sort((a, b) => {
          let cmp = 0
          switch (sortBy) {
            case 'date':
              cmp = a.result.date - b.result.date
              break
            case 'score':
              cmp = a.result.score - b.result.score
              break
            case 'accuracy':
              cmp = a.result.accuracy - b.result.accuracy
              break
            case 'timeSpent':
              cmp = a.result.timeSpent - b.result.timeSpent
              break
          }
          return order === 'desc' ? -cmp : cmp
        })
        return sorted
      },

      getReattemptData: (testId: string) => {
        return get().testHistory.find((t) => t.id === testId)
      },
    }),
    {
      name: 'cdac-test-history',
    }
  )
)
