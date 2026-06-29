import { useNavigate } from 'react-router-dom'
import { useAdaptiveLearning } from '../stores/adaptiveLearning'
import { useGamificationStore } from '../stores/gamificationStore'

export default function PreviousMistakesPage() {
  const navigate = useNavigate()
  const { attempts, topicMastery, getTopicRecommendations } = useAdaptiveLearning()
  const { mistakeHistory } = useGamificationStore()

  // Get all incorrect attempts
  const incorrectAttempts = attempts.filter(a => !a.correct)

  // Group by topic
  const mistakesByTopic = incorrectAttempts.reduce((acc, attempt) => {
    const key = `${attempt.subject} - ${attempt.topic}`
    if (!acc[key]) acc[key] = []
    acc[key].push(attempt)
    return acc
  }, {} as Record<string, typeof incorrectAttempts>)

  // Get recommendations
  const recommendations = getTopicRecommendations()

  // Most frequently mistaken question IDs
  const frequentMistakes = Object.entries(mistakeHistory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900 text-white">
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">❌ Previous Mistakes</h1>
            <p className="text-xs text-gray-400">Review and learn from your errors</p>
          </div>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">
            ← Home
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{incorrectAttempts.length}</p>
            <p className="text-[10px] text-gray-400">Total Mistakes</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{Object.keys(mistakesByTopic).length}</p>
            <p className="text-[10px] text-gray-400">Topics with Errors</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{Object.keys(mistakeHistory).length}</p>
            <p className="text-[10px] text-gray-400">Unique Questions Wrong</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{recommendations.length}</p>
            <p className="text-[10px] text-gray-400">Topics to Review</p>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
            <h2 className="text-sm font-bold text-red-400 mb-3">🎯 Priority Review</h2>
            <div className="space-y-2">
              {recommendations.slice(0, 5).map((rec, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rec.priority === 'HIGH' ? 'bg-red-500/30 text-red-300' :
                    rec.priority === 'MEDIUM' ? 'bg-yellow-500/30 text-yellow-300' :
                    'bg-gray-500/30 text-gray-300'
                  }`}>{rec.priority}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{rec.topic}</p>
                    <p className="text-[10px] text-gray-400">{rec.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mistakes by Topic */}
        {Object.keys(mistakesByTopic).length > 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-bold mb-4">📊 Mistakes by Topic</h2>
            <div className="space-y-3">
              {Object.entries(mistakesByTopic)
                .sort(([, a], [, b]) => b.length - a.length)
                .map(([topic, mistakes]) => {
                  const mastery = Object.values(topicMastery).find(
                    t => `${t.subject}::${t.topic}` === topic || topic.includes(t.topic)
                  )
                  return (
                    <div key={topic} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <p className="text-xs font-medium">{topic}</p>
                        <p className="text-[10px] text-gray-400">{mistakes.length} mistakes</p>
                      </div>
                      {mastery && (
                        <div className="w-20">
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                mastery.accuracy >= 0.7 ? 'bg-green-500' :
                                mastery.accuracy >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${mastery.accuracy * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">{Math.round(mastery.accuracy * 100)}%</p>
                        </div>
                      )}
                      <span className="text-xs text-red-400 font-medium">×{mistakes.length}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-gray-300 font-medium">No mistakes recorded yet!</p>
            <p className="text-gray-500 text-sm mt-1">Take a test to start tracking your performance.</p>
            <button onClick={() => navigate('/')} className="mt-4 px-6 py-3 bg-purple-600 rounded-lg font-medium hover:bg-purple-700 text-sm">
              Start a Test
            </button>
          </div>
        )}

        {/* Frequently Mistaken Questions */}
        {frequentMistakes.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-bold mb-4">🔁 Most Repeated Mistakes</h2>
            <div className="space-y-2">
              {frequentMistakes.map(([qid, count]) => (
                <div key={qid} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  <span className="text-xs font-mono text-gray-400">{qid.slice(0, 12)}</span>
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(count * 20, 100)}%` }}></div>
                  </div>
                  <span className="text-xs text-red-400">×{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
