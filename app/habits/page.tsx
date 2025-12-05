'use client';

import { useState, useEffect } from 'react';
import DashboardCard from '@/components/DashboardCard';
import HabitTracker from '@/components/HabitTracker';
import HabitsCalendar from '@/components/HabitsCalendar';
import { storage } from '@/lib/security';

interface Habit {
  id: string;
  name: string;
  completed: boolean;
  icon?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  lastCompleted?: string;
  streak?: number;
  completionHistory?: string[];
}

const defaultHabits: Habit[] = [
  { id: 'fajr', name: 'Fajr Prayer', completed: false, icon: '🌅', frequency: 'daily' },
  { id: 'dhuhr', name: 'Dhuhr Prayer', completed: false, icon: '☀️', frequency: 'daily' },
  { id: 'asr', name: 'Asr Prayer', completed: false, icon: '🌤️', frequency: 'daily' },
  { id: 'maghrib', name: 'Maghrib Prayer', completed: false, icon: '🌅', frequency: 'daily' },
  { id: 'isha', name: 'Isha Prayer', completed: false, icon: '🌙', frequency: 'daily' },
  { id: 'quran', name: 'Quran Reading', completed: false, icon: '📖', frequency: 'daily' },
  { id: 'dhikr', name: 'Morning Dhikr', completed: false, icon: '🤲', frequency: 'daily' },
  { id: 'dua', name: 'Evening Dua', completed: false, icon: '🤲', frequency: 'daily' },
  { id: 'charity', name: 'Give Charity', completed: false, icon: '💝', frequency: 'weekly' },
  { id: 'fast', name: 'Voluntary Fasting', completed: false, icon: '🌙', frequency: 'weekly' },
  { id: 'family', name: 'Visit Family', completed: false, icon: '👨‍👩‍👧‍👦', frequency: 'monthly' },
  { id: 'zakat', name: 'Pay Zakat', completed: false, icon: '💰', frequency: 'yearly' },
];

