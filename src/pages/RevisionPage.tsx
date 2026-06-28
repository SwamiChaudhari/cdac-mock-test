import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGamificationStore } from '../stores/gamificationStore'
import { useQuestionTracker } from '../stores/questionTracker'
import type { Question } from '../types'

interface Props {
  questions: Question[]
}

export default function RevisionPage({ questions }: Props) {
  const navigate = useNavigate()
  const { bookmarkedQuestions, toggleBookmark, mistakeHistory } = useGamificationStore()
  const { attemptedQuestionIds, lastResult } = useQuestionTracker()
  const [activeTab, setActiveTab] = useState<'mistakes' | 'bookmarked' | 'attempted' | 'formulas'>('mistakes')
  const [expandedQ, setExpandedQ] = useState<string | null>(null)

  const mistakeQuestions = questions.filter((q) => mistakeHistory[q.id])
  const bookmarkedQuestionsList = questions.filter((q) => bookmarkedQuestions.includes(q.id))
  const attemptedQuestions = questions.filter((q) => attemptedQuestionIds.includes(q.id))
  const correctCount = attemptedQuestions.filter(q => lastResult[q.id] === true).length
  const wrongCount = attemptedQuestions.filter(q => lastResult[q.id] === false).length

  const formulas = [
    { subject: 'Percentages', formula: 'Percentage = (Part/Whole) × 100' },
    { subject: 'Profit & Loss', formula: 'Profit% = (Profit/CP) × 100' },
    { subject: 'Average', formula: 'Average = Sum/n' },
    { subject: 'Time & Work', formula: 'Together = 1/(1/A + 1/B)' },
    { subject: 'Speed', formula: 'Speed = Distance/Time' },
    { subject: 'SI', formula: 'SI = PRT/100' },
    { subject: 'CI', formula: 'A = P(1+R/100)^T' },
    { subject: 'Probability', formula: 'P(E) = Favorable/Total' },
    { subject: 'HCF × LCM', formula: 'HCF × LCM = Product of numbers' },
    { subject: 'Clock Angle', formula: 'Angle = |30H - 11M/2|' },
    { subject: 'Binary Search', formula: 'O(log n) - Divide array in half' },
    { subject: 'Stack', formula: 'LIFO - Last In First Out' },
    { subject: 'Queue', formula: 'FIFO - First In First Out' },
    { subject: 'OSI Layers', formula: 'All People Seem To Need Data Processing' },
    { subject: 'TCP', formula: 'Connection-oriented, reliable' },
    { subject: 'UDP', formula: 'Connectionless, fast' },
    { subject: 'Big Data 5Vs', formula: 'Volume, Velocity, Variety, Veracity, Value' },
    { subject: 'CAP Theorem', formula: 'Pick 2 of Consistency, Availability, Partition tolerance' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Revision Center</h1>
            <p className="text-xs sm:text-sm text-gray-500">Review mistakes, bookmarks, and formulas</p>
          </div>
          <button onClick={() => navigate('/')} className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Home
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
          {(['mistakes', 'bookmarked', 'attempted', 'formulas'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition whitespace-nowrap ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'mistakes' ? `Mistakes (${mistakeQuestions.length})` :
               tab === 'bookmarked' ? `Bookmarked (${bookmarkedQuestionsList.length})` :
               tab === 'attempted' ? `Attempted (${attemptedQuestions.length})` :
               'Formulas'}
            </button>
          ))}
        </div>

        {/* Attempted Stats */}
        {activeTab === 'attempted' && attemptedQuestions.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-xl border p-3 text-center">
              <p className="text-lg sm:text-xl font-bold text-blue-600">{attemptedQuestions.length}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Attempted</p>
            </div>
            <div className="bg-white rounded-xl border p-3 text-center">
              <p className="text-lg sm:text-xl font-bold text-green-600">{correctCount}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Correct</p>
            </div>
            <div className="bg-white rounded-xl border p-3 text-center">
              <p className="text-lg sm:text-xl font-bold text-red-600">{wrongCount}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Wrong</p>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'formulas' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Quick Formula Sheet</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {formulas.map((f, idx) => (
                <div key={idx} className="p-2.5 sm:p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-[10px] sm:text-xs text-blue-600 font-medium">{f.subject}</p>
                  <p className="text-xs sm:text-sm text-gray-900 font-mono break-words">{f.formula}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mistakes' && (
          <div className="space-y-2 sm:space-y-3">
            {mistakeQuestions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
                <p className="text-gray-400 text-sm">No mistakes recorded yet. Take some tests!</p>
              </div>
            ) : (
              mistakeQuestions.slice(0, 30).map((q) => (
                <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] sm:text-xs">{q.subject}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] sm:text-xs">{q.topic}</span>
                        <span className="text-[10px] sm:text-xs text-red-500">×{mistakeHistory[q.id]}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-800 break-words">{q.question}</p>
                    </div>
                  </div>
                  {expandedQ === q.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs sm:text-sm text-green-700 font-medium">Correct: {q.options[q.correctAnswer]}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{q.explanation}</p>
                    </div>
                  )}
                  <button onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)} className="text-[10px] sm:text-xs text-blue-600 mt-2 hover:underline">
                    {expandedQ === q.id ? 'Hide' : 'Show'} answer
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'bookmarked' && (
          <div className="space-y-2 sm:space-y-3">
            {bookmarkedQuestionsList.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
                <p className="text-gray-400 text-sm">No bookmarked questions yet.</p>
              </div>
            ) : (
              bookmarkedQuestionsList.map((q) => (
                <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] sm:text-xs">{q.subject}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] sm:text-xs">{q.topic}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-800 break-words">{q.question}</p>
                    </div>
                    <button onClick={() => toggleBookmark(q.id)} className="text-yellow-500 hover:text-yellow-600 text-lg ml-2">
                      ★
                    </button>
                  </div>
                  {expandedQ === q.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs sm:text-sm text-green-700 font-medium">Correct: {q.options[q.correctAnswer]}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{q.explanation}</p>
                    </div>
                  )}
                  <button onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)} className="text-[10px] sm:text-xs text-blue-600 mt-2 hover:underline">
                    {expandedQ === q.id ? 'Hide' : 'Show'} answer
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'attempted' && (
          <div className="space-y-2 sm:space-y-3">
            {attemptedQuestions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
                <p className="text-gray-400 text-sm">No attempted questions yet. Take a test!</p>
              </div>
            ) : (
              attemptedQuestions.slice(0, 50).map((q) => {
                const wasCorrect = lastResult[q.id]
                return (
                  <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs ${wasCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {wasCorrect ? '✓ Correct' : '✗ Wrong'}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] sm:text-xs">{q.subject}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] sm:text-xs">{q.topic}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-800 break-words">{q.question}</p>
                      </div>
                    </div>
                    {expandedQ === q.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs sm:text-sm text-green-700 font-medium">Correct: {q.options[q.correctAnswer]}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{q.explanation}</p>
                      </div>
                    )}
                    <button onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)} className="text-[10px] sm:text-xs text-blue-600 mt-2 hover:underline">
                      {expandedQ === q.id ? 'Hide' : 'Show'} answer
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
