import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserStats, TestResult } from '../types'

interface StatsStore extends UserStats {
  addResult: (result: TestResult) => void
  toggleBookmark: (questionId: string) => void
  addMistake: (questionId: string) => void
  reset: () => void
}

const initialStats: UserStats = {
  totalTests: 0,
  averageScore: 0,
  bestScore: 0,
  totalCorrect: 0,
  totalWrong: 0,
  totalSkipped: 0,
  results: [],
  bookmarkedQuestions: [],
  mistakeHistory: {},
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      ...initialStats,
      addResult: (result: TestResult) => {
        const prev = get()
        const newResults = [...prev.results, result]
        const totalScore = newResults.reduce((sum, r) => sum + r.score, 0)
        set({
          totalTests: newResults.length,
          averageScore: Math.round(totalScore / newResults.length),
          bestScore: Math.max(prev.bestScore, result.score),
          totalCorrect: prev.totalCorrect + result.correct,
          totalWrong: prev.totalWrong + result.wrong,
          totalSkipped: prev.totalSkipped + result.skipped,
          results: newResults,
        })
      },
      toggleBookmark: (questionId: string) => {
        const prev = get().bookmarkedQuestions
        const updated = prev.includes(questionId)
          ? prev.filter((id) => id !== questionId)
          : [...prev, questionId]
        set({ bookmarkedQuestions: updated })
      },
      addMistake: (questionId: string) => {
        const prev = get().mistakeHistory
        set({
          mistakeHistory: {
            ...prev,
            [questionId]: (prev[questionId] || 0) + 1,
          },
        })
      },
      reset: () => set(initialStats),
    }),
    {
      name: 'cdac-stats',
    }
  )
)
