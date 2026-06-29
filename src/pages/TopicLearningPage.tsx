import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTopicLearningStore } from '../stores/topicLearningStore'
import type { TopicCard } from '../types/topicCard'

function loadCards(): Promise<TopicCard[]> {
  return import('../data/topicCards/cards.json').then(m => m.default as unknown as TopicCard[])
}

type CardView = 'learn' | 'questions' | 'mastery'

export default function TopicLearningPage() {
  const navigate = useNavigate()
  const {
    currentIndex,
    setCurrentIndex,
    progress,
    markCompleted,
    setConfidence,
    toggleBookmark,
    getStats,
    darkMode,
    toggleDarkMode,
  } = useTopicLearningStore()

  const [topicCards, setTopicCards] = useState<TopicCard[]>([])
  const [cardsLoading, setCardsLoading] = useState(true)
  const [view, setView] = useState<CardView>('learn')
  const [revealedAnswer, setRevealedAnswer] = useState<number | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [swipeX, setSwipeX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showFormula, setShowFormula] = useState(false)
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const touchStartX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadCards().then(cards => {
      setTopicCards(cards)
      setCardsLoading(false)
    })
  }, [])

  // Filter cards
  const filteredCards = topicCards.filter((card: TopicCard) => {
    const matchSubject = filterSubject === 'all' || card.subject === filterSubject
    const matchSearch = searchQuery === '' ||
      card.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.subject.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSubject && matchSearch
  })

  const card = filteredCards[currentIndex] as TopicCard | undefined
  const cardProgress = card ? progress[card.id] : null
  const stats = getStats()

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
      if (e.key === 'Enter' && view === 'learn') setView('questions')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const goNext = useCallback(() => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setView('learn')
      setRevealedAnswer(null)
      setSelectedAnswer(null)
      setShowFormula(false)
      setSwipeX(0)
    }
  }, [currentIndex, filteredCards.length, setCurrentIndex])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setView('learn')
      setRevealedAnswer(null)
      setSelectedAnswer(null)
      setShowFormula(false)
      setSwipeX(0)
    }
  }, [currentIndex, setCurrentIndex])

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const diff = e.touches[0].clientX - touchStartX.current
    setSwipeX(diff)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (swipeX > 100) goPrev()
    else if (swipeX < -100) goNext()
    setSwipeX(0)
  }

  // Mouse drag for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const diff = e.clientX - touchStartX.current
    setSwipeX(diff)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (swipeX > 100) goPrev()
    else if (swipeX < -100) goNext()
    setSwipeX(0)
  }

  if (cardsLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold">Loading 1001 Topic Cards...</h2>
          <p className="text-gray-400 mt-2 text-sm">Preparing your learning experience</p>
        </div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No cards found</h2>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-purple-600 rounded-lg text-white">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const subjects = ['all', ...Array.from(new Set(topicCards.map((c: TopicCard) => c.subject)))]
  const totalCards = topicCards.length
  const progressPercent = totalCards > 0 ? Math.round((stats.totalCompleted / totalCards) * 100) : 0

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-black/40 backdrop-blur-md border-b border-white/10' : 'bg-white/80 backdrop-blur-md border-b border-gray-200'} p-3`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-white/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold">Topic Learning</h1>
              <p className="text-xs text-gray-400">
                {stats.totalCompleted}/{totalCards} completed ({progressPercent}%)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-white/10">
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-2">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / filteredCards.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-3 py-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => { setFilterSubject(subj); setCurrentIndex(0) }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filterSubject === subj
                  ? 'bg-purple-600 text-white'
                  : darkMode ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {subj === 'all' ? 'All Subjects' : subj}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentIndex(0) }}
          className={`w-full mt-2 px-4 py-2 rounded-lg text-sm ${
            darkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-white text-gray-900 border border-gray-200'
          } outline-none focus:ring-2 focus:ring-purple-500`}
        />
      </div>

      {/* Main Card Area */}
      <div className="max-w-4xl mx-auto px-3 py-4">
        <div
          ref={cardRef}
          className={`relative rounded-2xl overflow-hidden transition-transform ${isDragging ? '' : 'transition-all duration-300'}`}
          style={{ transform: `translateX(${swipeX * 0.3}px) rotate(${swipeX * 0.02}deg)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Card Header */}
          <div className={`rounded-t-2xl p-4 ${darkMode ? 'bg-gradient-to-r from-purple-800/50 to-pink-800/50' : 'bg-gradient-to-r from-purple-100 to-pink-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${darkMode ? 'bg-white/20' : 'bg-purple-200'}`}>
                  #{String(card.topicNumber).padStart(4, '0')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  card.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' :
                  card.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {card.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-sm">{'★'.repeat(card.importance)}{'☆'.repeat(5 - card.importance)}</span>
                <button onClick={() => toggleBookmark(card.id)} className="text-lg">
                  {cardProgress?.bookmarked ? '🔖' : '📑'}
                </button>
              </div>
            </div>
            <h2 className="text-xl font-bold mt-2">{card.topicName}</h2>
            <p className="text-xs text-gray-400 mt-1">{card.subject} • Expected: {card.expectedQuestions} questions</p>
          </div>

          {/* Card Body */}
          <div className={`p-5 ${darkMode ? 'bg-slate-800/80' : 'bg-white'} max-h-[60vh] overflow-y-auto`}>
            {view === 'learn' && (
              <div className="space-y-5">
                {/* Simple Explanation */}
                <section>
                  <h3 className="text-sm font-semibold text-purple-400 mb-2">📖 Simple Explanation</h3>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {card.simpleExplanation}
                  </p>
                </section>

                {/* Visual Diagram */}
                {card.visualDiagram && (
                  <section>
                    <h3 className="text-sm font-semibold text-purple-400 mb-2">📊 Visual</h3>
                    <pre className={`text-xs p-3 rounded-lg font-mono ${darkMode ? 'bg-black/30 text-green-300' : 'bg-gray-100 text-gray-800'}`}>
                      {card.visualDiagram}
                    </pre>
                  </section>
                )}

                {/* Real World Example */}
                <section>
                  <h3 className="text-sm font-semibold text-purple-400 mb-2">🌍 Real-World Example</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {card.realWorldExample}
                  </p>
                </section>

                {/* Formula */}
                {card.formula && (
                  <section>
                    <button
                      onClick={() => setShowFormula(!showFormula)}
                      className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-1"
                    >
                      📐 Formula {showFormula ? '▼' : '▶'}
                    </button>
                    {showFormula && (
                      <pre className={`text-xs p-3 rounded-lg font-mono ${darkMode ? 'bg-black/30 text-cyan-300' : 'bg-blue-50 text-gray-800'}`}>
                        {card.formula}
                      </pre>
                    )}
                  </section>
                )}

                {/* Memory Trick */}
                <section>
                  <h3 className="text-sm font-semibold text-purple-400 mb-2">🧠 Memory Trick</h3>
                  <div className={`text-sm p-3 rounded-lg border-l-4 border-yellow-500 ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                    {card.memoryTrick}
                  </div>
                </section>

                {/* Common Mistakes */}
                <section>
                  <h3 className="text-sm font-semibold text-purple-400 mb-2">⚠️ Common Mistakes</h3>
                  <ul className="space-y-1">
                    {card.commonMistakes.map((mistake, i) => (
                      <li key={i} className={`text-xs flex items-start gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="text-red-400">✗</span> {mistake}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Why It Matters */}
                <section>
                  <h3 className="text-sm font-semibold text-purple-400 mb-2">🎯 Why This Matters</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {card.whyItMatters}
                  </p>
                </section>

                {/* Quick Revision */}
                <section>
                  <h3 className="text-sm font-semibold text-purple-400 mb-2">⚡ Quick Revision</h3>
                  <ul className="space-y-1">
                    {card.quickRevision.map((point, i) => (
                      <li key={i} className={`text-xs flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-green-400">✓</span> {point}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}

            {view === 'questions' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-purple-400">📝 Top Questions on {card.topicName}</h3>
                {card.topQuestions.map((q, qi) => (
                  <div key={qi} className={`p-4 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className="text-sm font-medium mb-3">Q{qi + 1}. {q.q}</p>
                    <div className="space-y-2">
                      {q.opts.map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => setSelectedAnswer(oi)}
                          className={`w-full text-left text-xs p-2 rounded-lg transition-all ${
                            selectedAnswer === oi
                              ? oi === q.ans
                                ? 'bg-green-500/20 border border-green-500 text-green-300'
                                : 'bg-red-500/20 border border-red-500 text-red-300'
                              : revealedAnswer === qi && oi === q.ans
                                ? 'bg-green-500/20 border border-green-500 text-green-300'
                                : darkMode ? 'bg-white/5 hover:bg-white/10 border border-transparent' : 'bg-white hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                        </button>
                      ))}
                    </div>
                    {selectedAnswer !== null && (
                      <div className={`mt-3 p-2 rounded text-xs ${
                        selectedAnswer === q.ans ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'
                      }`}>
                        {selectedAnswer === q.ans ? '✅ Correct!' : `❌ Wrong. Answer: ${String.fromCharCode(65 + q.ans)}`}
                      </div>
                    )}
                    <button
                      onClick={() => setRevealedAnswer(qi)}
                      className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                    >
                      💡 Hint
                    </button>
                    {revealedAnswer === qi && (
                      <p className="mt-1 text-xs text-yellow-300">{q.hint}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {view === 'mastery' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-purple-400">🏆 Confidence Rating</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  How well do you understand <strong>{card.topicName}</strong>?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { level: 1, emoji: '😵', label: "Don't Understand", color: 'red' },
                    { level: 2, emoji: '🤔', label: 'Somewhat', color: 'yellow' },
                    { level: 3, emoji: '🙂', label: 'Understand', color: 'blue' },
                    { level: 4, emoji: '😎', label: 'Mastered', color: 'green' },
                  ].map(({ level, emoji, label, color }) => (
                    <button
                      key={level}
                      onClick={() => {
                        setConfidence(card.id, level as 0 | 1 | 2 | 3 | 4)
                        markCompleted(card.id)
                      }}
                      className={`p-4 rounded-xl text-center transition-all ${
                        cardProgress?.confidence === level
                          ? `bg-${color}-500/20 border-2 border-${color}-500 scale-105`
                          : darkMode ? 'bg-white/5 border-2 border-transparent hover:bg-white/10' : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-3xl mb-1">{emoji}</div>
                      <div className="text-xs font-medium">{label}</div>
                    </button>
                  ))}
                </div>
                {cardProgress?.confidence && (
                  <p className="text-xs text-center text-gray-400 mt-2">
                    Rated: {['', '😵 Confused', '🤔 Somewhat', '🙂 Understand', '😎 Mastered'][cardProgress.confidence]}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Card Footer / Navigation */}
          <div className={`p-4 rounded-b-2xl ${darkMode ? 'bg-slate-800/90 border-t border-white/5' : 'bg-gray-50 border-t border-gray-200'}`}>
            {/* View Tabs */}
            <div className="flex gap-2 mb-3">
              {(['learn', 'questions', 'mastery'] as CardView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    view === v
                      ? 'bg-purple-600 text-white'
                      : darkMode ? 'bg-white/10 text-gray-400 hover:bg-white/20' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {v === 'learn' ? '📖 Learn' : v === 'questions' ? '📝 Questions' : '🏆 Mastery'}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30 bg-white/10 hover:bg-white/20"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-400">
                {currentIndex + 1} / {filteredCards.length}
              </span>
              <button
                onClick={goNext}
                disabled={currentIndex === filteredCards.length - 1}
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30 bg-purple-600 hover:bg-purple-500 text-white"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Swipe hint */}
        <p className="text-center text-xs text-gray-500 mt-3">
          ← Swipe or use arrow keys to navigate →
        </p>
      </div>

      {/* Stats Footer */}
      <div className={`max-w-4xl mx-auto px-3 pb-6`}>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-sm font-semibold mb-3">📊 Your Progress</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-400">{stats.totalCompleted}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{stats.totalBookmarked}</div>
              <div className="text-xs text-gray-400">Bookmarked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.strongTopics.length}</div>
              <div className="text-xs text-gray-400">Mastered</div>
            </div>
          </div>
          {stats.weakTopics.length > 0 && (
            <div className="mt-3 p-2 rounded-lg bg-red-500/10">
              <p className="text-xs text-red-300">
                ⚠️ {stats.weakTopics.length} topics need revision
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
