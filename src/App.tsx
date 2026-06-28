import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { loadAllQuestions } from './data'
import type { Question } from './types'
import { useTestStore } from './stores/testStore'
import HomePage from './pages/HomePage'
import TestPage from './pages/TestPage'
import ResultPage from './pages/ResultPage'
import DashboardPage from './pages/DashboardPage'
import RevisionPage from './pages/RevisionPage'

function App() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const { setQuestionBank } = useTestStore()

  useEffect(() => {
    loadAllQuestions().then((qs) => {
      setQuestions(qs)
      setQuestionBank(qs)
      setLoading(false)
    })
  }, [setQuestionBank])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Question Bank...</h2>
          <p className="text-gray-500 mt-2">7000+ questions loading</p>
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
