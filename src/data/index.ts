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
  // New high-yield question banks with learning metadata
  quantPctRatio: () => import('./questions/quant_pct_ratio.json'),
  quantProfitLoss: () => import('./questions/quant_profit_loss.json'),
  quantAverage: () => import('./questions/quant_average.json'),
  quantTimeWork: () => import('./questions/quant_time_work.json'),
  quantTsd: () => import('./questions/quant_tsd.json'),
  quantProbability: () => import('./questions/quant_probability.json'),
  cProgrammingTier2: () => import('./questions/c_programming_tier2.json'),
  dsTier2: () => import('./questions/ds_tier2.json'),
  oopTier2: () => import('./questions/oop_tier2.json'),
  osTier3: () => import('./questions/os_tier3.json'),
  networkingTier3: () => import('./questions/networking_tier3.json'),
  compfundTier1: () => import('./questions/compfund_tier1.json'),
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
    // New high-yield banks
    questionModules.quantPctRatio(),
    questionModules.quantProfitLoss(),
    questionModules.quantAverage(),
    questionModules.quantTimeWork(),
    questionModules.quantTsd(),
    questionModules.quantProbability(),
    questionModules.cProgrammingTier2(),
    questionModules.dsTier2(),
    questionModules.oopTier2(),
    questionModules.osTier3(),
    questionModules.networkingTier3(),
    questionModules.compfundTier1(),
  ])

  // Deduplicate on load: use normalized question text as key
  const seen = new Set<string>()
  const deduped: Question[] = []
  
  for (const m of results) {
    const questions = (m as any).default as Question[]
    for (const q of questions) {
      const key = normalizeQuestion(q.question)
      if (!seen.has(key)) {
        seen.add(key)
        deduped.push(q)
      }
    }
  }

  cachedQuestions = deduped
  return deduped
}

function normalizeQuestion(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim()
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

/**
 * Intelligent question selection that prevents duplicates within a test.
 * Uses weighted randomization: prefers questions the user hasn't seen,
 * and balances difficulty within each subject.
 */
function selectQuestionsNoDupPool(
  pool: Question[],
  count: number,
  excludeIds: Set<string>
): Question[] {
  // Filter out excluded questions
  const available = pool.filter(q => !excludeIds.has(q.id))
  
  if (available.length <= count) {
    return shuffleArray(available)
  }

  // Weighted shuffle: weight by inverse frequency of topic/difficulty
  // to maximize topic coverage
  const topicCount: Record<string, number> = {}
  
  const weighted = available.map(q => {
    const topicKey = `${q.subject}|${q.topic}`
    const currentCount = topicCount[topicKey] || 0
    // Lower count = higher weight (prefer unseen topics)
    const weight = 1 / (1 + currentCount)
    return { question: q, weight, topicKey }
  })

  const selected: Question[] = []
  
  for (let i = 0; i < count; i++) {
    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const item of weighted) {
      random -= item.weight
      if (random <= 0) {
        selected.push(item.question)
        topicCount[item.topicKey] = (topicCount[item.topicKey] || 0) + 1
        // Set weight to 0 so it won't be selected again
        item.weight = 0
        break
      }
    }
  }

  return selected
}

