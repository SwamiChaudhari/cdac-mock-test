import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGamificationStore } from '../stores/gamificationStore'
import { computeAnalytics, formatTime } from '../utils'

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { results, totalCorrect, totalWrong, totalStudyTime, topicMastery } = useGamificationStore()

  const analytics = useMemo(() => computeAnalytics(results), [results])

  const overallAccuracy = (totalCorrect + totalWrong) > 0
    ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
    : 0

  const sortedTopics = useMemo(() => {
    return Object.entries(analytics.topicMastery)
      .sort(([, a], [, b]) => b.total - a.total)
  }, [analytics.topicMastery])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Performance Analytics</h1>
            <p className="text-xs text-gray-400">{analytics.totalTests} tests tracked</p>
          </div>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">
            Home
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {analytics.totalTests === 0 ? (
          <div className="bg-white/5 rounded-xl border border-white/10 p-12 text-center">
            <p className="text-gray-400 text-lg">No data yet</p>
            <p className="text-gray-500 text-sm mt-1">Complete tests to see your analytics</p>
            <button onClick={() => navigate('/')} className="mt-4 px-6 py-3 bg-purple-600 rounded-lg font-medium">
              Take a Test
            </button>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Tests Taken" value={analytics.totalTests.toString()} icon="📝" />
              <StatCard label="Average Score" value={`${analytics.averageScore}%`} icon="📊" />
              <StatCard label="Best Score" value={`${analytics.bestScore}%`} icon="🏆" />
              <StatCard label="Worst Score" value={`${analytics.worstScore}%`} icon="📉" />
              <StatCard label="Accuracy" value={`${overallAccuracy}%`} icon="🎯" />
              <StatCard label="Study Time" value={formatTime(analytics.totalStudyTime)} icon="⏱️" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Score Trend */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                <h3 className="text-sm font-bold mb-4">Score Trend</h3>
                {analytics.scoreTrend.length > 1 ? (
                  <div className="flex items-end gap-1 h-32">
                    {analytics.scoreTrend.slice(-10).map((point, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-gray-400">{point.score}%</span>
                        <div
                          className={`w-full rounded-t transition-all ${point.score >= 75 ? 'bg-green-500' : point.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ height: `${Math.max(5, point.score)}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">Take more tests to see trend</p>
                )}
              </div>

              {/* Accuracy Trend */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                <h3 className="text-sm font-bold mb-4">Accuracy Trend</h3>
                {analytics.accuracyTrend.length > 1 ? (
                  <div className="relative h-32">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[100, 75, 50, 25, 0].map(v => (
                        <div key={v} className="flex items-center gap-1">
                          <span className="text-[8px] text-gray-500 w-6">{v}</span>
                          <div className="flex-1 border-t border-white/5"></div>
                        </div>
                      ))}
                    </div>
                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end gap-1 pl-7">
                      {analytics.accuracyTrend.slice(-10).map((point, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          <div
                            className={`w-full rounded-t ${point.accuracy >= 75 ? 'bg-green-500' : point.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ height: `${Math.max(5, point.accuracy)}%` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">Take more tests to see trend</p>
                )}
              </div>
            </div>

            {/* Subject Performance */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <h3 className="text-sm font-bold mb-4">Subject-wise Performance</h3>
              <div className="space-y-3">
                {Object.entries(analytics.subjectPerformance)
                  .sort(([, a], [, b]) => b.total - a.total)
                  .map(([subject, data]) => (
                    <div key={subject} className="flex items-center gap-3">
                      <div className="w-28 sm:w-36 text-xs text-gray-300 truncate">{subject}</div>
                      <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${data.accuracy >= 75 ? 'bg-green-500' : data.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${data.accuracy}%` }}
                        ></div>
                      </div>
                      <div className="w-10 text-right text-xs font-medium">{data.accuracy}%</div>
                      <div className="w-14 text-right text-[10px] text-gray-400">{data.correct}/{data.total}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Topic Mastery */}
            {sortedTopics.length > 0 && (
              <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                <h3 className="text-sm font-bold mb-4">Topic Mastery Levels</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Strong */}
                  <div>
                    <p className="text-[10px] text-green-400 font-bold mb-2">🟢 STRONG</p>
                    <div className="flex flex-wrap gap-1">
                      {sortedTopics.filter(([, d]) => d.level === 'strong').map(([topic, d]) => (
                        <span key={topic} className="px-2 py-0.5 bg-green-500/15 text-green-300 rounded text-[10px]">{topic} {d.accuracy}%</span>
                      ))}
                      {sortedTopics.filter(([, d]) => d.level === 'strong').length === 0 && (
                        <span className="text-[10px] text-gray-500">Keep practicing</span>
                      )}
                    </div>
                  </div>
                  {/* Improving */}
                  <div>
                    <p className="text-[10px] text-yellow-400 font-bold mb-2">🟡 IMPROVING</p>
                    <div className="flex flex-wrap gap-1">
                      {sortedTopics.filter(([, d]) => d.level === 'improving').map(([topic, d]) => (
                        <span key={topic} className="px-2 py-0.5 bg-yellow-500/15 text-yellow-300 rounded text-[10px]">{topic} {d.accuracy}%</span>
                      ))}
                    </div>
                  </div>
                  {/* Weak */}
                  <div>
                    <p className="text-[10px] text-red-400 font-bold mb-2">🔴 WEAK</p>
                    <div className="flex flex-wrap gap-1">
                      {sortedTopics.filter(([, d]) => d.level === 'weak').map(([topic, d]) => (
                        <span key={topic} className="px-2 py-0.5 bg-red-500/15 text-red-300 rounded text-[10px]">{topic} {d.accuracy}%</span>
                      ))}
                      {sortedTopics.filter(([, d]) => d.level === 'weak').length === 0 && (
                        <span className="text-[10px] text-green-500">All clear!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {topicMastery.length > 0 && (
              <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                <h3 className="text-sm font-bold mb-4">💡 Recommendations</h3>
                <div className="space-y-2">
                  {topicMastery
                    .filter(t => t.masteryLevel === 'weak')
                    .slice(0, 5)
                    .map(t => (
                      <div key={t.topic} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                        <span className="text-red-400 text-xs">⚠️</span>
                        <span className="text-xs flex-1">Practice more <strong className="text-white">{t.topic}</strong> questions (current: {Math.round(t.accuracy)}%)</span>
                        <span className={`text-[10px] ${t.trend === 'improving' ? 'text-green-400' : t.trend === 'declining' ? 'text-red-400' : 'text-gray-400'}`}>
                          {t.trend === 'improving' ? '📈' : t.trend === 'declining' ? '📉' : '→'} {t.trend}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
      <span className="text-lg">{icon}</span>
      <p className="text-base font-bold mt-1">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  )
}
