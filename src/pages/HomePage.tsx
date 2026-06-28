import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTestStore } from '../stores/testStore'
import { generateTest, getAllSubjects, getAllTopics } from '../data'
import type { Question, TestMode } from '../types'
import { cn } from '../utils'

interface Props {
  questions: Question[]
}

const TEST_MODES: { mode: TestMode; title: string; desc: string; icon: string; color: string }[] = [
  { mode: 'full-mock', title: 'Full Mock Test', desc: '100 Questions • 120 Minutes', icon: '📝', color: 'from-blue-500 to-blue-700' },
  { mode: 'section-a', title: 'Section A Mock', desc: '50 Questions • 55 Minutes', icon: '📖', color: 'from-green-500 to-green-700' },
  { mode: 'section-b', title: 'Section B Mock', desc: '50 Questions • 65 Minutes', icon: '💻', color: 'from-purple-500 to-purple-700' },
  { mode: 'topic-practice', title: 'Topic Practice', desc: 'Practice by topic', icon: '🎯', color: 'from-orange-500 to-orange-700' },
  { mode: 'previous-mistakes', title: 'Previous Mistakes', desc: 'Review wrong answers', icon: '🔄', color: 'from-red-500 to-red-700' },
  { mode: 'daily-challenge', title: 'Daily Challenge', desc: '20 Questions • 20 Minutes', icon: '⚡', color: 'from-yellow-500 to-yellow-700' },
  { mode: 'rapid-revision', title: 'Rapid Revision', desc: 'Quick revision mode', icon: '🚀', color: 'from-pink-500 to-pink-700' },
]

export default function HomePage({ questions }: Props) {
  const navigate = useNavigate()
  const { startTest, session, resetTest } = useTestStore()
  const [selectedTopic, setSelectedTopic] = useState('')
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [pendingMode, setPendingMode] = useState<TestMode | null>(null)

  const subjects = getAllSubjects(questions)
  const topics = getAllTopics(questions)

  const handleStartTest = (mode: TestMode) => {
    if (mode === 'topic-practice') {
      setPendingMode(mode)
      setShowTopicModal(true)
      return
    }

    if (session && !session.isCompleted) {
      if (window.confirm('You have an in-progress test. Start a new one?')) {
        resetTest()
      } else {
        navigate('/test')
        return
      }
    }

    const { questions: testQuestions, duration } = generateTest(mode, questions)
    startTest(mode, testQuestions, duration)
    navigate('/test')
  }

  const handleTopicSelect = () => {
    if (!pendingMode || !selectedTopic) return
    const { questions: testQuestions, duration } = generateTest(pendingMode, questions, { topic: selectedTopic, count: 20 })
    startTest(pendingMode, testQuestions, duration)
    setShowTopicModal(false)
    navigate('/test')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CDAC C-CAT</h1>
              <p className="text-xs text-gray-500">Mock Test Platform</p>
            </div>
          </div>
          <nav className="flex gap-2">
            <button onClick={() => navigate('/')} className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              Home
            </button>
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">
              Dashboard
            </button>
            <button onClick={() => navigate('/revision')} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">
              Revision
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Master CDAC C-CAT in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">10 Days</span>
        </h2>
        <p className="text-lg text-gray-600 mb-2">7000+ Questions • 11 Subjects • 7 Test Modes</p>
        <p className="text-sm text-gray-500">Section A: English, Quant, Reasoning, Computers | Section B: C, DSA, C++, OS, Networking, DBMS, Big Data & AI</p>
      </section>

      {/* Test Modes Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TEST_MODES.map(({ mode, title, desc, icon, color }) => (
            <button
              key={mode}
              onClick={() => handleStartTest(mode)}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300",
                "bg-white border border-gray-200 hover:border-transparent hover:shadow-xl hover:-translate-y-1"
              )}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity", color)} />
              <div className="relative">
                <span className="text-3xl mb-3 block">{icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{questions.length.toLocaleString()}+</p>
            <p className="text-sm text-gray-500">Total Questions</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{subjects.length}</p>
            <p className="text-sm text-gray-500">Subjects</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{topics.length}</p>
            <p className="text-sm text-gray-500">Topics</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">7</p>
            <p className="text-sm text-gray-500">Test Modes</p>
          </div>
        </div>
      </section>

      {/* Topic Selection Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">Select Topic</h3>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a topic...</option>
              {topics.slice(0, 50).map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowTopicModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleTopicSelect} disabled={!selectedTopic} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
