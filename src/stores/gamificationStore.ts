import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserStats, TestResult, SmartNote, TopicMastery } from '../types'
import { generateId } from '../utils'

interface GamificationStore extends UserStats {
  // XP & Level
  xp: number
  level: number
  streak: number
  lastActiveDate: string
  achievements: string[]
  
  // Learning Mode
  flashcards: Flashcard[]
  dailyQuests: DailyQuest[]
  smartNotes: SmartNote[]
  topicMastery: TopicMastery[]
  
  // Actions
  addResult: (result: TestResult) => void
  toggleBookmark: (questionId: string) => void
  addMistake: (questionId: string) => void
  addXP: (amount: number, reason: string) => void
  updateStreak: () => void
  unlockAchievement: (id: string) => void
  addFlashcard: (card: Flashcard) => void
  reviewFlashcard: (id: string, correct: boolean) => void
  completeQuest: (id: string) => void
  generateFlashcardsFromMistakes: (result: TestResult) => void
  generateSmartNotes: (result: TestResult) => void
  updateTopicMastery: (result: TestResult) => void
  reset: () => void
}

export interface Flashcard {
  id: string
  front: string
  back: string
  topic: string
  nextReview: number
  interval: number
  easeFactor: number
  reviews: number
  correctReviews: number
}

export interface DailyQuest {
  id: string
  title: string
  description: string
  xpReward: number
  target: number
  current: number
  completed: boolean
  type: 'questions' | 'correct' | 'speed' | 'flashcard' | 'mock'
}

const XP_PER_LEVEL = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7000]

export function getLevel(xp: number): number {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i + 1
  }
  return 1
}

export function getLevelProgress(xp: number): { current: number; needed: number; percent: number } {
  const level = getLevel(xp)
  const currentLevelXP = XP_PER_LEVEL[level - 1] || 0
  const nextLevelXP = XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1] + 1000
  const current = xp - currentLevelXP
  const needed = nextLevelXP - currentLevelXP
  return { current, needed, percent: Math.min(100, (current / needed) * 100) }
}

const ACHIEVEMENTS: { id: string; title: string; description: string; icon: string; check: (store: GamificationStore) => boolean }[] = [
  { id: 'first_steps', title: 'First Steps', description: 'Complete your first 10 questions', icon: '🎯', check: (s) => s.totalCorrect + s.totalWrong >= 10 },
  { id: 'on_fire', title: 'On Fire', description: 'Get 5 correct in a row', icon: '🔥', check: (s) => s.totalCorrect >= 5 },
  { id: 'bookworm', title: 'Bookworm', description: 'Complete 100 questions', icon: '📚', check: (s) => s.totalCorrect + s.totalWrong >= 100 },
  { id: 'sharpshooter', title: 'Sharpshooter', description: 'Score 90%+ in a mock test', icon: '🎯', check: (s) => s.results.some(r => r.accuracy >= 90) },
  { id: 'persistent', title: 'Persistent', description: '7-day login streak', icon: '💪', check: (s) => s.streak >= 7 },
  { id: 'dedicated', title: 'Dedicated', description: '30-day login streak', icon: '🌟', check: (s) => s.streak >= 30 },
  { id: 'perfectionist', title: 'Perfectionist', description: '100% accuracy in any topic', icon: '🏅', check: (s) => s.results.some(r => Object.values(r.subjectAnalysis).some(sa => sa.accuracy === 100 && sa.total >= 5)) },
  { id: 'polymath', title: 'Polymath', description: 'Score >70% in all subjects', icon: '🧠', check: (s) => s.results.length > 0 && Object.values(s.results[s.results.length - 1]?.subjectAnalysis || {}).every(sa => sa.accuracy >= 70) },
  { id: 'memorist', title: 'Memorist', description: 'Create 50 flashcards', icon: '💡', check: (s) => s.flashcards.length >= 50 },
  { id: 'topper', title: 'TOPPER', description: 'Score >90% in full mock', icon: '👑', check: (s) => s.results.some(r => r.mode === 'full-mock' && r.accuracy >= 90) },
]

function generateDailyQuests(): DailyQuest[] {
  return [
    { id: 'daily_20q', title: 'Quick Practice', description: 'Answer 20 questions', xpReward: 20, target: 20, current: 0, completed: false, type: 'questions' },
    { id: 'daily_10c', title: 'Accuracy Goal', description: 'Get 10 correct answers', xpReward: 15, target: 10, current: 0, completed: false, type: 'correct' },
    { id: 'daily_flash', title: 'Flashcard Review', description: 'Review 5 flashcards', xpReward: 10, target: 5, current: 0, completed: false, type: 'flashcard' },
    { id: 'daily_speed', title: 'Speed Round', description: 'Answer 10 questions in under 8 minutes', xpReward: 25, target: 10, current: 0, completed: false, type: 'speed' },
  ]
}

