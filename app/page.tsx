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
  showGuidance: boolean
}

export default function HomePage() {
  const [goalTitle, setGoalTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [guidanceMap, setGuidanceMap] = useState<Record<string, GoalGuidance>>({})
  const [audioStates, setAudioStates] = useState<Record<string, { isPlaying: boolean; isLoading: boolean }>>({})
  const [verseIndexMap, setVerseIndexMap] = useState<Record<string, number>>({})
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})

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
      
      // Initialize guidance state for new goal
      setGuidanceMap(prev => ({
        ...prev,
        [newGoal.id]: {
          goalId: newGoal.id,
          guidance: [],
          loading: false,
          showGuidance: false
        }
      }))
    } catch (err) {
      console.error('Failed to save goal', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId))
    setGuidanceMap(prev => {
      const newMap = { ...prev }
      delete newMap[goalId]
      return newMap
    })
  }

  const handleToggleComplete = (goalId: string) => {
    setGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, completed: !g.completed } : g
    ))
  }

  const loadGuidance = useCallback(async (goalId: string, goalTitle: string) => {
    setGuidanceMap(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        loading: true,
        showGuidance: true
      }
    }))

    try {
      const matches = await quranEngine.findVersesForGoal(goalTitle)
      setGuidanceMap(prev => ({
        ...prev,
        [goalId]: {
          ...prev[goalId],
          guidance: matches,
          loading: false
        }
      }))
    } catch (err) {
      console.error('Failed to load guidance:', err)
      setGuidanceMap(prev => ({
        ...prev,
        [goalId]: {
          ...prev[goalId],
          guidance: [],
          loading: false
        }
      }))
    }
  }, [])

  const toggleGuidance = (goalId: string, goalTitle: string) => {
    const current = guidanceMap[goalId]
    
    if (!current || !current.showGuidance) {
      // Load guidance if not loaded yet
      if (!current?.guidance?.length) {
        loadGuidance(goalId, goalTitle)
      } else {
        setGuidanceMap(prev => ({
          ...prev,
          [goalId]: { ...prev[goalId], showGuidance: true }
        }))
      }
    } else {
      setGuidanceMap(prev => ({
        ...prev,
        [goalId]: { ...prev[goalId], showGuidance: false }
      }))
    }
  }

  const handleAudioToggle = async (audioKey: string, audioUrl: string) => {
    const audioRef = audioRefs.current[audioKey]
    
    if (!audioRef) {
      // Create audio element if it doesn't exist
      const audio = new Audio(audioUrl)
      audioRefs.current[audioKey] = audio
      
      audio.onended = () => {
        setAudioStates(prev => ({ ...prev, [audioKey]: { isPlaying: false, isLoading: false } }))
      }
      
      audio.onerror = () => {
        setAudioStates(prev => ({ ...prev, [audioKey]: { isPlaying: false, isLoading: false } }))
      }
      
      setAudioStates(prev => ({ ...prev, [audioKey]: { isPlaying: false, isLoading: true } }))
      
      try {
        await audio.play()
        setAudioStates(prev => ({ ...prev, [audioKey]: { isPlaying: true, isLoading: false } }))
      } catch {
        setAudioStates(prev => ({ ...prev, [audioKey]: { isPlaying: false, isLoading: false } }))
      }
      return
    }

    const currentState = audioStates[audioKey]
    if (currentState?.isPlaying) {
      audioRef.pause()
      setAudioStates(prev => ({ ...prev, [audioKey]: { isPlaying: false, isLoading: false } }))
    } else {
      setAudioStates(prev => ({ ...prev, [audioKey]: { isPlaying: false, isLoading: true } }))
      audioRef.currentTime = 0
      try {
        await audioRef.play()
        setAudioStates(prev => ({ ...prev, [audioKey]: { isPlaying: true, isLoading: false } }))
      } catch {
        setAudioStates(prev => ({ ...prev, [audioKey]: { isPlaying: false, isLoading: false } }))
      }
    }
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Goal Input Section */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-white mb-4 text-center">
            What do you want to grow towards?
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="goal"
                type="text"
                autoComplete="off"
                placeholder="e.g. Read Quran daily, Exercise regularly..."
                value={goalTitle}
                onChange={e => setGoalTitle(e.target.value)}
                className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm md:text-base text-white placeholder-white/50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-emerald-500 px-6 py-3 text-sm md:text-base font-medium text-white hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving…' : 'Add Goal'}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </form>
        </div>

        {/* Goals Grid */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {goals.map((goal) => {
                const guidance = guidanceMap[goal.id]
                const isShowingGuidance = guidance?.showGuidance
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
                  >
                    {/* Goal Card */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Completion checkbox - larger touch target for mobile */}
                        <button
                          onClick={() => handleToggleComplete(goal.id)}
                          className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all touch-manipulation ${
                            goal.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-white/40 hover:border-emerald-400 active:border-emerald-400'
                          }`}
                          style={{ minWidth: '28px', minHeight: '28px' }}
                        >
                          {goal.completed && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>

                        {/* Goal title */}
                        <div className="flex-1 min-w-0 py-0.5">
                          <p className={`text-base font-medium break-words leading-snug ${
                            goal.completed ? 'text-white/40 line-through' : 'text-white'
                          }`}>
                            {goal.title}
                          </p>
                        </div>

                        {/* Delete button - larger touch target */}
                        <button
                          onClick={() => handleRemoveGoal(goal.id)}
                          className="flex-shrink-0 p-2 -m-1 text-white/40 hover:text-red-400 active:text-red-400 transition-colors touch-manipulation"
                          title="Remove goal"
                          style={{ minWidth: '36px', minHeight: '36px' }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Show Surah Button - proper touch target */}
                      <button
                        onClick={() => toggleGuidance(goal.id, goal.title)}
                        className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all touch-manipulation ${
                          isShowingGuidance
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                            : 'bg-white/10 text-white/70 hover:bg-emerald-500/20 active:bg-emerald-500/20 hover:text-emerald-300 border border-white/10'
                        }`}
                        style={{ minHeight: '44px' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {isShowingGuidance ? 'Hide Surah' : 'Related Surah'}
                      </button>
                    </div>

                    {/* Surah Guidance Panel */}
                    <AnimatePresence>
                      {isShowingGuidance && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/10 bg-white/5 overflow-hidden"
                        >
                          <div className="p-4">
                            {guidance?.loading ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="animate-spin w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full"></div>
                                <span className="ml-2 text-sm text-white/60">Finding guidance...</span>
                              </div>
                            ) : guidance?.guidance?.length > 0 ? (
                              (() => {
                                const currentIndex = verseIndexMap[goal.id] || 0
                                const totalVerses = guidance.guidance.length
                                const match = guidance.guidance[currentIndex]
                                const audioKey = `${goal.id}-${currentIndex}`
                                const audioState = audioStates[audioKey]
                                
                                return (
                                  <div className="space-y-4">
                                    {/* Surah reference with navigation arrows */}
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                      <div className="flex items-center gap-1">
                                        {/* Left arrow - larger touch target */}
                                        {totalVerses > 1 && (
                                          <button
                                            onClick={() => setVerseIndexMap(prev => ({
                                              ...prev,
                                              [goal.id]: currentIndex === 0 ? totalVerses - 1 : currentIndex - 1
                                            }))}
                                            className="p-2 rounded-full bg-white/10 text-white/60 hover:bg-emerald-500/30 active:bg-emerald-500/30 hover:text-emerald-300 transition-colors touch-manipulation"
                                            aria-label="Previous verse"
                                            style={{ minWidth: '36px', minHeight: '36px' }}
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                          </button>
                                        )}
                                        
                                        <a
                                          href={`https://quran.com/${match.verse.surah_number}/${match.verse.ayah}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs font-medium text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-full hover:bg-emerald-500/30 active:bg-emerald-500/30 transition-colors border border-emerald-500/30 touch-manipulation"
                                        >
                                          {match.verse.surah} ({match.verse.surah_number}:{match.verse.ayah})
                                        </a>
                                        
                                        {/* Right arrow - larger touch target */}
                                        {totalVerses > 1 && (
                                          <button
                                            onClick={() => setVerseIndexMap(prev => ({
                                              ...prev,
                                              [goal.id]: currentIndex === totalVerses - 1 ? 0 : currentIndex + 1
                                            }))}
                                            className="p-2 rounded-full bg-white/10 text-white/60 hover:bg-emerald-500/30 active:bg-emerald-500/30 hover:text-emerald-300 transition-colors touch-manipulation"
                                            aria-label="Next verse"
                                            style={{ minWidth: '36px', minHeight: '36px' }}
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                          </button>
                                        )}
                                        
                                        {/* Verse counter */}
                                        {totalVerses > 1 && (
                                          <span className="text-xs text-white/40 ml-1">
                                            {currentIndex + 1}/{totalVerses}
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center">
                                        {/* Audio button - proper touch target */}
                                        {match.verse.audio && (
                                          <button
                                            onClick={() => handleAudioToggle(audioKey, match.verse.audio!)}
                                            disabled={audioState?.isLoading}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all touch-manipulation ${
                                              audioState?.isPlaying
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white/10 text-white/70 hover:bg-emerald-500/30 active:bg-emerald-500/30 hover:text-emerald-300 border border-white/20'
                                            } ${audioState?.isLoading ? 'opacity-50' : ''}`}
                                            style={{ minHeight: '40px' }}
                                          >
                                            {audioState?.isLoading ? (
                                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                              </svg>
                                            ) : audioState?.isPlaying ? (
                                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                                              </svg>
                                            ) : (
                                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z"/>
                                              </svg>
                                            )}
                                            {audioState?.isPlaying ? 'Pause' : 'Listen'}
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Arabic text */}
                                    <p 
                                      className="text-2xl md:text-3xl leading-relaxed md:leading-loose text-white font-arabic text-center py-2"
                                      dir="rtl"
                                    >
                                      {match.verse.text_ar}
                                    </p>

                                    {/* English translation */}
                                    <p className="text-base md:text-lg text-white/80 italic leading-relaxed text-center">
                                      "{match.verse.text_en}"
                                    </p>

                                    {/* Phonetic/Transliteration */}
                                    {match.verse.text_transliteration && (
                                      <>
                                        <div className="flex items-center justify-center gap-3 py-1">
                                          <div className="h-px w-10 bg-white/20"></div>
                                          <span className="text-[10px] text-white/40 uppercase tracking-wider">Phonetic</span>
                                          <div className="h-px w-10 bg-white/20"></div>
                                        </div>
                                        <p className="text-sm md:text-base text-white/60 leading-relaxed text-center">
                                          {match.verse.text_transliteration}
                                        </p>
                                      </>
                                    )}

                                    {/* Reflection */}
                                    {match.verse.reflection && (
                                      <p className="text-sm text-emerald-300/70 pt-4 mt-2 border-t border-white/10">
                                        <span className="font-medium text-emerald-300">How this applies: </span>
                                        {match.verse.reflection}
                                      </p>
                                    )}
                                  </div>
                                )
                              })()
                            ) : (
                              <p className="text-sm text-white/50 text-center py-2">
                                No guidance found for this goal.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {goals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No goals yet</h3>
            <p className="text-sm text-white/60">Add your first goal above to get started with Quranic guidance.</p>
          </div>
        )}
      </div>
    </div>
  )
}
