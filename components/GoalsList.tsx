'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import SmartGuidance from './SmartGuidance';

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

interface GoalsListProps {
  goals: Goal[];
  onToggleGoal: (goalId: string) => void;
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onEditGoal: (goalId: string, updatedGoal: Omit<Goal, 'id'>) => void;
  onRemoveGoal: (goalId: string) => void;
  highlightedGoalId?: string | null;
}

export default function GoalsList({ goals, onToggleGoal, onAddGoal, onEditGoal, onRemoveGoal, highlightedGoalId }: GoalsListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [newlyCreatedGoalId, setNewlyCreatedGoalId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium' as Goal['priority'],
    dueDate: '',
    recurring: 'none' as Goal['recurring']
  });
  const [editGoal, setEditGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium' as Goal['priority'],
    dueDate: '',
    recurring: 'none' as Goal['recurring']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.title.trim()) {
      const goalId = Date.now().toString();
      onAddGoal({
        ...newGoal,
        completed: false
      });
      setNewGoal({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        dueDate: '',
        recurring: 'none'
      });
      setShowAddForm(false);
      
      // Automatically show Islamic Guidance for the newly created goal
      setNewlyCreatedGoalId(goalId);
      setSelectedGoal(goalId);
      
      // Clear the newly created goal ID after a delay
      setTimeout(() => {
        setNewlyCreatedGoalId(null);
      }, 5000);
    }
  };

  const handleEditStart = (goal: Goal) => {
    setEditingGoal(goal.id);
    setEditGoal({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      priority: goal.priority,
      dueDate: goal.dueDate || '',
      recurring: goal.recurring || 'none'
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editGoal.title.trim() && editingGoal) {
      onEditGoal(editingGoal, {
        ...editGoal,
        completed: false
      });
      setEditingGoal(null);
      setEditGoal({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        dueDate: '',
        recurring: 'none'
      });
    }
  };

  const handleEditCancel = () => {
    setEditingGoal(null);
    setEditGoal({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      dueDate: '',
      recurring: 'none'
    });
  };

  const handleRemove = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      onRemoveGoal(goalId);
    }
  };

  const handleQuickAddHabitForGoal = (goal: Goal) => {
    const habitGoal: Omit<Goal, 'id'> = {
      title: `${goal.title} - Daily Practice`,
      description: goal.description || '',
      category: goal.category,
      priority: goal.priority,
      dueDate: new Date().toISOString().split('T')[0],
      recurring: 'daily',
      completed: false
    } as any;
    onAddGoal(habitGoal);
    setSelectedGoal(goal.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const capitalizeLabel = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <div className="space-y-4">
      {/* Add Goal Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="group w-full p-5 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-base">Add New Goal</span>
        </div>
      </button>

      {/* Add Goal Form */}
      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl space-y-4 border border-gray-200"
        >
          <input
            type="text"
            placeholder="Goal title..."
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <textarea
            placeholder="Description (optional)..."
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={2}
          />
          <input
            type="date"
            value={newGoal.dueDate}
            onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Due date (optional)..."
          />
          <select
            value={newGoal.recurring}
            onChange={(e) => setNewGoal({ ...newGoal, recurring: e.target.value as Goal['recurring'] })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="none">No Recurring (one-time goal)</option>
            <option value="daily">Daily (habit)</option>
            <option value="weekly">Weekly (habit)</option>
            <option value="monthly">Monthly (habit)</option>
            <option value="yearly">Yearly (habit)</option>
          </select>
          {newGoal.recurring && newGoal.recurring !== 'none' && (
            <p className="text-xs text-gray-600">
              🔄 This will be treated as a habit and automatically reset on the selected cadence.
            </p>
          )}
          <div className="flex gap-3">
            <select
              value={newGoal.category}
              onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="personal">Personal</option>
              <option value="spiritual">Spiritual</option>
              <option value="health">Health</option>
              <option value="career">Career</option>
              <option value="family">Family</option>
            </select>
            <select
              value={newGoal.priority}
              onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as Goal['priority'] })}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Goal
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Goals List */}
      <div className="space-y-3">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl border-2 transition-all duration-200 ${
              goal.completed 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-md' 
                : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-lg shadow-sm'
            } ${
              highlightedGoalId === goal.id 
                ? 'ring-2 ring-green-400 ring-opacity-50 shadow-xl border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' 
                : ''
            } ${
              newlyCreatedGoalId === goal.id 
                ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-xl border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50' 
                : ''
            }`}
          >
            {editingGoal === goal.id ? (
              /* Edit Form */
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <input
                  type="text"
                  value={editGoal.title}
                  onChange={(e) => setEditGoal({ ...editGoal, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Goal title..."
                  required
                />
                <textarea
                  value={editGoal.description}
                  onChange={(e) => setEditGoal({ ...editGoal, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Description (optional)..."
                  rows={2}
                />
                <input
                  type="date"
                  value={editGoal.dueDate}
                  onChange={(e) => setEditGoal({ ...editGoal, dueDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Due date (optional)..."
                />
                <select
                  value={editGoal.recurring}
                  onChange={(e) => setEditGoal({ ...editGoal, recurring: e.target.value as Goal['recurring'] })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="none">No Recurring (one-time goal)</option>
                  <option value="daily">Daily (habit)</option>
                  <option value="weekly">Weekly (habit)</option>
                  <option value="monthly">Monthly (habit)</option>
                  <option value="yearly">Yearly (habit)</option>
                </select>
                <div className="flex gap-3">
                  <select
                    value={editGoal.category}
                    onChange={(e) => setEditGoal({ ...editGoal, category: e.target.value })}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="personal">Personal</option>
                    <option value="spiritual">Spiritual</option>
                    <option value="health">Health</option>
                    <option value="career">Career</option>
                    <option value="family">Family</option>
                  </select>
                  <select
                    value={editGoal.priority}
                    onChange={(e) => setEditGoal({ ...editGoal, priority: e.target.value as Goal['priority'] })}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Goal Display */
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleGoal(goal.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-1 transition-all duration-200 ${
                    goal.completed
                      ? 'bg-green-500 border-green-500 text-white shadow-md'
                      : 'border-gray-300 hover:border-green-400 hover:shadow-sm'
                  }`}
                >
                  {goal.completed && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1">
                  <h4 className={`text-lg font-semibold ${goal.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                    {goal.title}
                    {goal.recurring && goal.recurring !== 'none' && goal.completed && (
                      <span className="ml-2 text-sm font-normal text-green-600">
                        ✓ Completed for this {goal.recurring.slice(0, -2)}
                      </span>
                    )}
                  </h4>
                  {goal.description && (
                    <p className={`text-sm mt-2 leading-relaxed ${goal.completed ? 'text-green-600' : 'text-gray-700'}`}>
                      {goal.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`px-3 py-1.5 text-xs font-medium rounded-full border ${getPriorityColor(goal.priority)}`}>
                      {capitalizeLabel(goal.priority)} Priority
                    </span>
                    <span className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      {capitalizeLabel(goal.category)}
                    </span>
                    {goal.dueDate && (
                      <span className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
                        📅 Due {new Date(goal.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {goal.recurring && goal.recurring !== 'none' && (
                      <span className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                        🔄 {goal.recurring.charAt(0).toUpperCase() + goal.recurring.slice(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 min-w-[100px]">
                  <button
                    onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
                    className={`group p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                      selectedGoal === goal.id 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white border-2 border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={selectedGoal === goal.id ? "Hide Islamic guidance" : "Show Islamic guidance"}
                  >
                    {selectedGoal === goal.id ? (
                      <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleQuickAddHabitForGoal(goal)}
                    className="group p-2.5 bg-white border-2 border-gray-200 text-gray-500 rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Add a recurring habit for this goal"
                  >
                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEditStart(goal)}
                    className="group p-2.5 bg-white border-2 border-gray-200 text-gray-500 rounded-xl hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Edit goal"
                  >
                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemove(goal.id)}
                    className="group p-2.5 bg-white border-2 border-gray-200 text-gray-500 rounded-xl hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Delete goal"
                  >
                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Islamic Guidance */}
            {selectedGoal === goal.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-4 border-t border-gray-200 pt-4 ${
                  newlyCreatedGoalId === goal.id ? 'bg-blue-50 rounded-lg p-4 border border-blue-200' : ''
                }`}
              >
                <div 
                  className="mb-3 flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={() => setSelectedGoal(null)}
                >
                  <span className="text-lg">📖</span>
                  <h5 className="font-semibold text-gray-800 flex-1">
                    Islamic Guidance for Your Goal
                    {newlyCreatedGoalId === goal.id && (
                      <span className="ml-2 text-sm font-normal text-blue-600">
                        ✨ New goal guidance
                      </span>
                    )}
                  </h5>
                  <span className="text-gray-400 text-sm">Click to close</span>
                </div>
                <SmartGuidance 
                  goalTitle={goal.title}
                  goalDescription={goal.description || ''}
                  goalCategory={goal.category}
                />
              </motion.div>
            )}
          </motion.div>
        ))}
        
        {goals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No goals yet. Add your first goal to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
} 