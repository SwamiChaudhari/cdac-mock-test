import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGamificationStore, getLevelProgress, ACHIEVEMENTS } from '../stores/gamificationStore'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { xp, level, streak, achievements, totalTests, averageScore, bestScore, worstScore, totalCorrect, totalWrong, totalStudyTime, results, flashcards, dailyQuests, smartNotes } = useGamificationStore()
  const levelProgress = getLevelProgress(xp)
  const [activeTab, setActiveTab] = useState<'overview' | 'quests' | 'achievements' | 'flashcards'>('overview')

  const recentResults = [...results].reverse().slice(0, 5)
  const dueFlashcards = flashcards.filter(f => f.nextReview <= Date.now()).slice(0, 10)

  // Subject performance aggregation
  const subjectPerf: Record<string, { total: number; correct: number }> = {}
  results.forEach((r) => {
    Object.entries(r.subjectAnalysis).forEach(([subject, data]) => {
      if (!subjectPerf[subject]) subjectPerf[subject] = { total: 0, correct: 0 }
      subjectPerf[subject].total += data.total
      subjectPerf[subject].correct += data.correct
    })
  })

  // Predicted score
  const weights: Record<string, number> = {
    'English': 0.10, 'Quantitative Aptitude': 0.20, 'Reasoning': 0.15,
    'Computer Fundamentals': 0.05, 'C Programming': 0.15, 'Data Structures': 0.12,
    'OOP C++': 0.10, 'Operating Systems': 0.05, 'Networking': 0.04, 'DBMS': 0.03, 'Big Data & AI': 0.01
  }
  let predictedScore = 0
  Object.entries(subjectPerf).forEach(([subject, data]) => {
    if (data.total > 0) {
      const acc = (data.correct / data.total) * 100
      predictedScore += (weights[subject] || 0.05) * acc
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header with Level/XP */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-3 sm:p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg shadow-orange-500/30">
              {level}
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Level {level}</p>
              <div className="w-24 sm:w-48 h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all" style={{ width: `${levelProgress.percent}%` }}></div>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{levelProgress.current}/{levelProgress.needed} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-yellow-400">{xp}</p>
              <p className="text-[10px] sm:text-xs text-gray-400">XP</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-orange-400">🔥 {streak}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">Streak</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="text-2xl font-bold text-green-400">{Math.round(predictedScore)}%</p>
              <p className="text-xs text-gray-400">Predicted</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-3 sm:p-6">
        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
          {(['overview', 'quests', 'achievements', 'flashcards'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm capitalize transition whitespace-nowrap ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Stats */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Tests Taken" value={totalTests} icon="📝" />
                <StatCard label="Avg Score" value={`${averageScore}%`} icon="📊" />
                <StatCard label="Best Score" value={`${bestScore}%`} icon="🏆" />
                <StatCard label="Accuracy" value={`${totalCorrect + totalWrong > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0}%`} icon="🎯" />
              </div>

              {/* Subject Performance */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Subject Performance</h3>
                <div className="space-y-3">
                  {Object.entries(subjectPerf).sort((a, b) => b[1].total - a[1].total).map(([subject, data]) => {
                    const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
                    return (
                      <div key={subject} className="flex items-center gap-2 sm:gap-3">
                        <div className="w-24 sm:w-32 text-xs sm:text-sm text-gray-300 truncate">{subject}</div>
                        <div className="flex-1 h-2 sm:h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${acc >= 75 ? 'bg-green-500' : acc >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${acc}%` }}></div>
                        </div>
                        <div className="w-10 text-right text-xs sm:text-sm font-medium">{acc}%</div>
                      </div>
                    )
                  })}
                  {Object.keys(subjectPerf).length === 0 && <p className="text-gray-500 text-center py-4 text-sm">Take some tests to see performance</p>}
                </div>
              </div>

              {/* Recent Tests */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Recent Tests</h3>
                <div className="space-y-2">
                  {recentResults.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="text-xs sm:text-sm font-medium">{r.mode}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-bold">{r.score}/{r.totalMarks}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">{Math.round(r.accuracy)}% acc</p>
                      </div>
                    </div>
                  ))}
                  {recentResults.length === 0 && <p className="text-gray-500 text-center py-4 text-sm">No tests yet</p>}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Due Flashcards */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3">📚 Due for Review</h3>
                <p className="text-2xl sm:text-3xl font-bold text-purple-400">{dueFlashcards.length}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">flashcards ready</p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={() => navigate('/')} className="block w-full text-center py-2 bg-purple-600 rounded-lg hover:bg-purple-700 text-sm">Start Practice</button>
                  <button onClick={() => navigate('/revision')} className="block w-full text-center py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">Review Mistakes</button>
                  <button onClick={() => navigate('/history')} className="block w-full text-center py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">Test History</button>
                  <button onClick={() => navigate('/learning')} className="block w-full text-center py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">Learn from Mistakes</button>
                  <button onClick={() => navigate('/analytics')} className="block w-full text-center py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">Analytics</button>
                </div>
              </div>

              {/* Score Trend */}
              {results.length > 1 && (
                <div className="bg-white/5 rounded-xl border border-white/10 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Score Trend</h3>
                  <div className="flex items-end gap-1 h-20 sm:h-24">
                    {results.slice(-8).map((r, idx) => {
                      const height = r.totalMarks > 0 ? (r.score / r.totalMarks) * 100 : 0
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-purple-500 rounded-t" style={{ height: `${height}%` }}></div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'quests' && (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Daily Quests</h2>
            {dailyQuests.map(quest => (
              <div key={quest.id} className={`p-3 sm:p-4 rounded-xl border ${quest.completed ? 'bg-green-900/30 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm sm:text-base">{quest.title}</p>
                    <p className="text-xs sm:text-sm text-gray-400">{quest.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold text-sm">+{quest.xpReward} XP</p>
                    {quest.completed && <p className="text-green-400 text-xs sm:text-sm">✓ Done</p>}
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}></div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{quest.current}/{quest.target}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {ACHIEVEMENTS.map(a => {
              const unlocked = achievements.includes(a.id)
              return (
                <div key={a.id} className={`p-3 sm:p-4 rounded-xl border ${unlocked ? 'bg-yellow-900/30 border-yellow-500/30' : 'bg-white/5 border-white/10 opacity-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl">{a.icon}</span>
                    <div>
                      <p className="font-medium text-sm sm:text-base">{a.title}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">{a.description}</p>
                    </div>
                  </div>
                  {unlocked && <p className="text-yellow-400 text-xs mt-2">🏆 Unlocked!</p>}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-4">Flashcards ({flashcards.length})</h2>
            {dueFlashcards.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-purple-400 mb-3">Due for Review ({dueFlashcards.length})</h3>
                <div className="space-y-3">
                  {dueFlashcards.map(card => (
                    <FlashcardItem key={card.id} card={card} />
                  ))}
                </div>
              </div>
            )}
            {flashcards.length === 0 && (
              <p className="text-gray-500 text-center py-8 text-sm">No flashcards yet. Create some during practice!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4 text-center">
      <span className="text-xl sm:text-2xl">{icon}</span>
      <p className="text-lg sm:text-2xl font-bold mt-1">{value}</p>
      <p className="text-[10px] sm:text-xs text-gray-400">{label}</p>
    </div>
  )
}

function FlashcardItem({ card }: { card: any }) {
  const [flipped, setFlipped] = useState(false)
  const { reviewFlashcard } = useGamificationStore()

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4 cursor-pointer active:bg-white/10" onClick={() => setFlipped(!flipped)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] sm:text-xs text-purple-400 mb-1">{card.topic}</p>
          {flipped ? (
            <div>
              <p className="text-xs sm:text-sm text-gray-200">{card.back}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={(e) => { e.stopPropagation(); reviewFlashcard(card.id, false) }} className="px-3 py-1 bg-red-600 rounded text-xs">Again</button>
                <button onClick={(e) => { e.stopPropagation(); reviewFlashcard(card.id, true) }} className="px-3 py-1 bg-green-600 rounded text-xs">Got it</button>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm">{card.front}</p>
          )}
        </div>
        <span className="text-gray-500 text-xs">{flipped ? '👁️' : '🔒'}</span>
      </div>
    </div>
  )
}
