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

type TextDisplayMode = 'english' | 'phonetic';

export default function HomePage() {
  const [goalTitle, setGoalTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [guidanceMap, setGuidanceMap] = useState<Record<string, GoalGuidance>>({})
  const [audioStates, setAudioStates] = useState<Record<string, { isPlaying: boolean; isLoading: boolean }>>({})
  const [textDisplayMode, setTextDisplayMode] = useState<TextDisplayMode>('english')
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
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 text-center">
            What do you want to grow towards?
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="goal"
                type="text"
                autoComplete="off"
                placeholder="e.g. Read Quran daily, Exercise regularly..."
                value={goalTitle}
                onChange={e => setGoalTitle(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm md:text-base text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-emerald-600 px-6 py-3 text-sm md:text-base font-medium text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving…' : 'Add Goal'}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    {/* Goal Card */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Completion checkbox */}
                        <button
                          onClick={() => handleToggleComplete(goal.id)}
                          className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${
                            goal.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-gray-300 hover:border-emerald-400'
                          }`}
                        >
                          {goal.completed && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>

                        {/* Goal title */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm md:text-base font-medium break-words ${
                            goal.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                          }`}>
                            {goal.title}
                          </p>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => handleRemoveGoal(goal.id)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove goal"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Show Surah Button */}
                      <button
                        onClick={() => toggleGuidance(goal.id, goal.title)}
                        className={`mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isShowingGuidance
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="border-t border-gray-100 bg-gradient-to-b from-emerald-50/50 to-white overflow-hidden"
                        >
                          <div className="p-4">
                            {guidance?.loading ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                                <span className="ml-2 text-sm text-gray-500">Finding guidance...</span>
                              </div>
                            ) : guidance?.guidance?.length > 0 ? (
                              <div className="space-y-4">
                                {guidance.guidance.slice(0, 1).map((match, idx) => {
                                  const audioKey = `${goal.id}-${idx}`
                                  const audioState = audioStates[audioKey]
                                  
                                  return (
                                    <div key={idx} className="space-y-3">
                                      {/* Surah reference */}
                                      <div className="flex items-center justify-between">
                                        <a
                                          href={`https://quran.com/${match.verse.surah_number}/${match.verse.ayah}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full hover:bg-emerald-200 transition-colors"
                                        >
                                          {match.verse.surah} ({match.verse.surah_number}:{match.verse.ayah})
                                        </a>
                                        
                                        {/* Audio button */}
                                        {match.verse.audio && (
                                          <button
                                            onClick={() => handleAudioToggle(audioKey, match.verse.audio!)}
                                            disabled={audioState?.isLoading}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                              audioState?.isPlaying
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                            } ${audioState?.isLoading ? 'opacity-50' : ''}`}
                                          >
                                            {audioState?.isLoading ? (
                                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                              </svg>
                                            ) : audioState?.isPlaying ? (
                                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                                              </svg>
                                            ) : (
                                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z"/>
                                              </svg>
                                            )}
                                            {audioState?.isPlaying ? 'Pause' : 'Listen'}
                                          </button>
                                        )}
                                      </div>

                                      {/* Arabic text */}
                                      <p className="text-base leading-loose text-gray-800 font-arabic text-right" dir="rtl">
                                        {match.verse.text_ar}
                                      </p>

                                      {/* Toggle for English/Phonetic */}
                                      <div className="flex items-center justify-center gap-1 py-2">
                                        <button
                                          onClick={() => setTextDisplayMode('english')}
                                          className={`px-3 py-1 text-xs font-medium rounded-l-full transition-all ${
                                            textDisplayMode === 'english'
                                              ? 'bg-emerald-500 text-white'
                                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                          }`}
                                        >
                                          English
                                        </button>
                                        <button
                                          onClick={() => setTextDisplayMode('phonetic')}
                                          className={`px-3 py-1 text-xs font-medium rounded-r-full transition-all ${
                                            textDisplayMode === 'phonetic'
                                              ? 'bg-emerald-500 text-white'
                                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                          }`}
                                        >
                                          Phonetic
                                        </button>
                                      </div>

                                      {/* English translation or Phonetic */}
                                      <p className="text-sm text-gray-600 italic leading-relaxed">
                                        {textDisplayMode === 'phonetic' && match.verse.text_transliteration
                                          ? match.verse.text_transliteration
                                          : `"${match.verse.text_en}"`}
                                      </p>

                                      {/* Reflection */}
                                      {match.verse.reflection && (
                                        <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                                          <span className="font-medium text-emerald-600">How this applies: </span>
                                          {match.verse.reflection}
                                        </p>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-2">
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
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No goals yet</h3>
            <p className="text-sm text-gray-500">Add your first goal above to get started with Quranic guidance.</p>
          </div>
        )}
      </div>
    </div>
  )
}
