import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { loadAllQuestions } from './data'
import type { Question } from './types'
import { useTestStore } from './stores/testStore'
import { useGamificationStore } from './stores/gamificationStore'
import HomePage from './pages/HomePage'
import TestPage from './pages/TestPage'
import ResultPage from './pages/ResultPage'
import DashboardPage from './pages/DashboardPage'
import RevisionPage from './pages/RevisionPage'
import TestHistoryPage from './pages/TestHistoryPage'
import TestReviewPage from './pages/TestReviewPage'
import LearningModePage from './pages/LearningModePage'
import AnalyticsPage from './pages/AnalyticsPage'
import FlashcardReviewPage from './pages/FlashcardReviewPage'

function App() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const { setQuestionBank } = useTestStore()
  const { updateStreak } = useGamificationStore()

  useEffect(() => {
    // Update daily streak on app load
    updateStreak()
  }, [updateStreak])

  useEffect(() => {
    loadAllQuestions().then((qs) => {
      setQuestions(qs)
      setQuestionBank(qs)
      setLoading(false)
    })
  }, [setQuestionBank])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Loading Question Bank...</h2>
          <p className="text-gray-400 mt-2">2000+ questions loading</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage questions={questions} />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/revision" element={<RevisionPage questions={questions} />} />
        <Route path="/history" element={<TestHistoryPage />} />
        <Route path="/review/:testId" element={<TestReviewPage />} />
        <Route path="/learning" element={<LearningModePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/flashcards" element={<FlashcardReviewPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