export function generateTest(
  mode: TestMode,
  questions: Question[],
  options?: { topic?: string; count?: number; excludeIds?: Set<string>; mistakeIds?: string[] }
): { questions: Question[]; duration: number } {
  const config = TEST_MODE_CONFIG[mode]
  const excludeIds = options?.excludeIds || new Set<string>()

  if (mode === 'topic-practice' && options?.topic) {
    const topicQuestions = questions.filter(
      (q) => q.topic === options.topic || q.subject === options.topic
    )
    const available = topicQuestions.filter(q => !excludeIds.has(q.id))
    const selected = selectQuestionsNoDupPool(available, options.count || 20, new Set())
    return { questions: shuffleArray(selected), duration: config.duration }
  }

  if (mode === 'previous-mistakes') {
    // Use the actual mistake IDs passed from statsStore
    if (options?.mistakeIds && options.mistakeIds.length > 0) {
      const mistakeQuestions = questions.filter(
        (q) => options.mistakeIds!.includes(q.id)
      )
      return { questions: shuffleArray(mistakeQuestions).slice(0, 30), duration: config.duration }
    }
    // Fallback: return empty if no mistakes
    return { questions: [], duration: config.duration }
  }

  if (mode === 'daily-challenge') {
    // Use a date-seeded selection for consistency within a day
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
    
    const allSubjects = [...new Set(questions.map((q) => q.subject))]
    // Deterministic shuffle based on date seed
    const seededSubjects = seededShuffle(allSubjects, seed)
    const selectedSubjects = seededSubjects.slice(0, 4)
    
    const dailyQuestions: Question[] = []
    for (const sub of selectedSubjects) {
      const subQuestions = questions.filter(
        (q) => q.subject === sub && !excludeIds.has(q.id)
      )
      const selected = selectQuestionsNoDupPool(subQuestions, 5, new Set())
      dailyQuestions.push(...selected)
    }
    
    return { questions: seededShuffle(dailyQuestions, seed + 1).slice(0, 20), duration: 20 * 60 }
  }

  if (mode === 'rapid-revision') {
    // Cover high-priority topics with balanced difficulty
    const importantTopics = ['Percentages', 'Profit & Loss', 'Time & Work', 'Data Structures', 'C Programming', 'OSI Model', 'Averages', 'Probability']
    const rapidQuestions: Question[] = []
    const usedIds = new Set<string>()
    
    for (const topic of importantTopics) {
      const topicQs = questions.filter(
        (q) => (q.topic === topic || q.subject.includes(topic)) && !excludeIds.has(q.id) && !usedIds.has(q.id)
      )
      const selected = selectQuestionsNoDupPool(topicQs, 4, new Set())
      selected.forEach(q => {
        rapidQuestions.push(q)
        usedIds.add(q.id)
      })
    }
    
    if (rapidQuestions.length < 20) {
      // Fill remaining from general pool
      const remaining = questions.filter(q => !excludeIds.has(q.id) && !usedIds.has(q.id))
      const fill = selectQuestionsNoDupPool(remaining, 20 - rapidQuestions.length, new Set())
      rapidQuestions.push(...fill)
    }
    
    return { questions: shuffleArray(rapidQuestions).slice(0, 30), duration: config.duration }
  }

  // For full-mock, section-a, section-b
  const distribution = config.distribution
  const selectedQuestions: Question[] = []
  const usedIds = new Set<string>()

  for (const [subject, count] of Object.entries(distribution)) {
    const subjectQuestions = questions.filter(
      (q) => q.subject === subject && !excludeIds.has(q.id) && !usedIds.has(q.id)
    )
    
    // Balance difficulty: try to get a mix of easy/medium/hard
    const easy = subjectQuestions.filter(q => q.difficulty === 'easy')
    const medium = subjectQuestions.filter(q => q.difficulty === 'medium')
    const hard = subjectQuestions.filter(q => q.difficulty === 'hard')
    
    const perDifficulty = Math.floor(count / 3)
    const remainder = count - perDifficulty * 3
    
    const selected: Question[] = [
      ...selectQuestionsNoDupPool(easy, perDifficulty + (remainder > 0 ? 1 : 0), usedIds),
      ...selectQuestionsNoDupPool(medium, perDifficulty + (remainder > 1 ? 1 : 0), usedIds),
      ...selectQuestionsNoDupPool(hard, perDifficulty, usedIds),
    ]
    
    // If we don't have enough balanced questions, fill from remaining
    if (selected.length < count) {
      const additional = selectQuestionsNoDupPool(
        subjectQuestions.filter(q => !usedIds.has(q.id)),
        count - selected.length,
        usedIds
      )
      selected.push(...additional)
    }
    
    selected.forEach(q => {
      selectedQuestions.push(q)
      usedIds.add(q.id)
    })
  }

  return { questions: shuffleArray(selectedQuestions), duration: config.duration }
}

/**
 * Seeded shuffle - deterministic given same seed
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array]
  let s = seed
  for (let i = arr.length - 1; i > 0; i--) {
    // Simple LCG for deterministic random
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function getAllTopics(questions: Question[]): string[] {
  return [...new Set(questions.map((q) => q.topic))]
}

export function getAllSubjects(questions: Question[]): string[] {
  return [...new Set(questions.map((q) => q.subject))]
}

/**
 * Verify question bank has no duplicates
 */
export function verifyUniqueQuestions(questions: Question[]): {
  total: number
  unique: number
  duplicates: string[]
} {
  const seen = new Map<string, string>() // normalized -> first id
  const duplicates: string[] = []
  
  for (const q of questions) {
    const key = normalizeQuestion(q.question)
    if (seen.has(key)) {
      duplicates.push(`${q.id} (dup of ${seen.get(key)})`)
    } else {
      seen.set(key, q.id)
    }
  }
  
  return {
    total: questions.length,
    unique: seen.size,
    duplicates,
  }
}
