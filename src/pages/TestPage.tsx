import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTestStore } from '../stores/testStore'
import { useStatsStore } from '../stores/statsStore'
import { formatTime, getQuestionStatus, calculateResults } from '../utils'
import type { QuestionStatus, TestResult } from '../types'

export default function TestPage() {
  const navigate = useNavigate()
  const { session, setAnswer, toggleMarkForReview, setCurrentIndex, clearResponse, submitTest, resetTest } = useTestStore()
  const { addResult, addMistake } = useStatsStore()
  const [timeLeft, setTimeLeft] = useState(0)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  useEffect(() => {
    if (!session) {
      navigate('/')
      return
    }
    if (session.isCompleted) {
      navigate('/result')
      return
    }
    setTimeLeft(session.duration - Math.floor((Date.now() - session.startTime) / 1000))
  }, [session, navigate])

  useEffect(() => {
    if (!session || session.isCompleted) return
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000)
      const remaining = session.duration - elapsed
      if (remaining <= 0) {
        handleSubmit()
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [session])

  const handleSubmit = useCallback(() => {
    if (!session) return
    submitTest()

    const results = calculateResults(session.questions, session.answers)
    const result: TestResult = {
      id: session.id,
      sessionId: session.id,
      mode: session.mode,
      score: results.score,
      totalMarks: results.totalMarks,
      correct: results.correct,
      wrong: results.wrong,
      skipped: results.skipped,
      accuracy: results.accuracy,
      timeSpent: session.duration - timeLeft,
      subjectAnalysis: {},
      weakTopics: results.weakTopics,
      strongTopics: results.strongTopics,
      date: Date.now(),
    }

    // Build subject analysis
    results.subjectAnalysis.forEach((sa) => {
      result.subjectAnalysis[sa.subject] = {
        subject: sa.subject,
        total: sa.total,
        correct: sa.correct,
        wrong: sa.wrong,
        skipped: sa.skipped,
        accuracy: sa.accuracy,
        timeSpent: 0,
      }
    })

    // Track mistakes
    session.questions.forEach((q) => {
      const answer = session.answers[q.id]
      if (answer && answer.selectedAnswer !== null && answer.selectedAnswer !== q.correctAnswer) {
        addMistake(q.id)
      }
    })

    addResult(result)
    navigate('/result')
  }, [session, timeLeft, submitTest, addResult, addMistake, navigate])

  if (!session) return null

  const currentQuestion = session.questions[session.currentIndex]
  const currentAnswer = session.answers[currentQuestion?.id]
  const answeredCount = Object.values(session.answers).filter((a) => a?.selectedAnswer !== null).length
  const markedCount = Object.values(session.answers).filter((a) => a?.isMarkedForReview).length

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white'
      case 'marked-for-review': return 'bg-purple-500 text-white'
      case 'visited': return 'bg-red-500 text-white'
      default: return 'bg-gray-300 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {session.mode === 'full-mock' ? 'Full Mock Test' :
               session.mode === 'section-a' ? 'Section A' :
               session.mode === 'section-b' ? 'Section B' :
               session.mode === 'topic-practice' ? 'Topic Practice' :
               session.mode === 'daily-challenge' ? 'Daily Challenge' :
               session.mode === 'rapid-revision' ? 'Rapid Revision' : 'Previous Mistakes'}
            </h1>
            <span className="text-sm text-gray-500">
              Q{session.currentIndex + 1}/{session.questions.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">{answeredCount} Answered</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">{markedCount} Marked</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">{session.questions.length - answeredCount - markedCount} Pending</span>
            </div>
            <div className={`px-4 py-2 rounded-lg font-mono text-lg font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-700 animate-pulse-slow' : 'bg-blue-100 text-blue-700'}`}>
              {formatTime(timeLeft)}
            </div>
            <button onClick={() => setShowSubmitConfirm(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
              Submit
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div className="h-full bg-blue-500 transition-all" style={{ width: `${(answeredCount / session.questions.length) * 100}%` }}></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Question Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {currentQuestion && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              {/* Question */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{currentQuestion.difficulty}</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">{currentQuestion.subject}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{currentQuestion.topic}</span>
                </div>
                <h2 className="text-xl text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = currentAnswer?.selectedAnswer === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => setAnswer(currentQuestion.id, idx)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}>{option}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, session.currentIndex - 1))}
                  disabled={session.currentIndex === 0}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => toggleMarkForReview(currentQuestion.id)}
                  className={`px-6 py-3 rounded-lg border-2 transition ${
                    currentAnswer?.isMarkedForReview
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {currentAnswer?.isMarkedForReview ? 'Unmark' : 'Mark for Review'}
                </button>
                <button
                  onClick={() => clearResponse(currentQuestion.id)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Response
                </button>
                <button
                  onClick={() => setCurrentIndex(Math.min(session.questions.length - 1, session.currentIndex + 1))}
                  disabled={session.currentIndex === session.questions.length - 1}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                >
                  Save & Next
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Question Navigator - Right Sidebar */}
        <aside className="w-72 bg-white border-l border-gray-200 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Question Navigator</h3>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-green-500"></div> Answered</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-purple-500"></div> Marked</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-red-500"></div> Visited</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-gray-300"></div> Not Visited</div>
          </div>

          {/* Question Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {session.questions.map((q, idx) => {
              const status = getQuestionStatus(session.answers[q.id])
              const isCurrent = idx === session.currentIndex
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded-lg text-xs font-medium transition-all ${getStatusColor(status)} ${
                    isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-in text-center">
            <h3 className="text-lg font-semibold mb-2">Submit Test?</h3>
            <p className="text-gray-600 mb-4">
              You have answered {answeredCount} out of {session.questions.length} questions.
              {markedCount > 0 && ` ${markedCount} are marked for review.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
