'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardCard from '@/components/DashboardCard';
import GoalsList from '@/components/GoalsList';
import GoalsCalendar from '@/components/GoalsCalendar';
import SmartGuidance from '@/components/SmartGuidance';
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
  const [guidanceGoalId, setGuidanceGoalId] = useState<string | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);

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

  useEffect(() => {
    if (guidanceGoalId) return;
    const fallbackGoal =
      dueSoonGoals[0] || activeGoals[0] || completedGoals[0] || null;
    if (fallbackGoal) {
      setGuidanceGoalId(fallbackGoal.id);
    }
  }, [guidanceGoalId, dueSoonGoals, activeGoals, completedGoals]);

  const spotlightGoal = useMemo(() => {
    if (guidanceGoalId) {
      return goals.find(goal => goal.id === guidanceGoalId) || null;
    }
    return dueSoonGoals[0] || activeGoals[0] || completedGoals[0] || null;
  }, [guidanceGoalId, goals, dueSoonGoals, activeGoals, completedGoals]);

  useEffect(() => {
    if (!spotlightGoal) {
      setShowGuidance(false);
    }
  }, [spotlightGoal]);

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
    setGuidanceGoalId(goal.id);
    setShowGuidance(true);
    setCalendarSelectedGoal(goal.id);

    if (typeof window !== 'undefined') {
      const element = document.querySelector('[data-goals-list]');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      window.setTimeout(() => {
        setCalendarSelectedGoal(null);
      }, 3500);
    }
  };

  const handleFocusGoal = (goal: Goal) => {
    setGuidanceGoalId(goal.id);
    setShowGuidance(true);
    if (!goal.completed) {
      setActiveTab('active');
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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-emerald-400/30 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 space-y-8 p-6 md:p-10">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">
              Goals Dashboard
            </p>
            <h1 className="text-3xl font-bold md:text-4xl">
              Align your intentions with meaningful action
            </h1>
            <p className="text-base text-white/80 md:text-lg md:max-w-3xl">
              Plan, track, and celebrate the goals that shape your spiritual and personal growth.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 shadow-inner backdrop-blur">
              <p className="text-sm text-white/80">Completion rate</p>
              <p className="mt-2 text-3xl font-bold">{completionRate}%</p>
              <div className="mt-3 h-2 w-full rounded-full bg-white/20">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 shadow-inner backdrop-blur">
              <p className="text-sm text-white/80">Next milestone</p>
              {nextDueGoal ? (
                <>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatDate(nextDueGoal.dueDate)}
                  </p>
                  <p className="text-sm text-white/80">{nextDueGoal.title}</p>
                </>
              ) : (
                <p className="mt-2 text-2xl font-semibold">No due dates</p>
              )}
            </div>
            <div className="rounded-2xl bg-white/10 p-4 shadow-inner backdrop-blur">
              <p className="text-sm text-white/80">Recurring rhythms</p>
              <p className="mt-2 text-3xl font-bold">{recurringGoals.length}</p>
              <p className="text-sm text-white/80">Goals with ongoing cadence</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-white/70">Active goals</p>
              <p className="text-3xl font-semibold">{totalActiveGoals}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-white/70">Completed</p>
              <p className="text-3xl font-semibold">{totalCompletedGoals}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-white/70">High priority</p>
              <p className="text-3xl font-semibold">
                {activeGoals.filter(goal => goal.priority === 'high').length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-white/70">Latest win</p>
              <p className="text-lg font-semibold">
                {lastCompletedGoal?.title ?? 'Awaiting achievement'}
              </p>
            </div>
          </div>
        </div>
      </section>

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
                      {filter.id === 'all' ? 'All' : `${filter.emoji} ${filter.label}`}
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
                      <button
                        onClick={() => handleFocusGoal(goal)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          guidanceGoalId === goal.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-emerald-700 border border-emerald-100 hover:bg-emerald-50'
                        }`}
                      >
                        {guidanceGoalId === goal.id ? 'Spotlighted' : 'Focus'}
                      </button>
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

          <DashboardCard
            title="Guidance spotlight"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6l4 2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12a7 7 0 1114 0 7 7 0 01-14 0z"
                />
              </svg>
            }
          >
            {spotlightGoal ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Currently spotlighting
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {spotlightGoal.title}
                    </p>
                    {spotlightGoal.description && (
                      <p className="text-sm text-gray-600">{spotlightGoal.description}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="rounded-full bg-white px-3 py-1">
                      {categoryLookup[spotlightGoal.category] ?? 'Goal'}
                    </span>
                    {spotlightGoal.dueDate && (
                      <span className="rounded-full bg-white px-3 py-1">
                        Due {formatDate(spotlightGoal.dueDate)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowGuidance(prev => !prev)}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    {showGuidance ? 'Hide Quranic guidance' : 'Open Quranic guidance'}
                  </button>
                </div>

                {showGuidance && (
                  <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <SmartGuidance
                      goalTitle={spotlightGoal.title}
                      goalDescription={spotlightGoal.description || ''}
                      goalCategory={spotlightGoal.category}
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Add a goal to unlock tailored Quranic guidance.
              </p>
            )}
          </DashboardCard>
        </div>
      </section>
    </div>
  );
}
