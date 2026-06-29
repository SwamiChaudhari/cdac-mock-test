import { useNavigate } from 'react-router-dom'
import { useTestStore } from '../stores/testStore'
import { useGamificationStore } from '../stores/gamificationStore'
import { calculateResults, formatTime } from '../utils'
import LearningMetadataPanel from '../components/LearningMetadataPanel'

export default function ResultPage() {
  const navigate = useNavigate()
  const { session, resetTest } = useTestStore()
  const { results } = useGamificationStore()

  if (!session) {
    navigate('/')
    return null
  }

  const latestResult = results.find((r) => r.sessionId === session.id)
  const resultsData = calculateResults(session.questions, session.answers)
  const timeSpent = session.submittedAt ? Math.floor((session.submittedAt - session.startTime) / 1000) : 0

  const scorePercent = resultsData.totalMarks > 0 ? Math.round((resultsData.score / resultsData.totalMarks) * 100) : 0

  const getGrade = () => {
    if (scorePercent >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' }
    if (scorePercent >= 75) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' }
    if (scorePercent >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (scorePercent >= 45) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const gradeInfo = getGrade()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Score Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Completed!</h1>
          <p className="text-gray-500 mb-6">
            {session.mode === 'full-mock' ? 'Full Mock Test' :
             session.mode === 'section-a' ? 'Section A' :
             session.mode === 'section-b' ? 'Section B' : session.mode}
          </p>

          <div className="flex items-center justify-center gap-8 mb-6">
            <div className={`w-24 h-24 rounded-full ${gradeInfo.bg} flex items-center justify-center`}>
              <span className={`text-3xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
            </div>
            <div className="text-left">
              <p className="text-4xl font-bold text-gray-900">{resultsData.score}/{resultsData.totalMarks}</p>
              <p className="text-gray-500">{scorePercent}% Score</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{resultsData.correct}</p>
              <p className="text-xs text-gray-500">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{resultsData.wrong}</p>
              <p className="text-xs text-gray-500">Wrong</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{resultsData.skipped}</p>
              <p className="text-xs text-gray-500">Skipped</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{Math.round(resultsData.accuracy)}%</p>
              <p className="text-xs text-gray-500">Accuracy</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4">Time Spent: {formatTime(timeSpent)}</p>
        </div>

        {/* Subject Analysis */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Analysis</h2>
          <div className="space-y-3">
            {Object.values(resultsData.subjectAnalysis).map((sa) => (
              <div key={sa.subject} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-gray-700 truncate">{sa.subject}</div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sa.accuracy >= 75 ? 'bg-green-500' : sa.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${sa.accuracy}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-right text-sm text-gray-600">
                  {sa.correct}/{sa.total}
                </div>
                <div className="w-12 text-right text-sm font-medium">
                  {Math.round(sa.accuracy)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak & Strong Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {resultsData.weakTopics.length > 0 && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
              <h3 className="text-sm font-semibold text-red-700 mb-3">Weak Topics (Accuracy &lt; 50%)</h3>
              <div className="flex flex-wrap gap-2">
                {resultsData.weakTopics.map((topic) => (
                  <span key={topic} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">{topic}</span>
                ))}
              </div>
            </div>
          )}
          {resultsData.strongTopics.length > 0 && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
              <h3 className="text-sm font-semibold text-green-700 mb-3">Strong Topics (Accuracy &ge; 75%)</h3>
              <div className="flex flex-wrap gap-2">
                {resultsData.strongTopics.map((topic) => (
                  <span key={topic} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{topic}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => { resetTest(); navigate('/'); }} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Back to Home
          </button>
          <button onClick={() => navigate('/revision')} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            Review Answers
          </button>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            Dashboard
          </button>
          <button onClick={() => navigate('/history')} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            Test History
          </button>
          <button onClick={() => navigate('/learning')} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
            Learn from Mistakes
          </button>
          <button onClick={() => navigate('/analytics')} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            Analytics
          </button>
        </div>
      </div>
    </div>
  )
}
