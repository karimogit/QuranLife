'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { storage, sanitizeInput } from '@/lib/security'
import { quranEngine, GoalMatchResult } from '@/lib/quran-engine'

interface Goal {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

interface GoalGuidance {
  goalId: string
  guidance: GoalMatchResult[]
  loading: boolean
}

export default function HomePage() {
  const [goalTitle, setGoalTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0)
  const [guidanceMap, setGuidanceMap] = useState<Record<string, GoalGuidance>>({})
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAudioLoading, setIsAudioLoading] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentGoal = goals[currentGoalIndex]
  const currentGuidance = currentGoal ? guidanceMap[currentGoal.id] : null
  const currentVerse = currentGuidance?.guidance?.[currentVerseIndex]

  const loadGuidance = useCallback(async (goalId: string, goalTitle: string) => {
    setGuidanceMap(prev => ({
      ...prev,
      [goalId]: {
        goalId,
        guidance: [],
        loading: true
      }
    }))

    try {
      const matches = await quranEngine.findVersesForGoal(goalTitle)
      setGuidanceMap(prev => ({
        ...prev,
        [goalId]: {
          goalId,
          guidance: matches,
          loading: false
        }
      }))
    } catch (err) {
      console.error('Failed to load guidance:', err)
      setGuidanceMap(prev => ({
        ...prev,
        [goalId]: {
          goalId,
          guidance: [],
          loading: false
        }
      }))
    }
  }, [])

  // Load goals from storage on mount
  useEffect(() => {
    const savedGoals = storage.get<Goal[]>('quranlife-goals', [])
    setGoals(savedGoals)
  }, [])

  // Save goals to storage when changed
  useEffect(() => {
    if (goals.length > 0) {
      storage.set('quranlife-goals', goals)
    }
  }, [goals])

  // Load guidance for current goal
  useEffect(() => {
    if (currentGoal && !guidanceMap[currentGoal.id]) {
      loadGuidance(currentGoal.id, currentGoal.title)
    }
  }, [currentGoal, guidanceMap, loadGuidance])

  // Reset verse index when changing goals
  useEffect(() => {
    setCurrentVerseIndex(0)
    // Stop audio when switching goals
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [currentGoalIndex])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanedTitle = sanitizeInput(goalTitle)

    if (!cleanedTitle) {
      setError('Please enter a goal to get started.')
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: cleanedTitle,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      setGoals(prev => [newGoal, ...prev])
      setGoalTitle('')
      setShowInput(false)
      setCurrentGoalIndex(0) // Navigate to the new goal
    } catch (err) {
      console.error('Failed to save goal', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveGoal = () => {
    if (!currentGoal) return
    
    setGoals(prev => prev.filter(g => g.id !== currentGoal.id))
    setGuidanceMap(prev => {
      const newMap = { ...prev }
      delete newMap[currentGoal.id]
      return newMap
    })
    
    // Adjust index if needed
    if (currentGoalIndex >= goals.length - 1 && currentGoalIndex > 0) {
      setCurrentGoalIndex(currentGoalIndex - 1)
    }
  }

  const handleToggleComplete = () => {
    if (!currentGoal) return
    setGoals(prev => prev.map(g => 
      g.id === currentGoal.id ? { ...g, completed: !g.completed } : g
    ))
  }

  const navigateGoal = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentGoalIndex(prev => prev === 0 ? goals.length - 1 : prev - 1)
    } else {
      setCurrentGoalIndex(prev => prev === goals.length - 1 ? 0 : prev + 1)
    }
  }, [goals.length])

  const navigateVerse = useCallback((direction: 'prev' | 'next') => {
    const totalVerses = currentGuidance?.guidance?.length || 0
    if (totalVerses <= 1) return
    
    if (direction === 'prev') {
      setCurrentVerseIndex(prev => prev === 0 ? totalVerses - 1 : prev - 1)
    } else {
      setCurrentVerseIndex(prev => prev === totalVerses - 1 ? 0 : prev + 1)
    }
  }, [currentGuidance?.guidance?.length])

