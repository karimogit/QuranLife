'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { storage, sanitizeInput } from '@/lib/security'

interface Goal {
  id: string
  title: string
  description?: string
  completed: boolean
  category: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  lastCompleted?: string
}

export default function HomePage() {
  const router = useRouter()
  const [goalTitle, setGoalTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanedTitle = sanitizeInput(goalTitle)

    if (!cleanedTitle) {
      setError('Please enter a goal to get started.')
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      const existingGoals = storage.get<Goal[]>('quranlife-goals', [])
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: cleanedTitle,
        description: '',
        completed: false,
        category: 'personal',
        priority: 'medium',
        recurring: 'none',
      }

      storage.set('quranlife-goals', [newGoal, ...existingGoals])
      router.push('/goals')
    } catch (err) {
      console.error('Failed to save goal', err)
      setError('Something went wrong while saving your goal. Please try again.')
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700 mb-4">
            <span className="text-lg">📖</span>
            <span>Begin with one sincere intention</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
            What do you want to grow towards?
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-lg mx-auto">
            Capture a single goal you want to move towards. QuranLife will help you
            track it, build habits around it, and stay aligned with Quranic guidance.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md border border-emerald-50 px-4 py-4 md:px-6 md:py-5 space-y-4"
        >
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              Your first goal
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="goal"
                type="text"
                autoComplete="off"
                placeholder="e.g. Recite Quran with reflection for 15 minutes daily"
                value={goalTitle}
                onChange={e => setGoalTitle(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm md:text-base text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm md:text-base font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving…' : 'Save goal'}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-500">
            <p>Your goal is stored privately in your browser. You can add details and habits next.</p>
            <button
              type="button"
              onClick={() => router.push('/goals')}
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View all goals
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
