import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGamificationStore } from '../stores/gamificationStore'

export default function FlashcardReviewPage() {
  const navigate = useNavigate()
  const { flashcards, reviewFlashcard } = useGamificationStore()

  const dueCards = flashcards.filter(f => f.nextReview <= Date.now())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-4xl mb-4">🃏</p>
          <p className="text-gray-400 text-lg">No flashcards yet</p>
          <p className="text-gray-500 text-sm mt-1">Flashcards are auto-generated from your incorrect answers</p>
          <button onClick={() => navigate('/learning')} className="mt-4 px-6 py-3 bg-purple-600 rounded-lg font-medium">
            Go to Learning Mode
          </button>
        </div>
      </div>
    )
  }

  if (dueCards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-4xl mb-4">✅</p>
          <p className="text-gray-300 text-lg">All caught up!</p>
          <p className="text-gray-500 text-sm mt-1">No flashcards due for review right now</p>
          <p className="text-gray-500 text-xs mt-1">Total flashcards: {flashcards.length}</p>
          <button onClick={() => navigate('/')} className="mt-4 px-6 py-3 bg-purple-600 rounded-lg font-medium">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const currentCard = dueCards[currentIndex]

  const handleReview = (correct: boolean) => {
    reviewFlashcard(currentCard.id, correct)
    setFlipped(false)
    setCurrentIndex(0) // Reset — dueCards list changed
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Flashcard Review</h1>
            <p className="text-xs text-gray-400">{dueCards.length} due · {flashcards.length} total</p>
          </div>
          <button onClick={() => navigate('/')} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20">
            Home
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Progress */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Card {currentIndex + 1} of {dueCards.length}</span>
          <span>Interval: {currentCard.interval}d · EF: {currentCard.easeFactor.toFixed(1)}</span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }}></div>
        </div>

        {/* Flashcard */}
        <div
          className="bg-white/8 rounded-2xl border border-white/15 p-8 min-h-[280px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition select-none"
          onClick={() => setFlipped(!flipped)}
        >
          <p className="text-[10px] text-purple-400 mb-3">{currentCard.topic}</p>

          {!flipped ? (
            <div className="text-center">
              <p className="text-base font-medium leading-relaxed max-w-md">{currentCard.front}</p>
              <p className="text-[10px] text-gray-500 mt-6">Tap to reveal answer</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-base text-green-300 leading-relaxed max-w-md">{currentCard.back}</p>
              <p className="text-[10px] text-gray-500 mt-6">Tap to see question</p>
            </div>
          )}
        </div>

        {/* Actions (only when flipped) */}
        {flipped && (
          <div className="flex gap-3 justify-center">
            <button onClick={() => handleReview(false)}
              className="px-6 py-3 bg-red-600/80 rounded-xl font-medium text-sm hover:bg-red-600 transition">
              ✗ Again
            </button>
            <button onClick={() => handleReview(true)}
              className="px-6 py-3 bg-green-600/80 rounded-xl font-medium text-sm hover:bg-green-600 transition">
              ✓ Got it (+5 XP)
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 mt-4">
          <h3 className="text-xs font-bold mb-2 text-gray-400">All Flashcards Stats</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-purple-400">{flashcards.length}</p>
              <p className="text-[10px] text-gray-500">Total</p>
            </div>
            <div>
              <p className="text-lg font-bold text-yellow-400">{dueCards.length}</p>
              <p className="text-[10px] text-gray-500">Due</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-400">{flashcards.reduce((s, f) => s + f.correctReviews, 0)}</p>
              <p className="text-[10px] text-gray-500">Mastered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
