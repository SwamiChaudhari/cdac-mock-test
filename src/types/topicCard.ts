export interface TopicCard {
  id: string
  topicNumber: number
  topicName: string
  subject: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  importance: number // 1-5 stars
  expectedQuestions: string
  simpleExplanation: string
  whyItMatters: string
  visualDiagram: string
  realWorldExample: string
  formula: string
  memoryTrick: string
  commonMistakes: string[]
  dbTopic?: string
  topQuestions: {
    question: string
    options: string[]
    correctAnswer: number
    difficulty: 'easy' | 'medium' | 'hard'
    examFrequency: string
    conceptTested: string
    hint: string
    detailedExplanation: string
    shortcutMethod: string
    commonTrap: string
    memoryTrick: string
  }[]
  quickRevision: string[]
  masteryCheck: {
    q: string
    opts: string[]
    ans: number
    difficulty: 'easy' | 'medium' | 'hard'
  }[]
}

export interface TopicProgress {
  cardId: string
  completed: boolean
  confidence: 0 | 1 | 2 | 3 | 4
  bookmarked: boolean
  timeSpent: number
  revised: boolean
  lastVisited: number
}
