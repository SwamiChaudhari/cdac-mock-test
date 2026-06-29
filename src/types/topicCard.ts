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
  topQuestions: {
    q: string
    opts: string[]
    ans: number
    hint: string
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
  confidence: 0 | 1 | 2 | 3 | 4 // 0=not rated, 1=confused, 2=somewhat, 3=understand, 4=mastered
  bookmarked: boolean
  timeSpent: number // seconds
  revised: boolean
  lastVisited: number
}
