import { useState } from 'react'
import type { Question } from '../types'

interface LearningMetadataPanelProps {
  question: Question
  showFullExplanation: boolean
}

export default function LearningMetadataPanel({ question, showFullExplanation }: LearningMetadataPanelProps) {
  const [activeTab, setActiveTab] = useState<'formula' | 'hint' | 'shortcut' | 'memory'>('formula')
  const [showHint, setShowHint] = useState(false)

  const hasMetadata = question.formula || question.concept || question.hint || question.shortcut || question.memoryTrick

  if (!hasMetadata && !showFullExplanation) return null

  const tabs = [
    { id: 'formula' as const, label: 'Formula', icon: '📐', show: !!question.formula },
    { id: 'hint' as const, label: 'Hint', icon: '💡', show: !!question.hint },
    { id: 'shortcut' as const, label: 'Shortcut', icon: '⚡', show: !!question.shortcut },
    { id: 'memory' as const, label: 'Memory', icon: '🧠', show: !!question.memoryTrick },
  ].filter(t => t.show)

  if (tabs.length === 0 && !showFullExplanation) return null

  return (
    <div className="mt-4 space-y-3">
      {/* Exam Importance Badge */}
      {question.examImportance && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
            question.examImportance.score >= 8 ? 'bg-red-100 text-red-700' :
            question.examImportance.score >= 5 ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            Exam Score: {question.examImportance.score}/10
          </span>
          {question.examImportance.frequency && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600">
              {question.examImportance.frequency} frequency
            </span>
          )}
          {question.examImportance.probability && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-600">
              {question.examImportance.probability}
            </span>
          )}
        </div>
      )}

      {/* Concept Box */}
      {question.concept && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">💡 Concept</p>
          <p className="text-xs text-blue-900 leading-relaxed">{question.concept}</p>
        </div>
      )}

      {/* Tabs for Formula, Hint, Shortcut, Memory */}
      {tabs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id === 'hint') setShowHint(true) }}
                className={`flex-1 px-2 py-2 text-[10px] sm:text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-3">
            {activeTab === 'formula' && question.formula && (
              <div>
                <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide mb-1">📐 Formula</p>
                <p className="text-sm font-mono bg-purple-50 px-3 py-2 rounded text-purple-900">{question.formula}</p>
              </div>
            )}
            {activeTab === 'hint' && question.hint && (
              <div>
                {!showHint ? (
                  <button
                    onClick={() => setShowHint(true)}
                    className="w-full py-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 font-medium hover:bg-yellow-100"
                  >
                    👆 Tap to reveal hint
                  </button>
                ) : (
                  <div>
                    <p className="text-[10px] font-semibold text-yellow-600 uppercase tracking-wide mb-1">💡 Hint</p>
                    <p className="text-sm text-yellow-900">{question.hint}</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'shortcut' && question.shortcut && (
              <div>
                <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-1">⚡ Shortcut</p>
                <p className="text-sm text-green-900">{question.shortcut}</p>
              </div>
            )}
            {activeTab === 'memory' && question.memoryTrick && (
              <div>
                <p className="text-[10px] font-semibold text-pink-600 uppercase tracking-wide mb-1">🧠 Memory Trick</p>
                <p className="text-sm text-pink-900">{question.memoryTrick}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Common Mistake Warning */}
      {question.commonMistake && showFullExplanation && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide mb-1">❌ Common Mistake</p>
          <p className="text-xs text-red-900">{question.commonMistake}</p>
        </div>
      )}

      {/* Full Explanation (shown after answer) */}
      {showFullExplanation && question.explanation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-1">✅ Explanation</p>
          <p className="text-xs text-green-900 leading-relaxed whitespace-pre-wrap">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
