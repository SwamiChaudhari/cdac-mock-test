import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TopicProgress } from '../types/topicCard'

interface TopicLearningStore {
  progress: Record<string, TopicProgress>
  currentIndex: number
  darkMode: boolean
  
  setCurrentIndex: (index: number) => void
  markCompleted: (cardId: string) => void
  setConfidence: (cardId: string, level: 0 | 1 | 2 | 3 | 4) => void
  toggleBookmark: (cardId: string) => void
  markRevised: (cardId: string) => void
  addTimeSpent: (cardId: string, seconds: number) => void
  toggleDarkMode: () => void
  getStats: () => {
    totalCompleted: number
    totalBookmarked: number
    totalRevised: number
    weakTopics: string[]
    strongTopics: string[]
    avgConfidence: number
  }
}

export const useTopicLearningStore = create<TopicLearningStore>()(
  persist(
    (set, get) => ({
      progress: {},
      currentIndex: 0,
      darkMode: true,

      setCurrentIndex: (index) => set({ currentIndex: index }),

      markCompleted: (cardId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [cardId]: {
              ...state.progress[cardId],
              cardId,
              completed: true,
              lastVisited: Date.now(),
            },
          },
        })),

      setConfidence: (cardId, level) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [cardId]: {
              ...state.progress[cardId],
              cardId,
              confidence: level,
              lastVisited: Date.now(),
            },
          },
        })),

      toggleBookmark: (cardId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [cardId]: {
              ...state.progress[cardId],
              cardId,
              bookmarked: !(state.progress[cardId]?.bookmarked ?? false),
            },
          },
        })),

      markRevised: (cardId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [cardId]: {
              ...state.progress[cardId],
              cardId,
              revised: true,
              lastVisited: Date.now(),
            },
          },
        })),

      addTimeSpent: (cardId, seconds) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [cardId]: {
              ...state.progress[cardId],
              cardId,
              timeSpent: (state.progress[cardId]?.timeSpent ?? 0) + seconds,
            },
          },
        })),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      getStats: () => {
        const progress = get().progress
        const entries = Object.values(progress)
        const completed = entries.filter((e) => e.completed)
        const bookmarked = entries.filter((e) => e.bookmarked)
        const revised = entries.filter((e) => e.revised)
        const rated = entries.filter((e) => e.confidence > 0)
        const avgConfidence = rated.length > 0
          ? rated.reduce((sum, e) => sum + (e.confidence || 0), 0) / rated.length
          : 0

        return {
          totalCompleted: completed.length,
          totalBookmarked: bookmarked.length,
          totalRevised: revised.length,
          weakTopics: entries.filter((e) => e.confidence === 1).map((e) => e.cardId),
          strongTopics: entries.filter((e) => e.confidence === 4).map((e) => e.cardId),
          avgConfidence,
        }
      },
    }),
    {
      name: 'cdac-topic-learning',
    }
  )
)