const initialStats: UserStats = {
  totalTests: 0,
  averageScore: 0,
  bestScore: 0,
  worstScore: 0,
  totalCorrect: 0,
  totalWrong: 0,
  totalSkipped: 0,
  totalStudyTime: 0,
  results: [],
  bookmarkedQuestions: [],
  mistakeHistory: {},
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      ...initialStats,
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: '',
      achievements: [],
      flashcards: [],
      dailyQuests: generateDailyQuests(),
      smartNotes: [],
      topicMastery: [],

      addResult: (result: TestResult) => {
        const prev = get()
        const newResults = [...prev.results, result]
        const totalScore = newResults.reduce((sum, r) => sum + r.score, 0)
        
        // Calculate XP
        let xpEarned = 50 // Base for completing mock
        xpEarned += result.correct * 10
        if (result.accuracy >= 80) xpEarned += 100
        if (result.accuracy >= 90) xpEarned += 100
        if (result.mode === 'full-mock') xpEarned += 50

        const newXP = prev.xp + xpEarned
        
        // Check for new achievements
        const state = { ...prev, xp: newXP, results: newResults }
        const newAchievements = [...prev.achievements]
        ACHIEVEMENTS.forEach(a => {
          if (!newAchievements.includes(a.id) && a.check(state as GamificationStore)) {
            newAchievements.push(a.id)
          }
        })

        // Update topic mastery
        get().updateTopicMastery(result)

        // Auto-generate flashcards from mistakes
        get().generateFlashcardsFromMistakes(result)

        // Auto-generate smart notes
        get().generateSmartNotes(result)

        set({
          totalTests: newResults.length,
          averageScore: Math.round(totalScore / newResults.length),
          bestScore: Math.max(prev.bestScore, result.score),
          worstScore: newResults.length === 1 ? result.score : Math.min(prev.worstScore || result.score, result.score),
          totalCorrect: prev.totalCorrect + result.correct,
          totalWrong: prev.totalWrong + result.wrong,
          totalSkipped: prev.totalSkipped + result.skipped,
          totalStudyTime: prev.totalStudyTime + result.timeSpent,
          results: newResults,
          xp: newXP,
          level: getLevel(newXP),
          achievements: newAchievements,
        })
      },

      generateFlashcardsFromMistakes: (result: TestResult) => {
        const prev = get()
        const newCards: Flashcard[] = []
        
        result.questionDetails
          .filter(q => !q.isCorrect)
          .forEach(q => {
            // Check if flashcard already exists for this question
            const exists = prev.flashcards.some(f => f.front === q.question)
            if (!exists) {
              newCards.push({
                id: generateId(),
                front: q.question,
                back: q.options[q.correctAnswer],
                topic: q.topic,
                nextReview: Date.now(),
                interval: 1,
                easeFactor: 2.5,
                reviews: 0,
                correctReviews: 0,
              })
            }
          })
        
        if (newCards.length > 0) {
          set({ flashcards: [...prev.flashcards, ...newCards] })
        }
      },

      generateSmartNotes: (result: TestResult) => {
        const prev = get()
        const notes: SmartNote[] = []
        
        // Generate notes from incorrect questions
        const incorrectByTopic: Record<string, typeof result.questionDetails> = {}
        result.questionDetails.filter(q => !q.isCorrect).forEach(q => {
          const key = `${q.subject}|${q.topic}`
          if (!incorrectByTopic[key]) incorrectByTopic[key] = []
          incorrectByTopic[key].push(q)
        })

        Object.entries(incorrectByTopic).forEach(([key, questions]) => {
          const [subject, topic] = key.split('|')
          const correctQ = questions[0]
          if (!correctQ) return
          
          notes.push({
            id: generateId(),
            type: 'concept',
            title: `${topic} - Key Concept`,
            content: correctQ.explanation,
            subject,
            topic,
          })
        })

        // Generate formula notes from strong topics (for revision)
        result.questionDetails
          .filter(q => q.isCorrect && q.explanation.includes('='))
          .slice(0, 3)
          .forEach(q => {
            notes.push({
              id: generateId(),
              type: 'formula',
              title: `${q.topic} Formula`,
              content: q.explanation,
              subject: q.subject,
              topic: q.topic,
            })
          })

        if (notes.length > 0) {
          set({ smartNotes: [...prev.smartNotes, ...notes].slice(-100) }) // Keep last 100
        }
      },

      updateTopicMastery: (result: TestResult) => {
        const prev = get()
        const masteryMap = new Map(prev.topicMastery.map(t => [`${t.subject}|${t.topic}`, t]))

        Object.entries(result.topicAnalysis).forEach(([topic, analysis]) => {
          const key = `${analysis.subject}|${topic}`
          const existing = masteryMap.get(key)
          
          if (existing) {
            const newTotal = existing.totalAttempts + analysis.total
            const newCorrect = existing.correct + analysis.correct
            const newAccuracy = (newCorrect / newTotal) * 100
            const prevAccuracy = existing.accuracy
            
            let trend: 'improving' | 'declining' | 'stable' = 'stable'
            if (newAccuracy > prevAccuracy + 5) trend = 'improving'
            else if (newAccuracy < prevAccuracy - 5) trend = 'declining'
            
            masteryMap.set(key, {
              topic,
              subject: analysis.subject,
              totalAttempts: newTotal,
              correct: newCorrect,
              accuracy: newAccuracy,
              lastAttempted: result.date,
              masteryLevel: newAccuracy >= 75 ? 'strong' : newAccuracy >= 50 ? 'improving' : 'weak',
              trend,
            })
          } else {
            masteryMap.set(key, {
              topic,
              subject: analysis.subject,
              totalAttempts: analysis.total,
              correct: analysis.correct,
              accuracy: analysis.accuracy,
              lastAttempted: result.date,
              masteryLevel: analysis.accuracy >= 75 ? 'strong' : analysis.accuracy >= 50 ? 'improving' : 'weak',
              trend: 'stable',
            })
          }
        })

        set({ topicMastery: Array.from(masteryMap.values()) })
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

      addXP: (amount: number, _reason: string) => {
        const newXP = get().xp + amount
        set({ xp: newXP, level: getLevel(newXP) })
      },

      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0]
        const lastActive = get().lastActiveDate
        
        if (lastActive === today) return // Already updated today

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        let newStreak = 1
        
        if (lastActive === yesterday) {
          newStreak = get().streak + 1
        }
        
        // Streak bonuses
        let bonusXP = 0
        if (newStreak === 7) bonusXP = 25
        if (newStreak === 14) bonusXP = 50
        if (newStreak === 30) bonusXP = 100
        
        const newXP = get().xp + 5 + bonusXP // 5 XP for daily login
        
        set({
          streak: newStreak,
          lastActiveDate: today,
          xp: newXP,
          level: getLevel(newXP),
          dailyQuests: newStreak > 1 ? get().dailyQuests : generateDailyQuests(),
        })
      },

      unlockAchievement: (id: string) => {
        if (!get().achievements.includes(id)) {
          set({ achievements: [...get().achievements, id] })
        }
      },

      addFlashcard: (card: Flashcard) => {
        set({ flashcards: [...get().flashcards, card] })
      },

      reviewFlashcard: (id: string, correct: boolean) => {
        const cards = get().flashcards.map(c => {
          if (c.id !== id) return c
          
          // SM-2 spaced repetition algorithm
          let newInterval = 1
          let newEF = c.easeFactor
          
          if (correct) {
            if (c.reviews === 0) newInterval = 1
            else if (c.reviews === 1) newInterval = 3
            else newInterval = Math.round(c.interval * c.easeFactor)
            newEF = Math.max(1.3, c.easeFactor + 0.1)
          } else {
            newInterval = 1
            newEF = Math.max(1.3, c.easeFactor - 0.2)
          }
          
          return {
            ...c,
            interval: newInterval,
            easeFactor: newEF,
            reviews: c.reviews + 1,
            correctReviews: c.correctReviews + (correct ? 1 : 0),
            nextReview: Date.now() + newInterval * 86400000,
          }
        })
        set({ flashcards: cards })
        
        // XP for reviewing
        get().addXP(correct ? 5 : 2, 'flashcard_review')
      },

      completeQuest: (id: string) => {
        const quests = get().dailyQuests.map(q => {
          if (q.id !== id || q.completed) return q
          return { ...q, completed: true }
        })
        const quest = get().dailyQuests.find(q => q.id === id)
        if (quest && !quest.completed) {
          get().addXP(quest.xpReward, `quest_${id}`)
        }
        set({ dailyQuests: quests })
      },

      reset: () => set({ ...initialStats, xp: 0, level: 1, streak: 0, achievements: [], flashcards: [], dailyQuests: generateDailyQuests(), smartNotes: [], topicMastery: [] }),
    }),
    {
      name: 'cdac-gamification',
    }
  )
)

export { ACHIEVEMENTS, XP_PER_LEVEL }
