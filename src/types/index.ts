export interface Question {
  id: string
  section: 'A' | 'B'
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  options: [string, string, string, string]
  correctAnswer: 0 | 1 | 2 | 3
  explanation: string
  marks: number
}

export interface TestAnswer {
  questionId: string
  selectedAnswer: number | null
  isMarkedForReview: boolean
  timeSpent: number
  timestamp: number
}

export interface TestSession {
  id: string
  mode: TestMode
  questions: Question[]
  answers: Record<string, TestAnswer>
  currentIndex: number
  startTime: number
  duration: number
  isCompleted: boolean
  submittedAt: number | null
}

export type TestMode = 
  | 'full-mock'
  | 'section-a'
  | 'section-b'
  | 'topic-practice'
  | 'previous-mistakes'
  | 'daily-challenge'
  | 'rapid-revision'

export interface TestResult {
  id: string
  sessionId: string
  mode: TestMode
  score: number
  totalMarks: number
  correct: number
  wrong: number
  skipped: number
  accuracy: number
  timeSpent: number
  subjectAnalysis: Record<string, SubjectAnalysis>
  weakTopics: string[]
  strongTopics: string[]
  date: number
}

export interface SubjectAnalysis {
  subject: string
  total: number
  correct: number
  wrong: number
  skipped: number
  accuracy: number
  timeSpent: number
}

export interface UserStats {
  totalTests: number
  averageScore: number
  bestScore: number
  totalCorrect: number
  totalWrong: number
  totalSkipped: number
  results: TestResult[]
  bookmarkedQuestions: string[]
  mistakeHistory: Record<string, number>
}

export type QuestionStatus = 'not-visited' | 'visited' | 'answered' | 'marked-for-review'
