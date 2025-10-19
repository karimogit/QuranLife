'use client';

import { useState, useEffect } from 'react';
import DashboardCard from '@/components/DashboardCard';
import GoalsList from '@/components/GoalsList';
import GoalsCalendar from '@/components/GoalsCalendar';
import { storage } from '@/lib/security';

interface Goal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  lastCompleted?: string; // Track when the recurring goal was last completed
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [calendarSelectedGoal, setCalendarSelectedGoal] = useState<string | null>(null);

  // Load data from localStorage on mount and reset recurring goals if needed
  useEffect(() => {
    const savedGoals = storage.get('quranlife-goals', []);
    
    // Check and reset recurring goals that should be reset
    const updatedGoals = savedGoals.map((goal: Goal) => {
      if (shouldResetRecurringGoal(goal)) {
        return { ...goal, completed: false, lastCompleted: undefined };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
  }, []);

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    storage.set('quranlife-goals', goals);
  }, [goals]);

  // Helper function to check if a recurring goal should be reset
  const shouldResetRecurringGoal = (goal: Goal): boolean => {
    if (!goal.recurring || goal.recurring === 'none' || !goal.lastCompleted) {
      return false;
    }

    const now = new Date();
    const lastCompleted = new Date(goal.lastCompleted);

    switch (goal.recurring) {
      case 'daily':
        return lastCompleted.toDateString() !== now.toDateString();
      case 'weekly':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);
        return lastCompleted < startOfWeek;
      case 'monthly':
        return lastCompleted.getMonth() !== now.getMonth() || 
               lastCompleted.getFullYear() !== now.getFullYear();
      default:
        return false;
    }
  };

  const toggleGoal = (goalId: string) => {
    setGoals(prev => 
      prev.map(goal => {
        if (goal.id !== goalId) return goal;

        const now = new Date();
        const isCurrentlyCompleted = goal.completed;
        
        if (isCurrentlyCompleted) {
          // Unmark as completed
          return { 
            ...goal, 
            completed: false,
            lastCompleted: undefined
          };
        } else {
          // Mark as completed
          return { 
            ...goal, 
            completed: true,
            lastCompleted: now.toISOString()
          };
        }
      })
    );
  };

  const addGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goal: Goal = {
      ...newGoal,
      id: Date.now().toString()
    };
    setGoals(prev => [goal, ...prev]);
  };

  const editGoal = (goalId: string, updatedGoal: Omit<Goal, 'id'>) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updatedGoal } : goal
    );
    setGoals(updatedGoals);
    storage.set('quranlife-goals', updatedGoals);
  };

  const handleGoalClick = (goal: Goal) => {
    // Set the goal as selected from calendar
    setCalendarSelectedGoal(goal.id);
    
    // Scroll to the goals list
    const goalsSection = document.querySelector('[data-goals-list]');
    if (goalsSection) {
      goalsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Clear the selection after a delay to allow for visual feedback
    setTimeout(() => {
      setCalendarSelectedGoal(null);
    }, 3000);
  };

  const removeGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);
  const totalActiveGoals = activeGoals.length;
  const totalCompletedGoals = completedGoals.length;

  // Filter goals based on active tab and filter
  const getFilteredGoals = () => {
    const tabGoals = activeTab === 'active' ? activeGoals : completedGoals;
    return activeFilter === 'all' 
      ? tabGoals 
      : tabGoals.filter(goal => goal.category === activeFilter);
  };

  const filteredGoals = getFilteredGoals();

  const getGoalsByCategory = () => {
    const categories = ['spiritual', 'personal', 'health', 'career', 'family'];
    const currentGoals = activeTab === 'active' ? activeGoals : completedGoals;
    return categories.map(category => ({
      category,
      goals: currentGoals.filter(g => g.category === category),
      count: currentGoals.filter(g => g.category === category).length
    }));
  };

  // Helper function to get category emoji
  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      spiritual: '🕌',
      personal: '⭐',
      health: '💪',
      career: '💼',
      family: '👨‍👩‍👧‍👦'
    };
    return emojis[category] || '📋';
  };

  // Helper function to get category color
  const getCategoryColor = (category: string, isActive: boolean) => {
    const colors: Record<string, string> = {
      spiritual: isActive ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white hover:bg-green-50 border-gray-100 text-gray-800',
      personal: isActive ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white hover:bg-emerald-50 border-gray-100 text-gray-800',
      health: isActive ? 'bg-teal-100 border-teal-300 text-teal-800' : 'bg-white hover:bg-teal-50 border-gray-100 text-gray-800',
      career: isActive ? 'bg-lime-100 border-lime-300 text-lime-800' : 'bg-white hover:bg-lime-50 border-gray-100 text-gray-800',
      family: isActive ? 'bg-green-200 border-green-400 text-green-900' : 'bg-white hover:bg-green-50 border-gray-100 text-gray-800'
    };
    return colors[category] || (isActive ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-800');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Goals</h1>
        <p className="text-gray-600 text-lg">Set and achieve your life goals with Islamic guidance</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Active Goals ({totalActiveGoals})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Completed ({totalCompletedGoals})
          </button>
        </div>
      </div>

      {/* Mobile Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 md:hidden">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 shadow-sm">
          <div className="text-2xl font-bold text-green-600 mb-1">{totalCompletedGoals}</div>
          <div className="text-sm text-gray-600 font-medium">Completed</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100 shadow-sm">
          <div className="text-2xl font-bold text-blue-600 mb-1">{totalActiveGoals}</div>
          <div className="text-sm text-gray-600 font-medium">Active</div>
        </div>
      </div>

      {/* Desktop Two-Column Layout */}
      <div className="hidden md:grid md:grid-cols-4 md:gap-8 mb-8">
        {/* Left Sidebar - Stats & Categories */}
        <div className="space-y-6">
          {/* Desktop Stats Cards */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-1">{totalCompletedGoals}</div>
              <div className="text-sm text-gray-600 font-medium">Completed Goals</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100 shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalActiveGoals}</div>
              <div className="text-sm text-gray-600 font-medium">Active Goals</div>
            </div>
          </div>

          {/* Goals by Category */}
          {(totalActiveGoals + totalCompletedGoals) > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>📋</span>
                Filter by Category
              </h3>
              
              {/* All Goals Filter */}
              <button
                onClick={() => setActiveFilter('all')}
                className={`w-full text-left rounded-xl p-4 border transition-all duration-200 cursor-pointer ${
                  activeFilter === 'all' 
                    ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300 text-gray-800 shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-800 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <span>📋</span>
                      All Goals
                    </div>
                    <div className="text-sm text-gray-600">{activeTab === 'active' ? totalActiveGoals : totalCompletedGoals} {activeTab} goals</div>
                  </div>
                  {activeFilter === 'all' && (
                    <div className="text-gray-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              {/* Category Filters */}
              {getGoalsByCategory().filter(cat => cat.count > 0).map(category => (
                <button
                  key={category.category}
                  onClick={() => setActiveFilter(category.category)}
                  className={`w-full text-left rounded-xl p-4 border transition-all duration-200 cursor-pointer ${getCategoryColor(category.category, activeFilter === category.category)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold flex items-center gap-2 capitalize">
                        <span>{getCategoryEmoji(category.category)}</span>
                        {category.category}
                      </div>
                      <div className="text-sm opacity-75">{category.count} goals</div>
                    </div>
                    {activeFilter === category.category && (
                      <div className="opacity-75">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}


        </div>

        {/* Right Content - Goals List */}
        <div className="md:col-span-3">
          <DashboardCard 
            title={
              <div className="flex items-center gap-2">
                <span>Your Goals</span>
                {activeFilter !== 'all' && (
                  <span className="text-sm font-normal text-gray-500">
                    - {getCategoryEmoji(activeFilter)} {activeFilter}
                  </span>
                )}
              </div>
            }
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          >
            <div data-goals-list>
              <GoalsList 
                goals={filteredGoals} 
                onToggleGoal={toggleGoal} 
                onAddGoal={addGoal}
                onEditGoal={editGoal}
                onRemoveGoal={removeGoal}
                highlightedGoalId={calendarSelectedGoal}
              />
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Goals Calendar - Full Width */}
      {activeGoals.length > 0 && (
        <div className="mt-8">
          <div className="overflow-x-auto md:overflow-visible">
            <div className="inline-block min-w-full align-middle">
              <GoalsCalendar goals={activeGoals} onGoalClick={handleGoalClick} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Single Column Layout */}
      <div className="md:hidden">
        {/* Mobile Goals by Category */}
        {(totalActiveGoals + totalCompletedGoals) > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Filter by Category</h3>
            
            {/* Mobile All Goals Filter */}
            <button
              onClick={() => setActiveFilter('all')}
              className={`w-full text-left rounded-xl p-4 border transition-all duration-200 cursor-pointer mb-4 ${
                activeFilter === 'all' 
                  ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300 text-gray-800 shadow-sm' 
                  : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-800 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold flex items-center gap-2">
                    <span>📋</span>
                    All Goals
                  </div>
                  <div className="text-sm text-gray-600">{activeTab === 'active' ? totalActiveGoals : totalCompletedGoals} {activeTab} goals</div>
                </div>
                {activeFilter === 'all' && (
                  <div className="text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            {/* Mobile Category Filters Grid */}
            <div className="grid grid-cols-2 gap-3">
              {getGoalsByCategory().filter(cat => cat.count > 0).map(category => (
                <button
                  key={category.category}
                  onClick={() => setActiveFilter(category.category)}
                  className={`text-left rounded-xl p-4 border transition-all duration-200 cursor-pointer ${getCategoryColor(category.category, activeFilter === category.category)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-semibold flex items-center gap-2 capitalize">
                        <span>{getCategoryEmoji(category.category)}</span>
                        {category.category}
                      </div>
                      <div className="text-sm opacity-75">{category.count} goals</div>
                    </div>
                    {activeFilter === category.category && (
                      <div className="opacity-75">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Goals List */}
        <DashboardCard 
          title={
            <div className="flex items-center gap-2">
              <span>Your Goals</span>
              {activeFilter !== 'all' && (
                <span className="text-sm font-normal text-gray-500">
                  - {getCategoryEmoji(activeFilter)} {activeFilter}
                </span>
              )}
            </div>
          }
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        >
          <GoalsList 
            goals={filteredGoals} 
            onToggleGoal={toggleGoal} 
            onAddGoal={addGoal}
            onEditGoal={editGoal}
            onRemoveGoal={removeGoal}
            highlightedGoalId={calendarSelectedGoal}
          />
        </DashboardCard>


      </div>
    </div>
  );
} 