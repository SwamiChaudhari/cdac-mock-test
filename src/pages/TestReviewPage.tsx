import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useHistoryStore } from '../stores/historyStore'
import { useGamificationStore } from '../stores/gamificationStore'

type FilterTab = 'all' | 'correct' | 'incorrect' | 'skipped'

export default function TestReviewPage() {
  const navigate = useNavigate()
  const { testId } = useParams<{ testId: string }>()
  const { testHistory } = useHistoryStore()
  const { addFlashcard } = useGamificationStore()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [expandedQ, setExpandedQ] = useState<string | null>(null)

  const testRecord = testHistory.find(t => t.id === testId)

  if (!testRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Test not found</p>
          <button onClick={() => navigate('/history')} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-sm">Back to History</button>
        </div>
      </div>
    )
  }

  const { result } = testRecord
  const details = result.questionDetails

  const filteredDetails = activeTab === 'all' ? details :
    activeTab === 'correct' ? details.filter(q => q.isCorrect) :
    activeTab === 'incorrect' ? details.filter(q => q.isAttempted && !q.isCorrect) :
    details.filter(q => !q.isAttempted)

  const scorePercent = result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0

  const handleGenerateFlashcards = () => {
    const incorrect = details.filter(q => !q.isCorrect)
    let count = 0
    incorrect.forEach(q => {
      addFlashcard({
        id: `fc-${q.questionId}-${Date.now()}-${count}`,
        front: q.question,
        back: q.options[q.correctAnswer],
        topic: q.topic,
        nextReview: Date.now(),
        interval: 1,
        easeFactor: 2.5,
        reviews: 0,
        correctReviews: 0,
      })
      count++
    })
    alert(`Generated ${count} flashcards from incorrect answers!`)
  }

  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{result.testName} — Review</h1>
              <p className="text-xs text-gray-400">
                {new Date(result.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <button onClick={() => navigate('/history')} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20">
              History
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Score Summary */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold">{result.score}/{result.totalMarks}</p>
              <p className="text-[10px] text-gray-400">Score</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${scorePercent >= 60 ? 'text-green-400' : 'text-red-400'}`}>{scorePercent}%</p>
              <p className="text-[10px] text-gray-400">Percentage</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{result.correct}</p>
              <p className="text-[10px] text-gray-400">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{result.wrong}</p>
              <p className="text-[10px] text-gray-400">Wrong</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">{result.skipped}</p>
              <p className="text-[10px] text-gray-400">Skipped</p>
            </div>
          </div>

          {/* Visual bar */}
          <div className="mt-3 h-3 bg-gray-700 rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full" style={{ width: `${(result.correct / details.length) * 100}%` }}></div>
            <div className="bg-red-500 h-full" style={{ width: `${(result.wrong / details.length) * 100}%` }}></div>
            <div className="bg-gray-500 h-full" style={{ width: `${(result.skipped / details.length) * 100}%` }}></div>
          </div>
          <div className="flex gap-4 mt-1 text-[10px] text-gray-400">
            <span>🟢 Correct</span><span>🔴 Wrong</span><span>⚪ Skipped</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={handleGenerateFlashcards}
            className="px-4 py-2 bg-purple-600 rounded-lg text-xs font-medium hover:bg-purple-700">
            Generate Flashcards from Mistakes
          </button>
          <button onClick={() => navigate('/learning')}
            className="px-4 py-2 bg-white/10 rounded-lg text-xs font-medium hover:bg-white/20">
            Learn from Mistakes
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {(['all', 'correct', 'incorrect', 'skipped'] as FilterTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium capitalize transition ${activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {tab} ({tab === 'all' ? details.length : tab === 'correct' ? result.correct : tab === 'incorrect' ? result.wrong : result.skipped})
            </button>
          ))}
        </div>

        {/* Question Cards */}
        <div className="space-y-3">
          {filteredDetails.map((q, idx) => (
            <div key={q.questionId} className="bg-white/5 rounded-xl border border-white/10 p-4">
              {/* Question header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-medium">Q{idx + 1}</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px]">{q.subject}</span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px]">{q.topic}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${q.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' : q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                    {q.difficulty}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${q.isCorrect ? 'bg-green-500/20 text-green-300' : q.isAttempted ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'}`}>
                  {q.isCorrect ? '✅ Correct' : q.isAttempted ? '❌ Incorrect' : '⚪ Skipped'}
                </span>
              </div>

              {/* Question text */}
              <p className="text-sm mb-3">{q.question}</p>

              {/* Options */}
              <div className="space-y-1.5 mb-3">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correctAnswer
                  const isSelected = oi === q.selectedAnswer
                  let optClass = 'bg-white/5 border-white/10'
                  if (isCorrect) optClass = 'bg-green-500/15 border-green-500/40'
                  else if (isSelected && !isCorrect) optClass = 'bg-red-500/15 border-red-500/40'

                  return (
                    <div key={oi} className={`px-3 py-2 rounded-lg border text-xs ${optClass}`}>
                      <span className="font-medium mr-2">{optionLabels[oi]}.</span>
                      {opt}
                      {isCorrect && <span className="ml-2 text-green-400">✓</span>}
                      {isSelected && !isCorrect && <span className="ml-2 text-red-400">✗ Your answer</span>}
                    </div>
                  )
                })}
              </div>

              {/* Expand explanation */}
              <button onClick={() => setExpandedQ(expandedQ === q.questionId ? null : q.questionId)}
                className="text-purple-400 text-xs hover:underline">
                {expandedQ === q.questionId ? 'Hide explanation' : 'Show explanation & concept'}
              </button>

              {expandedQ === q.questionId && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium mb-1">EXPLANATION</p>
                    <p className="text-xs text-gray-200">{q.explanation}</p>
                  </div>
                  {q.isAttempted && !q.isCorrect && (
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-1">WHY YOUR ANSWER IS WRONG</p>
                      <p className="text-xs text-red-300/80">
                        You selected "{q.options[q.selectedAnswer!]}" but the correct answer is "{q.options[q.correctAnswer]}".
                        {q.explanation && ' ' + q.explanation.split('.').slice(0, 2).join('.') + '.'}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium mb-1">TOPIC CONCEPT</p>
                    <p className="text-xs text-blue-300/80">
                      Topic: {q.topic} ({q.subject}) — {q.explanation.split('.').slice(0, 2).join('.')}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
