import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Question } from '../types'

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
  answers: Record<string, { selectedAnswer: number | null; timeSpent?: number }>
) {
  let score = 0
  let correct = 0
  let wrong = 0
  let skipped = 0
  const subjectStats: Record<string, { total: number; correct: number; wrong: number; skipped: number }> = {}
  const topicStats: Record<string, { subject: string; total: number; correct: number; wrong: number; skipped: number }> = {}
  const questionDetails: import('../types').QuestionReviewDetail[] = []

  questions.forEach((q) => {
    const answer = answers[q.id]
    if (!subjectStats[q.subject]) {
      subjectStats[q.subject] = { total: 0, correct: 0, wrong: 0, skipped: 0 }
    }
    subjectStats[q.subject].total++

    const topicKey = `${q.subject}|${q.topic}`
    if (!topicStats[topicKey]) {
      topicStats[topicKey] = { subject: q.subject, total: 0, correct: 0, wrong: 0, skipped: 0 }
    }
    topicStats[topicKey].total++

    let isCorrect = false
    let isAttempted = false

    if (!answer || answer.selectedAnswer === null) {
      skipped++
      subjectStats[q.subject].skipped++
      topicStats[topicKey].skipped++
    } else if (answer.selectedAnswer === q.correctAnswer) {
      isCorrect = true
      isAttempted = true
      correct++
      score += q.marks
      subjectStats[q.subject].correct++
      topicStats[topicKey].correct++
    } else {
      isAttempted = true
      wrong++
      subjectStats[q.subject].wrong++
      topicStats[topicKey].wrong++
    }

    questionDetails.push({
      questionId: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selectedAnswer: answer?.selectedAnswer ?? null,
      isCorrect,
      isAttempted,
      explanation: q.explanation,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      timeSpent: answer?.timeSpent || 0,
    })
  })

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)
  const accuracy = (correct + wrong) > 0 ? (correct / (correct + wrong)) * 100 : 0

  const subjectAnalysis: Record<string, import('../types').SubjectAnalysis> = {}
  Object.entries(subjectStats).forEach(([subject, stats]) => {
    subjectAnalysis[subject] = {
      subject,
      ...stats,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      timeSpent: 0,
    }
  })

  const topicAnalysis: Record<string, import('../types').TopicAnalysis> = {}
  Object.entries(topicStats).forEach(([key, stats]) => {
    const topic = key.split('|')[1]
    const acc = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
    topicAnalysis[topic] = {
      topic,
      subject: stats.subject,
      total: stats.total,
      correct: stats.correct,
      wrong: stats.wrong,
      skipped: stats.skipped,
      accuracy: acc,
      masteryLevel: acc >= 75 ? 'strong' : acc >= 50 ? 'improving' : 'weak',
    }
  })

  return {
    score,
    totalMarks,
    correct,
    wrong,
    skipped,
    accuracy,
    subjectAnalysis,
    topicAnalysis,
    questionDetails,
    weakTopics: Object.entries(subjectStats)
      .filter(([, stats]) => stats.total > 0 && (stats.correct / stats.total) < 0.5)
      .map(([subject]) => subject),
    strongTopics: Object.entries(subjectStats)
      .filter(([, stats]) => stats.total > 0 && (stats.correct / stats.total) >= 0.75)
      .map(([subject]) => subject),
  }
}

/**
 * Compute statistics for analytics dashboard
 */
export function computeAnalytics(results: import('../types').TestResult[]) {
  if (results.length === 0) {
    return {
      totalTests: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      totalStudyTime: 0,
      accuracyTrend: [] as { date: number; accuracy: number }[],
      scoreTrend: [] as { date: number; score: number; totalMarks: number }[],
      subjectPerformance: {} as Record<string, { total: number; correct: number; accuracy: number }>,
      topicMastery: {} as Record<string, { total: number; correct: number; accuracy: number; level: string }>,
    }
  }

  const totalTests = results.length
  const scores = results.map(r => r.totalMarks > 0 ? Math.round((r.score / r.totalMarks) * 100) : 0)
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const bestScore = Math.max(...scores)
  const worstScore = Math.min(...scores)
  const totalStudyTime = results.reduce((sum, r) => sum + r.timeSpent, 0)

  // Trends (chronological)
  const sorted = [...results].sort((a, b) => a.date - b.date)
  const accuracyTrend = sorted.map(r => ({ date: r.date, accuracy: Math.round(r.accuracy) }))
  const scoreTrend = sorted.map(r => ({
    date: r.date,
    score: r.totalMarks > 0 ? Math.round((r.score / r.totalMarks) * 100) : 0,
    totalMarks: 100,
  }))

  // Subject performance aggregation
  const subjectPerf: Record<string, { total: number; correct: number }> = {}
  results.forEach(r => {
    Object.entries(r.subjectAnalysis).forEach(([subject, data]) => {
      if (!subjectPerf[subject]) subjectPerf[subject] = { total: 0, correct: 0 }
      subjectPerf[subject].total += data.total
      subjectPerf[subject].correct += data.correct
    })
  })
  const subjectPerformance: Record<string, { total: number; correct: number; accuracy: number }> = {}
  Object.entries(subjectPerf).forEach(([s, d]) => {
    subjectPerformance[s] = { ...d, accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0 }
  })

  // Topic mastery aggregation
  const topicPerf: Record<string, { total: number; correct: number }> = {}
  results.forEach(r => {
    Object.entries(r.topicAnalysis).forEach(([topic, data]) => {
      if (!topicPerf[topic]) topicPerf[topic] = { total: 0, correct: 0 }
      topicPerf[topic].total += data.total
      topicPerf[topic].correct += data.correct
    })
  })
  const topicMastery: Record<string, { total: number; correct: number; accuracy: number; level: string }> = {}
  Object.entries(topicPerf).forEach(([t, d]) => {
    const acc = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
    topicMastery[t] = { ...d, accuracy: acc, level: acc >= 75 ? 'strong' : acc >= 50 ? 'improving' : 'weak' }
  })

  return { totalTests, averageScore, bestScore, worstScore, totalStudyTime, accuracyTrend, scoreTrend, subjectPerformance, topicMastery }
}

/**
 * Generate a unique ID using crypto API when available
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback with better entropy
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 10)
  const randomPart2 = Math.random().toString(36).substring(2, 6)
  return `${timestamp}-${randomPart}-${randomPart2}`
}
