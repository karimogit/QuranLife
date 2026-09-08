/**
 * Security utilities for QuranLife app
 * Author: Karim Osman (https://kar.im)
 */

import { logger } from '@/lib/logger';

// Safe JSON parsing with error handling
export function safeJSONParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  
  try {
    const parsed = JSON.parse(value);
    return parsed;
  } catch (error) {
    logger.warn('Failed to parse JSON from localStorage:', error);
    return fallback;
  }
}

// Safe localStorage operations with error handling
export const storage = {
  get: <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    
    try {
      const item = localStorage.getItem(key);
      return safeJSONParse(item, fallback);
    } catch (error) {
      logger.warn('Failed to get item from localStorage:', error);
      return fallback;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Failed to save to localStorage', error, 'storage.set');
      return false;
    }
  },

  remove: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.error('Failed to remove from localStorage', error, 'storage.remove');
      return false;
    }
  }
};

// Input validation for goals and habits
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 500); // Limit length
}

interface HabitLike {
  id: string;
  name: string;
  completed: boolean;
}

interface GoalLike {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  priority: string;
  description?: string;
}

// Validate habit structure
export function isValidHabit(habit: unknown): habit is HabitLike {
  if (typeof habit !== 'object' || habit === null) return false;
  const h = habit as Record<string, unknown>;
  return (
    typeof h.id === 'string' &&
    typeof h.name === 'string' &&
    typeof h.completed === 'boolean' &&
    h.name.length > 0 &&
    h.name.length <= 100
  );
}

// Validate goal structure
export function isValidGoal(goal: unknown): goal is GoalLike {
  if (typeof goal !== 'object' || goal === null) return false;
  const g = goal as Record<string, unknown>;
  return (
    typeof g.id === 'string' &&
    typeof g.title === 'string' &&
    typeof g.completed === 'boolean' &&
    typeof g.category === 'string' &&
    typeof g.priority === 'string' &&
    ['low', 'medium', 'high'].includes(g.priority) &&
    g.title.length > 0 &&
    g.title.length <= 200 &&
    (g.description === undefined || (typeof g.description === 'string' && g.description.length <= 1000))
  );
}

// Rate limiting for API calls (simple implementation)
class RateLimiter {
  private calls: number[] = [];
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number = 10, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  isAllowed(): boolean {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    
    if (this.calls.length >= this.limit) {
      return false;
    }
    
    this.calls.push(now);
    return true;
  }
}

export const apiRateLimiter = new RateLimiter(20, 60000); // 20 calls per minute
