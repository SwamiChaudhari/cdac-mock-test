import { useNavigate } from 'react-router-dom'
import { useGamificationStore } from '../stores/gamificationStore'
import type { TestResult } from '../types'

export default function LearningModePage() {
  const navigate = useNavigate()
  const { topicMastery, smartNotes, flashcards, mistakeHistory, results } = useGamificationStore()

  // Get weak topics from mastery data
  const weakTopics = topicMastery.filter(t => t.masteryLevel === 'weak').sort((a, b) => a.accuracy - b.accuracy)
  const improvingTopics = topicMastery.filter(t => t.masteryLevel === 'improving')
  const strongTopics = topicMastery.filter(t => t.masteryLevel === 'strong')

  // Get frequently incorrect questions
  const frequentMistakes = Object.entries(mistakeHistory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  // Revision recommendations based on weak topics
  const recommendations = weakTopics.slice(0, 5).map(t => ({
    topic: t.topic,
    subject: t.subject,
    accuracy: t.accuracy,
    attempts: t.totalAttempts,
    suggestion: `Practice 15-20 more questions from ${t.topic}. Current accuracy: ${Math.round(t.accuracy)}%.`,
  }))

  // Recent smart notes
  const recentNotes = smartNotes.slice(-20).reverse()
  const dueFlashcards = flashcards.filter(f => f.nextReview <= Date.now())

  // Trending topics
  const improvingTrend = topicMastery.filter(t => t.trend === 'improving')
  const decliningTrend = topicMastery.filter(t => t.trend === 'declining')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Learn from Mistakes</h1>
            <p className="text-xs text-gray-400">Personalized revision recommendations</p>
          </div>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">
            Home
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Weak Areas Alert */}
        {weakTopics.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
            <h2 className="text-base font-bold text-red-400 mb-3">⚠️ Weak Areas (Accuracy &lt; 50%)</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {weakTopics.map(t => (
                <span key={t.topic} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium">
                  {t.topic} ({Math.round(t.accuracy)}%)
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Recommendation: Practice <strong className="text-white">20 more questions</strong> from these topics to improve.
            </p>
            <button onClick={() => navigate('/')}
              className="mt-3 px-4 py-2 bg-red-600 rounded-lg text-xs font-medium hover:bg-red-700">
              Start Practice on Weak Topics
            </button>
          </div>
        )}

        {/* Revision Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-5">
            <h2 className="text-base font-bold mb-4">📋 Revision Recommendations</h2>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{rec.topic}</p>
                    <p className="text-xs text-gray-400">{rec.suggestion}</p>
                  </div>
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${rec.accuracy}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Smart Notes from Tests */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-5">
            <h2 className="text-base font-bold mb-4">📝 Smart Revision Notes</h2>
            {recentNotes.length === 0 ? (
              <p className="text-gray-400 text-sm">No notes yet. Complete tests to auto-generate notes.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {recentNotes.map(note => (
                  <div key={note.id} className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        note.type === 'formula' ? 'bg-blue-500/20 text-blue-300' :
                        note.type === 'concept' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>{note.type}</span>
                      <span className="text-[10px] text-gray-400">{note.subject}</span>
                    </div>
                    <p className="text-xs font-medium">{note.title}</p>
                    <p className="text-[11px] text-gray-300 mt-0.5 line-clamp-2">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flashcards Due */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">🃏 Flashcards Due</h2>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">{dueFlashcards.length} due</span>
            </div>
            {dueFlashcards.length === 0 ? (
              <p className="text-gray-400 text-sm">No flashcards due for review. Great job!</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {dueFlashcards.slice(0, 5).map(card => (
                  <div key={card.id} className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-[10px] text-purple-400">{card.topic}</p>
                    <p className="text-xs line-clamp-2">{card.front}</p>
                  </div>
                ))}
                <button onClick={() => navigate('/flashcards')}
                  className="w-full mt-2 py-2 bg-purple-600 rounded-lg text-xs font-medium hover:bg-purple-700">
                  Review All Flashcards
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Topic Mastery Overview */}
        {topicMastery.length > 0 && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-5">
            <h2 className="text-base font-bold mb-4">📊 Topic Mastery Levels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Strong */}
              <div>
                <p className="text-xs text-green-400 font-medium mb-2">🟢 Strong (≥75%)</p>
                <div className="flex flex-wrap gap-1.5">
                  {strongTopics.length === 0 ? <span className="text-[10px] text-gray-500">Keep practicing!</span> :strongTopics.map(t => (
                    <span key={t.topic} className="px-2 py-0.5 bg-green-500/15 text-green-300 rounded text-[10px]">{t.topic} {Math.round(t.accuracy)}%</span>
                  ))}
                </div>
              </div>
              {/* Improving */}
              <div>
                <p className="text-xs text-yellow-400 font-medium mb-2">🟡 Improving (50-74%)</p>
                <div className="flex flex-wrap gap-1.5">
                  {improvingTopics.length === 0 ? <span className="text-[10px] text-gray-500">None yet</span> :improvingTopics.map(t => (
                    <span key={t.topic} className="px-2 py-0.5 bg-yellow-500/15 text-yellow-300 rounded text-[10px]">{t.topic} {Math.round(t.accuracy)}%</span>
                  ))}
                </div>
              </div>
              {/* Weak */}
              <div>
                <p className="text-xs text-red-400 font-medium mb-2">🔴 Weak (&lt;50%)</p>
                <div className="flex flex-wrap gap-1.5">
                  {weakTopics.length === 0 ? <span className="text-[10px] text-gray-500">All strong!</span> :weakTopics.map(t => (
                    <span key={t.topic} className="px-2 py-0.5 bg-red-500/15 text-red-300 rounded text-[10px]">{t.topic} {Math.round(t.accuracy)}%</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Trend */}
            {(improvingTrend.length > 0 || decliningTrend.length > 0) && (
              <div className="mt-4 pt-4 border-t border-white/10 flex gap-4">
                {improvingTrend.length > 0 && (
                  <p className="text-xs text-green-400">📈 Improving: {improvingTrend.map(t => t.topic).join(', ')}</p>
                )}
                {decliningTrend.length > 0 && (
                  <p className="text-xs text-red-400">📉 Needs attention: {decliningTrend.map(t => t.topic).join(', ')}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {results.length === 0 && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-12 text-center">
            <p className="text-gray-400 text-lg">Take your first test to get started!</p>
            <p className="text-gray-500 text-sm mt-1">We'll analyze your mistakes and create a personalized learning plan.</p>
            <button onClick={() => navigate('/')} className="mt-4 px-6 py-3 bg-purple-600 rounded-lg font-medium hover:bg-purple-700">
              Start a Test
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
