import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHistoryStore, type SortBy, type SortOrder } from '../stores/historyStore'
import { useTestStore } from '../stores/testStore'
import { useQuestionTracker } from '../stores/questionTracker'
import { generateTest } from '../data'
import type { TestMode } from '../types'

export default function TestHistoryPage() {
  const navigate = useNavigate()
  const { testHistory, searchTests, sortTests, deleteTest } = useHistoryStore()
  const { startTest } = useTestStore()
  const { getExcludeIds } = useQuestionTracker()

  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState<TestMode | ''>('')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const modes: TestMode[] = ['full-mock', 'section-a', 'section-b', 'topic-practice', 'previous-mistakes', 'daily-challenge', 'rapid-revision']

  const subjects = useMemo(() => {
    const subs = new Set<string>()
    testHistory.forEach(t => Object.keys(t.result.subjectAnalysis).forEach(s => subs.add(s)))
    return [...subs]
  }, [testHistory])

  const filteredTests = useMemo(() => {
    let tests = search ? searchTests(search) : testHistory
    if (modeFilter) {
      tests = tests.filter(t => t.result.mode === modeFilter)
    }
    return sortTests(tests, sortBy, sortOrder)
  }, [testHistory, search, modeFilter, sortBy, sortOrder, searchTests, sortTests])

  const handleReattempt = (test: typeof testHistory[0]) => {
    // Generate a new test with same mode/settings
    const excludeIds = getExcludeIds()
    const mode = test.result.mode
    const questions = useTestStore.getState().questionBank
    const generated = generateTest(mode, questions, { excludeIds })
    startTest(mode, generated.questions, test.result.timeSpent)
    navigate('/test')
  }

  const handleDelete = (id: string) => {
    deleteTest(id)
    setDeleteConfirm(null)
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Test History</h1>
            <p className="text-xs text-gray-400">{testHistory.length} tests completed</p>
          </div>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">
            Home
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Filters */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
          <input
            type="text"
            placeholder="Search by name, subject, topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex flex-wrap gap-3">
            <select value={modeFilter} onChange={e => setModeFilter(e.target.value as TestMode | '')}
              className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
              <option value="">All Modes</option>
              {modes.map(m => <option key={m} value={m} className="bg-slate-800">{m}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
              <option value="date" className="bg-slate-800">Date</option>
              <option value="score" className="bg-slate-800">Score</option>
              <option value="accuracy" className="bg-slate-800">Accuracy</option>
              <option value="timeSpent" className="bg-slate-800">Time</option>
            </select>
            <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm hover:bg-white/20">
              {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
            </button>
          </div>
        </div>

        {/* Test Cards */}
        {filteredTests.length === 0 ? (
          <div className="bg-white/5 rounded-xl border border-white/10 p-12 text-center">
            <p className="text-gray-400 text-lg">No tests found</p>
            <p className="text-gray-500 text-sm mt-1">Take a test to see your history here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTests.map((test) => {
              const r = test.result
              const scorePercent = r.totalMarks > 0 ? Math.round((r.score / r.totalMarks) * 100) : 0
              const accColor = r.accuracy >= 75 ? 'text-green-400' : r.accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'
              const accBg = r.accuracy >= 75 ? 'bg-green-500/20 border-green-500/30' : r.accuracy >= 50 ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-red-500/20 border-red-500/30'

              return (
                <div key={test.id} className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/8 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm truncate">{r.testName}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${accBg} ${accColor}`}>
                          {Math.round(r.accuracy)}% acc
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {' · '}{formatTime(r.timeSpent)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{r.score}/{r.totalMarks}</p>
                      <p className={`text-xs ${scorePercent >= 60 ? 'text-green-400' : 'text-red-400'}`}>{scorePercent}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <span className="text-green-400">✓ {r.correct}</span>
                    <span className="text-red-400">✗ {r.wrong}</span>
                    <span className="text-gray-400">○ {r.skipped}</span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => navigate(`/review/${test.id}`)}
                      className="px-3 py-1.5 bg-purple-600 rounded-lg text-xs font-medium hover:bg-purple-700">
                      Review
                    </button>
                    <button onClick={() => handleReattempt(test)}
                      className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-medium hover:bg-white/20">
                      Reattempt
                    </button>
                    {deleteConfirm === test.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(test.id)}
                          className="px-3 py-1.5 bg-red-600 rounded-lg text-xs font-medium hover:bg-red-700">
                          Confirm
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-medium hover:bg-white/20">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(test.id)}
                        className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-medium hover:bg-red-600/50">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
