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

/** Per-question detail saved for review */
export interface QuestionReviewDetail {
  questionId: string
  question: string
  options: [string, string, string, string]
  correctAnswer: 0 | 1 | 2 | 3
  selectedAnswer: number | null
  isCorrect: boolean
  isAttempted: boolean
  explanation: string
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeSpent: number
}

export interface TestResult {
  id: string
  sessionId: string
  mode: TestMode
  testName: string
  score: number
  totalMarks: number
  correct: number
  wrong: number
  skipped: number
  accuracy: number
  timeSpent: number
  subjectAnalysis: Record<string, SubjectAnalysis>
  topicAnalysis: Record<string, TopicAnalysis>
  weakTopics: string[]
  strongTopics: string[]
  date: number
  rank?: number
  totalParticipants?: number
  /** Full question-by-question detail for review */
  questionDetails: QuestionReviewDetail[]
  /** Auto-generated smart notes from this test */
  smartNotes: SmartNote[]
  /** Flashcard IDs generated from incorrect answers */
  generatedFlashcardIds: string[]
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

export interface TopicAnalysis {
  topic: string
  subject: string
  total: number
  correct: number
  wrong: number
  skipped: number
  accuracy: number
  masteryLevel: 'weak' | 'improving' | 'strong'
}

export interface SmartNote {
  id: string
  type: 'formula' | 'concept' | 'fact' | 'trick'
  title: string
  content: string
  subject: string
  topic: string
}

export interface UserStats {
  totalTests: number
  averageScore: number
  bestScore: number
  worstScore: number
  totalCorrect: number
  totalWrong: number
  totalSkipped: number
  totalStudyTime: number
  results: TestResult[]
  bookmarkedQuestions: string[]
  mistakeHistory: Record<string, number>
}

export type QuestionStatus = 'not-visited' | 'visited' | 'answered' | 'marked-for-review'

/** Topic mastery aggregated across all tests */
export interface TopicMastery {
  topic: string
  subject: string
  totalAttempts: number
  correct: number
  accuracy: number
  lastAttempted: number
  masteryLevel: 'weak' | 'improving' | 'strong'
  trend: 'improving' | 'declining' | 'stable'
}
