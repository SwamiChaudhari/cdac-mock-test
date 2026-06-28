import { useNavigate } from 'react-router-dom'
import { useStatsStore } from '../stores/statsStore'
import { formatTime } from '../utils'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { totalTests, averageScore, bestScore, totalCorrect, totalWrong, results } = useStatsStore()

  const recentResults = [...results].reverse().slice(0, 5)

  // Subject performance aggregation
  const subjectPerf: Record<string, { total: number; correct: number }> = {}
  results.forEach((r) => {
    Object.entries(r.subjectAnalysis).forEach(([subject, data]) => {
      if (!subjectPerf[subject]) subjectPerf[subject] = { total: 0, correct: 0 }
      subjectPerf[subject].total += data.total
      subjectPerf[subject].correct += data.correct
    })
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
            <p className="text-gray-500">Track your progress and improve</p>
          </div>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Home
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{totalTests}</p>
            <p className="text-sm text-gray-500">Total Tests</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{averageScore}</p>
            <p className="text-sm text-gray-500">Avg Score</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{bestScore}</p>
            <p className="text-sm text-gray-500">Best Score</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-orange-600">{totalTests > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) || 0 : 0}%</p>
            <p className="text-sm text-gray-500">Overall Accuracy</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h2>
            <div className="space-y-3">
              {Object.entries(subjectPerf).map(([subject, data]) => {
                const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
                return (
                  <div key={subject} className="flex items-center gap-3">
                    <div className="w-28 text-sm text-gray-700 truncate">{subject}</div>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${acc >= 75 ? 'bg-green-500' : acc >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${acc}%` }}></div>
                    </div>
                    <div className="w-10 text-right text-xs font-medium">{acc}%</div>
                  </div>
                )
              })}
              {Object.keys(subjectPerf).length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">Take some tests to see performance data</p>
              )}
            </div>
          </div>

          {/* Recent Tests */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tests</h2>
            <div className="space-y-3">
              {recentResults.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{r.mode}</p>
                    <p className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{r.score}/{r.totalMarks}</p>
                    <p className="text-xs text-gray-500">{Math.round(r.accuracy)}% acc</p>
                  </div>
                </div>
              ))}
              {recentResults.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">No tests taken yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Score Trend */}
        {results.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Score Trend</h2>
            <div className="flex items-end gap-2 h-40">
              {results.slice(-10).map((r, idx) => {
                const height = r.totalMarks > 0 ? (r.score / r.totalMarks) * 100 : 0
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height}%` }}></div>
                    <span className="text-xs text-gray-500">{idx + 1}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
