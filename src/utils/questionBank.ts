// Question Bank Loader — merges old + new questions with priority ranking
// Prioritizes: New questions (with metadata) > High-yield old questions > Low-yield old questions

export interface Question {
  id: string;
  section: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  marks: number;
  // Learning metadata (new questions only)
  formula?: string;
  concept?: string;
  hint?: string;
  shortcut?: string;
  commonMistake?: string;
  memoryTrick?: string;
  examImportance?: {
    frequency: string;
    probability: string;
    score: number;
  };
  level?: string;
  // Internal
  _priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  _hasMetadata?: boolean;
}

// CDAC C-CAT Topic Priority Tiers
const TIER1_TOPICS = new Set([
  'Percentages', 'Ratio & Proportion', 'Profit & Loss', 'Averages',
  'Time & Work', 'Time, Speed & Distance', 'Probability',
  'Number Series', 'Coding-Decoding', 'Blood Relations',
  'Number System & Conversions', 'Memory Types (RAM, ROM, Cache)',
  'CPU, Registers, ALU, CU', 'Algorithms & Flowcharts',
]);

const TIER2_TOPICS = new Set([
  'Pointers', 'Arrays', 'Strings', 'Functions', 'Recursion',
  'Data Types', 'Operators & Precedence', 'Loops',
  'Stack', 'Queue', 'Linked List', 'Binary Search',
  'Sorting Complexities', 'Time Complexity', 'Tree Traversals',
  'Class & Object', 'Constructor', 'Destructor',
  'Inheritance', 'Virtual Function', 'Abstract Class',
  'Process States', 'CPU Scheduling', 'Deadlock',
  'Paging', 'Virtual Memory',
]);

const TIER3_TOPICS = new Set([
  'OSI Model', 'TCP/IP Model', 'TCP vs UDP',
  'DNS', 'HTTP & HTTPS', 'IP Addressing', 'ARP', 'ICMP',
]);

export function getQuestionPriority(question: Question): 'HIGH' | 'MEDIUM' | 'LOW' {
  const topic = question.topic;
  if (TIER1_TOPICS.has(topic) || TIER2_TOPICS.has(topic)) return 'HIGH';
  if (TIER3_TOPICS.has(topic)) return 'MEDIUM';
  return 'LOW';
}

export function getQualityScore(question: Question): number {
  let score = 0;
  
  // Has learning metadata (+30)
  if (question.formula && question.concept && question.hint) score += 30;
  
  // Question length appropriate (+20)
  if (question.question.length >= 50 && question.question.length <= 500) score += 20;
  
  // Has detailed explanation (+15)
  if (question.explanation && question.explanation.length >= 30) score += 15;
  
  // Priority topic (+20)
  if (getQuestionPriority(question) === 'HIGH') score += 20;
  else if (getQuestionPriority(question) === 'MEDIUM') score += 10;
  
  // Has memory trick (+10)
  if (question.memoryTrick) score += 10;
  
  // Has shortcut (+5)
  if (question.shortcut) score += 5;
  
  return score;
}

export function filterHighQualityQuestions(questions: Question[], minScore = 40): Question[] {
  return questions
    .filter(q => getQualityScore(q) >= minScore)
    .sort((a, b) => getQualityScore(b) - getQualityScore(a));
}

export function generateAdaptiveQuestionSet(
  allQuestions: Question[],
  options: {
    count?: number;
    focusWeakTopics?: string[];
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    section?: 'A' | 'B' | 'both';
    prioritizeMetadata?: boolean;
  } = {}
): Question[] {
  const {
    count = 20,
    focusWeakTopics = [],
    difficulty = 'mixed',
    section = 'both',
    prioritizeMetadata = true,
  } = options;
  
  let filtered = [...allQuestions];
  
  // Filter by section
  if (section !== 'both') {
    filtered = filtered.filter(q => q.section === section);
  }
  
  // Filter by difficulty
  if (difficulty !== 'mixed') {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  
  // Score each question
  const scored = filtered.map(q => ({
    question: q,
    score: getQualityScore(q) + 
           (focusWeakTopics.includes(q.topic) ? 50 : 0) +
           (q._hasMetadata && prioritizeMetadata ? 20 : 0) +
           (q.examImportance?.score || 0)
  }));
  
  // Sort by score and return top N
  scored.sort((a, b) => b.score - a.score);
  
  // Deduplicate by similar content
  const selected: Question[] = [];
  const usedStems = new Set<string>();
  
  for (const { question } of scored) {
    if (selected.length >= count) break;
    
    // Simple dedup by first 50 chars
    const stem = question.question.slice(0, 50).toLowerCase().replace(/\s+/g, ' ');
    if (usedStems.has(stem)) continue;
    
    usedStems.add(stem);
    selected.push(question);
  }
  
  return selected;
}

// CDAC C-CAT Full Mock distribution
export const FULL_MOCK_DISTRIBUTION = {
  'English': 15,
  'Quantitative Aptitude': 12,
  'Reasoning': 12,
  'Computer Fundamentals': 11,
  'C Programming': 15,
  'Data Structures': 8,
  'OOP C++': 10,
  'Operating Systems': 5,
  'Networking': 5,
  'DBMS': 4,
  'Big Data & AI': 3,
};

export function generateFullMockTest(allQuestions: Question[]): Question[] {
  const test: Question[] = [];
  
  for (const [subject, count] of Object.entries(FULL_MOCK_DISTRIBUTION)) {
    const subjectQuestions = allQuestions.filter(q => q.subject === subject);
    const highQuality = subjectQuestions
      .sort((a, b) => getQualityScore(b) - getQualityScore(a));
    
    // Pick top N unique questions
    const selected = highQuality.slice(0, count);
    test.push(...selected);
  }
  
  // Shuffle
  for (let i = test.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [test[i], test[j]] = [test[j], test[i]];
  }
  
  return test;
}