// Habit Templates that users can quickly add
const habitTemplates = [
  {
    id: 'five-prayers',
    name: 'Five Daily Prayers',
    description: 'Complete set of 5 daily prayers',
    icon: '🕌',
    habits: [
      { name: 'Fajr Prayer', icon: '🌅', frequency: 'daily' as const },
      { name: 'Dhuhr Prayer', icon: '☀️', frequency: 'daily' as const },
      { name: 'Asr Prayer', icon: '🌤️', frequency: 'daily' as const },
      { name: 'Maghrib Prayer', icon: '🌆', frequency: 'daily' as const },
      { name: 'Isha Prayer', icon: '🌙', frequency: 'daily' as const },
    ]
  },
  {
    id: 'quran-study',
    name: 'Quran Study',
    description: 'Daily Quran reading and reflection',
    icon: '📖',
    habits: [
      { name: 'Read Quran (1 page)', icon: '📖', frequency: 'daily' as const },
      { name: 'Memorize new verse', icon: '🧠', frequency: 'daily' as const },
      { name: 'Reflect on verses', icon: '💭', frequency: 'daily' as const },
    ]
  },
  {
    id: 'dhikr-routine',
    name: 'Dhikr & Dua',
    description: 'Morning and evening remembrance',
    icon: '🤲',
    habits: [
      { name: 'Morning Dhikr', icon: '🌅', frequency: 'daily' as const },
      { name: 'Evening Dhikr', icon: '🌆', frequency: 'daily' as const },
      { name: 'Istighfar (100x)', icon: '🤲', frequency: 'daily' as const },
    ]
  },
  {
    id: 'charity-giving',
    name: 'Charity & Giving',
    description: 'Regular charity and acts of kindness',
    icon: '💝',
    habits: [
      { name: 'Daily Sadaqah', icon: '💝', frequency: 'daily' as const },
      { name: 'Help Someone', icon: '🤝', frequency: 'daily' as const },
      { name: 'Volunteer Work', icon: '👥', frequency: 'weekly' as const },
    ]
  },
  {
    id: 'spiritual-growth',
    name: 'Spiritual Growth',
    description: 'Islamic learning and self-improvement',
    icon: '🌱',
    habits: [
      { name: 'Islamic Study', icon: '📚', frequency: 'daily' as const },
      { name: 'Listen to Islamic Lecture', icon: '🎧', frequency: 'daily' as const },
      { name: 'Attend Friday Prayer', icon: '🕌', frequency: 'weekly' as const },
    ]
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    description: 'Taking care of the body Allah gave you',
    icon: '💪',
    habits: [
      { name: 'Morning Exercise', icon: '🏃', frequency: 'daily' as const },
      { name: 'Healthy Eating', icon: '🥗', frequency: 'daily' as const },
      { name: 'Early Sleep', icon: '😴', frequency: 'daily' as const },
    ]
  }
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [isLoaded, setIsLoaded] = useState(false);
  const [addedTemplate, setAddedTemplate] = useState<string | null>(null);

  // Helper function to check if a habit should be considered completed for its frequency
  const isHabitCompleted = (habit: Habit): boolean => {
    if (!habit.lastCompleted) return false;
    
    const now = new Date();
    const lastCompleted = new Date(habit.lastCompleted);
    
    switch (habit.frequency) {
      case 'daily':
        return lastCompleted.toDateString() === now.toDateString();
      case 'weekly':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);
        return lastCompleted >= startOfWeek;
      case 'monthly':
        return lastCompleted.getMonth() === now.getMonth() && 
               lastCompleted.getFullYear() === now.getFullYear();
      case 'yearly':
        return lastCompleted.getFullYear() === now.getFullYear();
      default:
        return false;
    }
  };

  // Helper function to calculate streak
  const calculateStreak = (habit: Habit): number => {
    if (!habit.completionHistory || habit.completionHistory.length === 0) return 0;
    
    const now = new Date();
    let streak = 0;
    
    switch (habit.frequency) {
      case 'daily':
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(now);
          checkDate.setDate(now.getDate() - i);
          const dateString = checkDate.toISOString().split('T')[0];
          
          if (habit.completionHistory.includes(dateString)) {
            streak++;
          } else {
            break;
          }
        }
        break;
      case 'weekly':
        for (let i = 0; i < 52; i++) {
          const checkDate = new Date(now);
          checkDate.setDate(now.getDate() - (i * 7));
          const weekStart = new Date(checkDate);
          weekStart.setDate(checkDate.getDate() - checkDate.getDay() + 1);
          
          const hasCompletionThisWeek = habit.completionHistory.some(dateStr => {
            const completionDate = new Date(dateStr);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return completionDate >= weekStart && completionDate <= weekEnd;
          });
          
          if (hasCompletionThisWeek) {
            streak++;
          } else {
            break;
          }
        }
        break;
      case 'monthly':
        for (let i = 0; i < 12; i++) {
          const checkDate = new Date(now);
          checkDate.setMonth(now.getMonth() - i);
          
          const hasCompletionThisMonth = habit.completionHistory.some(dateStr => {
            const completionDate = new Date(dateStr);
            return completionDate.getMonth() === checkDate.getMonth() &&
                   completionDate.getFullYear() === checkDate.getFullYear();
          });
          
          if (hasCompletionThisMonth) {
            streak++;
          } else {
            break;
          }
        }
        break;
      case 'yearly':
        for (let i = 0; i < 10; i++) {
          const checkYear = now.getFullYear() - i;
          
          const hasCompletionThisYear = habit.completionHistory.some(dateStr => {
            const completionDate = new Date(dateStr);
            return completionDate.getFullYear() === checkYear;
          });
          
          if (hasCompletionThisYear) {
            streak++;
          } else {
            break;
          }
        }
        break;
    }
    
    return streak;
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHabits = storage.get('quranlife-habits', defaultHabits);
    // Update completion status based on frequency
    const updatedHabits = savedHabits.map(habit => ({
      ...habit,
      completed: isHabitCompleted(habit),
      streak: calculateStreak(habit)
    }));
    setHabits(updatedHabits);
    setIsLoaded(true);
  }, []);

  // Save habits to localStorage only after initial load is complete
  useEffect(() => {
    if (isLoaded) {
      storage.set('quranlife-habits', habits);
    }
  }, [habits, isLoaded]);

  const toggleHabit = (habitId: string) => {
    setHabits(prev => 
      prev.map(habit => {
        if (habit.id !== habitId) return habit;
        
        const now = new Date();
        const todayString = now.toISOString().split('T')[0];
        const isCurrentlyCompleted = isHabitCompleted(habit);
        
        if (isCurrentlyCompleted) {
          // Unmark as completed - remove from history
          const updatedHistory = (habit.completionHistory || []).filter(date => {
            const completionDate = new Date(date);
            switch (habit.frequency) {
              case 'daily':
                return completionDate.toISOString().split('T')[0] !== todayString;
              case 'weekly':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay() + 1);
                startOfWeek.setHours(0, 0, 0, 0);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                return !(completionDate >= startOfWeek && completionDate <= endOfWeek);
              case 'monthly':
                return !(completionDate.getMonth() === now.getMonth() && 
                        completionDate.getFullYear() === now.getFullYear());
              case 'yearly':
                return completionDate.getFullYear() !== now.getFullYear();
              default:
                return true;
            }
          });
          
          return {
            ...habit,
            completed: false,
            lastCompleted: undefined,
            completionHistory: updatedHistory,
            streak: calculateStreak({ ...habit, completionHistory: updatedHistory })
          };
        } else {
          // Mark as completed - add to history
          const updatedHistory = [...(habit.completionHistory || []), todayString];
          const updatedHabit = {
            ...habit,
            completed: true,
            lastCompleted: now.toISOString(),
            completionHistory: updatedHistory,
            streak: calculateStreak({ ...habit, completionHistory: updatedHistory })
          };
          
          return updatedHabit;
        }
      })
    );
  };

  const resetHabits = () => {
    setHabits(prev => prev.map(habit => ({ 
      ...habit, 
      completed: false,
      lastCompleted: undefined 
    })));
  };

  const addTemplateHabits = (template: typeof habitTemplates[0]) => {
    const newHabits = template.habits.map(habitTemplate => ({
      id: `${template.id}-${habitTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: habitTemplate.name,
      completed: false,
      icon: habitTemplate.icon,
      frequency: habitTemplate.frequency,
      lastCompleted: undefined,
      streak: 0,
      completionHistory: []
    }));

    // Check for duplicates and only add habits that don't already exist
    const existingHabitNames = habits.map(h => h.name.toLowerCase());
    const uniqueNewHabits = newHabits.filter(newHabit => 
      !existingHabitNames.includes(newHabit.name.toLowerCase())
    );

    if (uniqueNewHabits.length > 0) {
      setHabits(prev => [...prev, ...uniqueNewHabits]);
      setAddedTemplate(template.id);
      setTimeout(() => setAddedTemplate(null), 3000); // Hide feedback after 3 seconds
    }
  };

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Daily Habits</h1>
        <p className="text-gray-600">
          Track your daily Islamic practices and personal development habits.
        </p>
      </div>

      {/* Habit Templates */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>⚡</span>
          Quick Start Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habitTemplates.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-xl p-4 border transition-all duration-200 cursor-pointer touch-manipulation ${
                addedTemplate === template.id 
                  ? 'border-green-500 bg-green-50 shadow-lg' 
                  : 'border-gray-200 hover:border-green-300 hover:shadow-md active:border-green-400 active:shadow-lg'
              }`}
              onClick={() => addTemplateHabits(template)}
              onTouchStart={() => {}} // Enable iOS touch events
              style={{ minHeight: '120px' }} // Ensure adequate touch target
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{template.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.habits.map((habit, index) => (
                      <span
                        key={index}
                        className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                      >
                        {habit.icon} {habit.name}
                      </span>
                    ))}
                  </div>
                  <button className={`mt-3 text-xs font-medium flex items-center gap-1 transition-colors ${
                    addedTemplate === template.id 
                      ? 'text-green-700' 
                      : 'text-green-600 hover:text-green-700'
                  }`}>
                    <span>{addedTemplate === template.id ? '✓' : '+'}</span>
                    {addedTemplate === template.id ? 'Added!' : `Add ${template.habits.length} habits`}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 md:hidden">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          <div className="text-sm text-gray-600">Completed Today</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{Math.round((completedCount / totalCount) * 100)}%</div>
          <div className="text-sm text-gray-600">Daily Progress</div>
        </div>
      </div>

      {/* Desktop Two-Column Layout */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-8 mb-8">
        {/* Left Sidebar - Stats & Tips */}
        <div className="space-y-6">
          {/* Desktop Stats Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-gray-600">Completed Today</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl font-bold text-green-600">{Math.round((completedCount / totalCount) * 100)}%</div>
              <div className="text-sm text-gray-600">Daily Progress</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl font-bold text-green-600">{totalCount}</div>
              <div className="text-sm text-gray-600">Total Habits</div>
            </div>
          </div>

          {/* Habit Tips - Desktop Sidebar */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <h3 className="text-md font-semibold text-gray-800 mb-3">💡 Habit Tips</h3>
            <ul className="space-y-2 text-xs text-gray-700">
              <li>• Start small and be consistent</li>
              <li>• Set prayer time reminders</li>
              <li>• Read one Quran page daily</li>
              <li>• Make dhikr during activities</li>
              <li>• Reset daily, stay motivated</li>
            </ul>
          </div>
        </div>

        {/* Right Content - Habits Tracker */}
        <div className="md:col-span-2">
          <DashboardCard 
            title="Today's Habits" 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <HabitTracker habits={habits} onToggleHabit={toggleHabit} />
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={resetHabits}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Reset All Habits
              </button>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Mobile Single Column Layout */}
      <div className="md:hidden">
        {/* Habits Tracker */}
        <DashboardCard 
          title="Today's Habits" 
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <HabitTracker habits={habits} onToggleHabit={toggleHabit} />
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={resetHabits}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Reset All Habits
            </button>
          </div>
        </DashboardCard>

        {/* Mobile Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Habit Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Start small and be consistent - it's better to pray one prayer daily than to miss all five occasionally.</li>
            <li>• Set reminders for prayer times using your phone or prayer apps.</li>
            <li>• Read just one page of Quran daily to build the habit gradually.</li>
            <li>• Make dhikr during daily activities like walking or commuting.</li>
            <li>• Reset your habits each day and don't let yesterday's missed practices discourage you.</li>
          </ul>
        </div>
      </div>

      {/* Habits Calendar - Full Width for Both Desktop and Mobile */}
      {habits.some(h => h.completionHistory && h.completionHistory.length > 0) && (
        <div className="mt-8">
          <HabitsCalendar habits={habits} />
        </div>
      )}
    </div>
  );
} 