  const handleAudioToggle = useCallback(async () => {
    if (!currentVerse?.verse.audio) return

    if (!audioRef.current || audioRef.current.src !== currentVerse.verse.audio) {
      // Create or update audio element
      if (audioRef.current) {
        audioRef.current.pause()
      }
      audioRef.current = new Audio(currentVerse.verse.audio)
      audioRef.current.onended = () => setIsPlaying(false)
      audioRef.current.onerror = () => {
        setIsPlaying(false)
        setIsAudioLoading(false)
      }
    }

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        setIsAudioLoading(true)
        audioRef.current.currentTime = 0
        await audioRef.current.play()
        setIsPlaying(true)
        setIsAudioLoading(false)
      }
    } catch {
      setIsPlaying(false)
      setIsAudioLoading(false)
    }
  }, [currentVerse?.verse.audio, isPlaying])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showInput) return // Don't navigate when input is open
      
      if (e.key === 'ArrowLeft') {
        if (e.shiftKey && goals.length > 1) {
          navigateGoal('prev')
        } else if (currentGuidance?.guidance && currentGuidance.guidance.length > 1) {
          navigateVerse('prev')
        }
      } else if (e.key === 'ArrowRight') {
        if (e.shiftKey && goals.length > 1) {
          navigateGoal('next')
        } else if (currentGuidance?.guidance && currentGuidance.guidance.length > 1) {
          navigateVerse('next')
        }
      } else if (e.key === ' ' && currentVerse?.verse.audio) {
        e.preventDefault()
        handleAudioToggle()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showInput, goals.length, currentGuidance?.guidance, navigateGoal, navigateVerse, currentVerse?.verse.audio, handleAudioToggle])

  // Empty state - no goals
  if (goals.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white mb-3">
              What do you want to grow towards?
            </h1>
            <p className="text-white/60 mb-8">
              Add a goal and discover Quranic guidance to inspire your journey.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
          >
            <input
              id="goal"
              type="text"
              autoComplete="off"
              autoFocus
              placeholder="e.g. Read Quran daily, Find inner peace..."
              value={goalTitle}
              onChange={e => setGoalTitle(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-lg text-white placeholder-white/50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 mb-4"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-xl bg-emerald-500 px-6 py-4 text-lg font-medium text-white hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Finding guidance…' : 'Get Quranic Guidance'}
            </button>
            {error && <p className="mt-3 text-sm text-red-400 text-center">{error}</p>}
          </motion.form>
        </div>
      </div>
    )
  }

  // Main full-screen view
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top bar with goal navigation */}
      <div className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
        {/* Goal navigation - left */}
        <div className="flex items-center gap-2">
          {goals.length > 1 && (
            <>
              <button
                onClick={() => navigateGoal('prev')}
                className="p-2 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors touch-manipulation"
                aria-label="Previous goal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-white/50 px-2">
                Goal {currentGoalIndex + 1} of {goals.length}
              </span>
              <button
                onClick={() => navigateGoal('next')}
                className="p-2 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors touch-manipulation"
                aria-label="Next goal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Actions - right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInput(true)}
            className="p-2 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors touch-manipulation"
            aria-label="Add new goal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleToggleComplete}
            className={`p-2 rounded-full transition-colors touch-manipulation ${
              currentGoal?.completed
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-emerald-500/30 hover:text-emerald-300'
            }`}
            aria-label={currentGoal?.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={handleRemoveGoal}
            className="p-2 rounded-full bg-white/10 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-colors touch-manipulation"
            aria-label="Remove goal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 md:px-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGoal?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl text-center"
          >
            {/* Goal title */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className={`text-xl md:text-2xl lg:text-3xl font-semibold leading-relaxed ${
                currentGoal?.completed ? 'text-white/40 line-through' : 'text-white'
              }`}>
                {currentGoal?.title}
              </h2>
            </motion.div>

            {/* Loading state */}
            {currentGuidance?.loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="animate-spin w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full mb-4"></div>
                <span className="text-white/60">Finding Quranic guidance...</span>
              </motion.div>
            )}

            {/* Verse display */}
            {!currentGuidance?.loading && currentVerse && (
              <>
                {/* Surah reference */}
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="mb-6 md:mb-8"
                >
                  <a
                    href={`https://quran.com/${currentVerse.verse.surah_number}/${currentVerse.verse.ayah}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm md:text-base font-medium border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                  >
                    {currentVerse.verse.surah} ({currentVerse.verse.surah_number}:{currentVerse.verse.ayah})
                  </a>
                </motion.div>

                {/* Arabic text - LARGE */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8 md:mb-10"
                >
                  <p
                    className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-relaxed md:leading-loose text-white font-arabic"
                    dir="rtl"
                  >
                    {currentVerse.verse.text_ar}
                  </p>
                </motion.div>

                {/* English translation */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="mb-6"
                >
                  <p className="text-lg md:text-2xl lg:text-3xl text-white/80 italic leading-relaxed">
                    "{currentVerse.verse.text_en}"
                  </p>
                </motion.div>

                {/* Phonetic/Transliteration */}
                {currentVerse.verse.text_transliteration && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                  >
                    <div className="mb-3 flex items-center justify-center gap-4">
                      <div className="h-px w-12 bg-white/20"></div>
                      <span className="text-xs text-white/40 uppercase tracking-wider">Phonetic</span>
                      <div className="h-px w-12 bg-white/20"></div>
                    </div>
                    <p className="text-base md:text-xl lg:text-2xl text-white/60 leading-relaxed">
                      {currentVerse.verse.text_transliteration}
                    </p>
                  </motion.div>
                )}

                {/* Reflection */}
                {currentVerse.verse.reflection && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="mb-8 max-w-2xl mx-auto"
                  >
                    <p className="text-sm md:text-base text-emerald-300/70 leading-relaxed">
                      <span className="font-medium text-emerald-300">How this applies: </span>
                      {currentVerse.verse.reflection}
                    </p>
                  </motion.div>
                )}

                {/* Audio and verse navigation */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center gap-4"
                >
                  {/* Audio button */}
                  {currentVerse.verse.audio && (
                    <button
                      onClick={handleAudioToggle}
                      disabled={isAudioLoading}
                      className={`flex items-center gap-3 px-8 py-4 rounded-full text-lg font-medium transition-all ${
                        isPlaying
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      } ${isAudioLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isAudioLoading ? (
                        <>
                          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          <span>Loading...</span>
                        </>
                      ) : isPlaying ? (
                        <>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                          </svg>
                          <span>Pause Recitation</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          <span>Listen to Recitation</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Verse navigation */}
                  {currentGuidance?.guidance && currentGuidance.guidance.length > 1 && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigateVerse('prev')}
                        className="p-3 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors touch-manipulation"
                        aria-label="Previous verse"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="text-sm text-white/50">
                        Verse {currentVerseIndex + 1} of {currentGuidance.guidance.length}
                      </span>
                      <button
                        onClick={() => navigateVerse('next')}
                        className="p-3 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors touch-manipulation"
                        aria-label="Next verse"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}

            {/* No guidance found */}
            {!currentGuidance?.loading && (!currentGuidance?.guidance || currentGuidance.guidance.length === 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center"
              >
                <p className="text-white/50">No Quranic guidance found for this goal.</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard hints - desktop only */}
      <div className="hidden md:flex justify-center pb-4 relative z-10">
        <p className="text-white/30 text-xs">
          <kbd className="px-2 py-1 bg-white/10 rounded mr-1">←</kbd>
          <kbd className="px-2 py-1 bg-white/10 rounded mr-2">→</kbd>
          verses
          <span className="mx-3">·</span>
          <kbd className="px-2 py-1 bg-white/10 rounded mr-1">Shift</kbd>+
          <kbd className="px-2 py-1 bg-white/10 rounded mx-1">←</kbd>
          <kbd className="px-2 py-1 bg-white/10 rounded mr-2">→</kbd>
          goals
          <span className="mx-3">·</span>
          <kbd className="px-2 py-1 bg-white/10 rounded mr-1">Space</kbd>
          play/pause
        </p>
      </div>

      {/* Add goal modal/overlay */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInput(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 rounded-2xl border border-white/20 p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Add New Goal</h3>
                <button
                  onClick={() => setShowInput(false)}
                  className="p-2 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <input
                  id="new-goal"
                  type="text"
                  autoComplete="off"
                  autoFocus
                  placeholder="What do you want to grow towards?"
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 mb-4"
                />
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Finding guidance…' : 'Add Goal'}
                </button>
                {error && <p className="mt-3 text-sm text-red-400 text-center">{error}</p>}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
