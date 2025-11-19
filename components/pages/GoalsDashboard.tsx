'use client';

import { useEffect, useMemo, useState } from 'react';
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
  lastCompleted?: string;
}

const categories = [
  { id: 'spiritual', label: 'Spiritual', emoji: '🕌' },
  { id: 'personal', label: 'Personal', emoji: '⭐' },
  { id: 'health', label: 'Health', emoji: '💪' },
  { id: 'career', label: 'Career', emoji: '💼' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
];

const categoryLookup = categories.reduce<Record<string, string>>((acc, category) => {
  acc[category.id] = category.label;
  return acc;
}, {});

const shouldResetRecurringGoal = (goal: Goal): boolean => {
  if (!goal.recurring || goal.recurring === 'none' || !goal.lastCompleted) {
    return false;
  }

  const now = new Date();
  const lastCompleted = new Date(goal.lastCompleted);

  switch (goal.recurring) {
    case 'daily':
      return lastCompleted.toDateString() !== now.toDateString();
    case 'weekly': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      return lastCompleted < startOfWeek;
    }
    case 'monthly':
      return (
        lastCompleted.getMonth() !== now.getMonth() ||
        lastCompleted.getFullYear() !== now.getFullYear()
      );
    default:
      return false;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function GoalsDashboard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [calendarSelectedGoal, setCalendarSelectedGoal] = useState<string | null>(null);

  useEffect(() => {
    const savedGoals = storage.get<Goal[]>('quranlife-goals', []);
    const normalizedGoals = savedGoals.map((goal: Goal) =>
      shouldResetRecurringGoal(goal)
        ? { ...goal, completed: false, lastCompleted: undefined }
        : goal
    );
    setGoals(normalizedGoals);
  }, []);

  useEffect(() => {
    storage.set('quranlife-goals', goals);
  }, [goals]);

  const activeGoals = useMemo(() => goals.filter(goal => !goal.completed), [goals]);
  const completedGoals = useMemo(() => goals.filter(goal => goal.completed), [goals]);

  const totalActiveGoals = activeGoals.length;
  const totalCompletedGoals = completedGoals.length;
  const totalGoals = goals.length;
  const completionRate = totalGoals === 0 ? 0 : Math.round((totalCompletedGoals / totalGoals) * 100);
  const recurringGoals = useMemo(
    () => activeGoals.filter(goal => goal.recurring && goal.recurring !== 'none'),
    [activeGoals]
  );

  const filteredGoals = useMemo(() => {
    const currentList = activeTab === 'active' ? activeGoals : completedGoals;
    if (activeFilter === 'all') return currentList;
    return currentList.filter(goal => goal.category === activeFilter);
  }, [activeTab, activeFilter, activeGoals, completedGoals]);

  const categorySummary = useMemo(() => {
    return categories
      .map(category => {
        const activeCount = activeGoals.filter(goal => goal.category === category.id).length;
        const completedCount = completedGoals.filter(goal => goal.category === category.id).length;
        return {
          ...category,
          active: activeCount,
          completed: completedCount,
          total: activeCount + completedCount,
        };
      })
      .filter(category => category.total > 0);
  }, [activeGoals, completedGoals]);

  const dueSoonGoals = useMemo(() => {
    return activeGoals
      .filter(goal => goal.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 3);
  }, [activeGoals]);

  const highPriorityGoals = useMemo(
    () => activeGoals.filter(goal => goal.priority === 'high').slice(0, 3),
    [activeGoals]
  );

  const focusGoals = dueSoonGoals.length > 0 ? dueSoonGoals : highPriorityGoals;

  const toggleGoal = (goalId: string) => {
    setGoals(prev =>
      prev.map(goal => {
        if (goal.id !== goalId) return goal;
        const now = new Date().toISOString();
        return {
          ...goal,
          completed: !goal.completed,
          lastCompleted: !goal.completed ? now : undefined,
        };
      })
    );
  };

  const addGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goal: Goal = {
      ...newGoal,
      id: Date.now().toString(),
    };
    setGoals(prev => [goal, ...prev]);
  };

  const editGoal = (goalId: string, updatedGoal: Omit<Goal, 'id'>) => {
    setGoals(prev =>
      prev.map(goal => (goal.id === goalId ? { ...goal, ...updatedGoal } : goal))
    );
  };

  const removeGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const handleGoalClick = (goal: Goal) => {
    setActiveTab(goal.completed ? 'completed' : 'active');
    setCalendarSelectedGoal(goal.id);

    if (typeof window !== 'undefined') {
      const element = document.querySelector('[data-goals-list]');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      window.setTimeout(() => {
        setCalendarSelectedGoal(null);
      }, 3500);
    }
  };


  const nextDueGoal = dueSoonGoals[0];
  const lastCompletedGoal = completedGoals
    .filter(goal => goal.lastCompleted)
    .sort(
      (a, b) =>
        new Date(b.lastCompleted!).getTime() - new Date(a.lastCompleted!).getTime()
    )[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 space-y-10">
      {categorySummary.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Category balance</h2>
            <span className="text-sm text-gray-500">
              Track how your goals span across life areas
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {categorySummary.map(category => (
              <div
                key={category.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-lg">{category.emoji}</span>
                  <span className="font-medium">{category.label}</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-900">{category.total}</p>
                <p className="text-xs text-gray-500">
                  {category.active} active · {category.completed} completed
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 rounded-full bg-gray-100 p-1">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === 'active' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Active ({totalActiveGoals})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === 'completed'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-500'
                  }`}
                >
                  Completed ({totalCompletedGoals})
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All goals' },
                  ...categories,
                ].map(filter => {
                  const isActive = activeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-700'
                      }`}
                    >
                      {filter.id === 'all' ? 'All' : `${'emoji' in filter ? filter.emoji + ' ' : ''}${filter.label}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DashboardCard
            title="Your goal board"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
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

        <div className="space-y-6">
          <DashboardCard
            title="Focus goals"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2v6h6v-6c0-1.105-1.343-2-3-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10h14"
                />
              </svg>
            }
          >
            {focusGoals.length > 0 ? (
              <div className="space-y-4">
                {focusGoals.map(goal => (
                  <div
                    key={goal.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">
                          {categoryLookup[goal.category] ?? 'Goal'}
                        </p>
                        <p className="text-base font-semibold text-gray-900">{goal.title}</p>
                        {goal.dueDate && (
                          <p className="text-xs text-gray-500">
                            Due {formatDate(goal.dueDate)}
                          </p>
                        )}
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          goal.priority === 'high'
                            ? 'bg-red-50 text-red-700'
                            : goal.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      {goal.recurring && goal.recurring !== 'none' ? (
                        <span className="text-xs text-emerald-600">
                          🔄 {goal.recurring.charAt(0).toUpperCase() + goal.recurring.slice(1)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">One-time goal</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Add due dates or high-priority goals to build a focus list.
              </p>
            )}
          </DashboardCard>

          {activeGoals.length > 0 && (
            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
              <GoalsCalendar goals={activeGoals} onGoalClick={handleGoalClick} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
