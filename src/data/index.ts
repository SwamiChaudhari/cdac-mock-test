import type { Question, TestMode } from '../types'
import { shuffleArray } from '../utils'

// Lazy-load question banks
const questionModules = {
  english: () => import('./english.json'),
  quant: () => import('./quant.json'),
  reasoning: () => import('./reasoning.json'),
  computers: () => import('./computers.json'),
  cProgramming: () => import('./c_programming.json'),
  ds: () => import('./ds.json'),
  oop: () => import('./oop.json'),
  os: () => import('./os.json'),
  networking: () => import('./networking.json'),
  dbms: () => import('./dbms.json'),
  bigdata: () => import('./bigdata_ai.json'),
}

let cachedQuestions: Question[] | null = null

export async function loadAllQuestions(): Promise<Question[]> {
  if (cachedQuestions) return cachedQuestions
  
  const results = await Promise.all([
    questionModules.english(),
    questionModules.quant(),
    questionModules.reasoning(),
    questionModules.computers(),
    questionModules.cProgramming(),
    questionModules.ds(),
    questionModules.oop(),
    questionModules.os(),
    questionModules.networking(),
    questionModules.dbms(),
    questionModules.bigdata(),
  ])

  cachedQuestions = results.flatMap((m) => (m as { default: Question[] }).default)
  return cachedQuestions
}

export interface TestDistribution {
  [subject: string]: number
}

const FULL_MOCK_DISTRIBUTION: TestDistribution = {
  English: 15,
  'Quantitative Aptitude': 12,
  Reasoning: 12,
  'Computer Fundamentals': 11,
  'C Programming': 15,
  'Data Structures': 8,
  'OOP C++': 10,
  'Operating Systems': 5,
  Networking: 5,
  DBMS: 4,
  'Big Data & AI': 3,
}

const SECTION_A_DISTRIBUTION: TestDistribution = {
  English: 15,
  'Quantitative Aptitude': 12,
  Reasoning: 12,
  'Computer Fundamentals': 11,
}

const SECTION_B_DISTRIBUTION: TestDistribution = {
  'C Programming': 15,
  'Data Structures': 8,
  'OOP C++': 10,
  'Operating Systems': 5,
  Networking: 5,
  DBMS: 4,
  'Big Data & AI': 3,
}

const TEST_MODE_CONFIG: Record<TestMode, { distribution: TestDistribution; duration: number }> = {
  'full-mock': { distribution: FULL_MOCK_DISTRIBUTION, duration: 120 * 60 },
  'section-a': { distribution: SECTION_A_DISTRIBUTION, duration: 55 * 60 },
  'section-b': { distribution: SECTION_B_DISTRIBUTION, duration: 65 * 60 },
  'topic-practice': { distribution: {}, duration: 30 * 60 },
  'previous-mistakes': { distribution: {}, duration: 30 * 60 },
  'daily-challenge': { distribution: {}, duration: 20 * 60 },
  'rapid-revision': { distribution: {}, duration: 45 * 60 },
}

export function generateTest(
  mode: TestMode,
  questions: Question[],
  options?: { topic?: string; count?: number }
): { questions: Question[]; duration: number } {
  const config = TEST_MODE_CONFIG[mode]

  if (mode === 'topic-practice' && options?.topic) {
    const topicQuestions = questions.filter(
      (q) => q.topic === options.topic || q.subject === options.topic
    )
    return { questions: shuffleArray(topicQuestions).slice(0, options.count || 20), duration: config.duration }
  }

  if (mode === 'previous-mistakes') {
    const mistakeQuestions = questions.filter((q) => !q.correctAnswer)
    return { questions: shuffleArray(mistakeQuestions.length > 0 ? mistakeQuestions : questions).slice(0, 30), duration: config.duration }
  }

  if (mode === 'daily-challenge') {
    const allSubjects = [...new Set(questions.map((q) => q.subject))]
    const dayIndex = new Date().getDate() % allSubjects.length
    const selectedSubjects = allSubjects.slice(dayIndex, dayIndex + 4)
    const dailyQuestions = selectedSubjects.flatMap((sub) =>
      shuffleArray(questions.filter((q) => q.subject === sub)).slice(0, 5)
    )
    return { questions: dailyQuestions.slice(0, 20), duration: 20 * 60 }
  }

  if (mode === 'rapid-revision') {
    const importantTopics = ['Percentages', 'Profit & Loss', 'Time & Data Structures', 'C Programming', 'OSI Model']
    const rapidQuestions = importantTopics.flatMap((topic) =>
      shuffleArray(
        questions.filter((q) => q.topic === topic || q.subject.includes(topic))
      ).slice(0, 5)
    )
    return { questions: rapidQuestions.length >= 20 ? rapidQuestions.slice(0, 30) : shuffleArray(questions).slice(0, 30), duration: config.duration }
  }

  // For full-mock, section-a, section-b
  const distribution = config.distribution
  const selectedQuestions: Question[] = []

  for (const [subject, count] of Object.entries(distribution)) {
    const subjectQuestions = questions.filter((q) => q.subject === subject)
    const shuffled = shuffleArray(subjectQuestions)
    selectedQuestions.push(...shuffled.slice(0, count))
  }

  return { questions: shuffleArray(selectedQuestions), duration: config.duration }
}

export function getAllTopics(questions: Question[]): string[] {
  return [...new Set(questions.map((q) => q.topic))]
}

export function getAllSubjects(questions: Question[]): string[] {
  return [...new Set(questions.map((q) => q.subject))]
}
