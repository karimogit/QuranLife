'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { quranEngine, GoalMatchResult } from '@/lib/quran-engine';
import { logger } from '@/lib/logger';

interface SmartGuidanceProps {
  goalTitle: string;
  goalDescription?: string;
  goalCategory: string;
}

export default function SmartGuidance({ goalTitle, goalDescription = '', goalCategory }: SmartGuidanceProps) {
  const [guidance, setGuidance] = useState<GoalMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0); // Open first item by default
  const [audioStates, setAudioStates] = useState<{ [key: number]: { isPlaying: boolean; isLoading: boolean; error: string | null } }>({});
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});

  const loadGuidance = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use the new QuranEngine API to find verses for the goal
      const goalText = `${goalTitle} ${goalDescription} ${goalCategory}`.trim();
      const matches = await logger.performance.measure('loadGuidance', async () => {
        return await quranEngine.findVersesForGoal(goalText);
      });
      
      setGuidance(matches);
      logger.info('Guidance loaded successfully', { goalText, matchCount: matches.length });
    } catch (error) {
      logger.error('Failed to load guidance', error, 'SmartGuidance.loadGuidance');
      setGuidance([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [goalTitle, goalDescription, goalCategory]);

  useEffect(() => {
    loadGuidance();
  }, [loadGuidance]);

  const handleToggleExpand = (index: number) => {
    setExpanded(expanded === index ? null : index);
  };

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const goalText = `${goalTitle} ${goalDescription} ${goalCategory}`.trim();
      const additionalVerses = await quranEngine.getAdditionalVersesForGoal(goalText, guidance.length);
      setGuidance(prev => [...prev, ...additionalVerses]);
    } catch (error) {
      console.error('Failed to load additional guidance:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAudioToggle = async (index: number) => {
    const audioRef = audioRefs.current[index];
    if (!audioRef) return;

    try {
      const currentState = audioStates[index];
      if (currentState?.isPlaying) {
        audioRef.pause();
        setAudioStates(prev => ({
          ...prev,
          [index]: { ...prev[index], isPlaying: false }
        }));
      } else {
        setAudioStates(prev => ({
          ...prev,
          [index]: { ...prev[index], isLoading: true, error: null }
        }));
        
        // Reset audio to beginning and play
        audioRef.currentTime = 0;
        await audioRef.play();
        setAudioStates(prev => ({
          ...prev,
          [index]: { ...prev[index], isPlaying: true, isLoading: false }
        }));
      }
    } catch (error) {
      logger.error('Error playing audio', error, 'SmartGuidance.handleAudioToggle');
      setAudioStates(prev => ({
        ...prev,
        [index]: { 
          ...prev[index], 
          isPlaying: false, 
          isLoading: false, 
          error: 'Audio playback failed. Please try again.' 
        }
      }));
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setAudioStates(prev => ({
          ...prev,
          [index]: { ...prev[index], error: null }
        }));
      }, 5000);
    }
  };

  const handleAudioEnded = (index: number) => {
    setAudioStates(prev => ({
      ...prev,
      [index]: { ...prev[index], isPlaying: false }
    }));
  };

  const handleAudioError = (index: number) => {
    setAudioStates(prev => ({
      ...prev,
      [index]: { 
        ...prev[index], 
        isPlaying: false, 
        isLoading: false, 
        error: 'Audio failed to load. Please try again.' 
      }
    }));
    
    // Clear error after 5 seconds
    setTimeout(() => {
      setAudioStates(prev => ({
        ...prev,
        [index]: { ...prev[index], error: null }
      }));
    }, 5000);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
        <div className="animate-pulse">
          <div className="h-4 bg-green-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-green-100 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (guidance.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
        <p className="text-green-700 text-sm mb-4">
          While we're preparing personalized guidance for your goal, here are some universal Islamic principles to remember:
        </p>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 border-l-4 border-green-400">
            <p className="text-sm text-green-600">
              <strong>Start with Bismillah:</strong> Begin every endeavor in the name of Allah
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border-l-4 border-green-400">
            <p className="text-sm text-green-600">
              <strong>Make sincere dua:</strong> Ask Allah for guidance and success in your goal
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border-l-4 border-green-400">
            <p className="text-sm text-green-600">
              <strong>Trust in Allah:</strong> "And whoever relies upon Allah - then He is sufficient for him" (65:3)
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border-l-4 border-green-400">
            <p className="text-sm text-green-600">
              <strong>Take action:</strong> Combine faith with effort - Allah helps those who help themselves
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {guidance.map((match, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-100 overflow-hidden"
        >
          <div className="p-4">
            {/* Audio element */}
            {match.verse.audio && (
              <audio
                ref={(el) => { audioRefs.current[index] = el; }}
                src={match.verse.audio}
                onEnded={() => handleAudioEnded(index)}
                onError={() => handleAudioError(index)}
                preload="metadata"
                playsInline
                controls={false}
                crossOrigin="anonymous"
              />
            )}

            {/* Verse Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-green-700">
                {match.verse.surah} ({match.verse.surah_number}:{match.verse.ayah})
              </div>
              <div className="flex items-center gap-2">
                {/* Audio Button */}
                {match.verse.audio ? (
                  <button
                    onClick={() => handleAudioToggle(index)}
                    disabled={audioStates[index]?.isLoading}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      audioStates[index]?.isPlaying
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                    } ${audioStates[index]?.isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={audioStates[index]?.isPlaying ? "Pause verse recitation" : "Play verse recitation"}
                  >
                    {audioStates[index]?.isLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : audioStates[index]?.isPlaying ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                ) : null}
                <button
                  onClick={() => handleToggleExpand(index)}
                  className="text-green-600 hover:text-green-700"
                >
                  {expanded === index ? '−' : '+'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {audioStates[index]?.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-red-700">{audioStates[index]?.error}</p>
                </div>
              </motion.div>
            )}

            {/* Arabic Text */}
            <div className="text-right mb-3">
              <p className="text-lg text-gray-800 font-arabic leading-relaxed">
                {match.verse.text_ar}
              </p>
            </div>

            {/* English Translation */}
            <div className="mb-4">
              <p className="text-gray-700 italic leading-relaxed">
                "{match.verse.text_en}"
              </p>
            </div>

            {/* Reflection */}
            <div className="mb-4 p-3 bg-white rounded-lg border-l-4 border-green-400">
              <p className="text-sm text-gray-700">
                <strong className="text-green-700">How this applies to your goal: </strong>
                {match.verse.reflection}
              </p>
            </div>

            {/* Expanded Content */}
            {expanded === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >


              </motion.div>
            )}


          </div>
        </motion.div>
      ))}

      {/* Load More Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingMore ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Load More Guidance
            </span>
          )}
        </button>
      </div>


    </div>
  );
} 