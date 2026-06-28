import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function getQuestionStatus(
  answer: { selectedAnswer: number | null; isMarkedForReview: boolean } | undefined
): 'not-visited' | 'visited' | 'answered' | 'marked-for-review' {
  if (!answer) return 'not-visited'
  if (answer.selectedAnswer === null && answer.isMarkedForReview) return 'marked-for-review'
  if (answer.selectedAnswer !== null) return 'answered'
  return 'visited'
}

export function calculateResults(
  questions: Question[],
  answers: Record<string, { selectedAnswer: number | null }>
) {
  let score = 0
  let correct = 0
  let wrong = 0
  let skipped = 0
  const subjectStats: Record<string, { total: number; correct: number; wrong: number; skipped: number }> = {}

  questions.forEach((q) => {
    const answer = answers[q.id]
    if (!subjectStats[q.subject]) {
      subjectStats[q.subject] = { total: 0, correct: 0, wrong: 0, skipped: 0 }
    }
    subjectStats[q.subject].total++

    if (!answer || answer.selectedAnswer === null) {
      skipped++
      subjectStats[q.subject].skipped++
    } else if (answer.selectedAnswer === q.correctAnswer) {
      correct++
      score += q.marks
      subjectStats[q.subject].correct++
    } else {
      wrong++
      subjectStats[q.subject].wrong++
    }
  })

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)
  const accuracy = questions.length > 0 ? (correct / (correct + wrong)) * 100 : 0

  return {
    score,
    totalMarks,
    correct,
    wrong,
    skipped,
    accuracy,
    subjectAnalysis: Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      ...stats,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    })),
    weakTopics: Object.entries(subjectStats)
      .filter(([, stats]) => stats.total > 0 && (stats.correct / stats.total) < 0.5)
      .map(([subject]) => subject),
    strongTopics: Object.entries(subjectStats)
      .filter(([, stats]) => stats.total > 0 && (stats.correct / stats.total) >= 0.75)
      .map(([subject]) => subject),
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
