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
  const [expanded, setExpanded] = useState<number | null>(null); // No items expanded by default
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


  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const goalText = `${goalTitle} ${goalDescription} ${goalCategory}`.trim();
      const additionalVerses = await quranEngine.getAdditionalVersesForGoal(goalText, guidance.length);
      
      // Filter out duplicates by checking verse ID and surah:ayah combination
      const existingIds = new Set(guidance.map(g => g.verse.id));
      const existingSurahAyah = new Set(guidance.map(g => `${g.verse.surah_number}:${g.verse.ayah}`));
      
      const uniqueAdditionalVerses = additionalVerses.filter(verse => 
        !existingIds.has(verse.verse.id) && 
        !existingSurahAyah.has(`${verse.verse.surah_number}:${verse.verse.ayah}`)
      );
      
      setGuidance(prev => [...prev, ...uniqueAdditionalVerses]);
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
      <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-xl p-8 border border-green-100/50 shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-100/40 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-100/40 to-transparent rounded-full translate-y-10 -translate-x-10"></div>
        
        <div className="relative z-10 text-center">
          <div className="text-4xl mb-4">📖</div>
          <h3 className="text-lg font-semibold text-green-700 mb-3">
            Preparing Your Personalized Guidance
          </h3>
          <p className="text-green-600 text-sm mb-6">
            While we're finding the perfect Quranic guidance for your goal, here are some universal Islamic principles to remember:
          </p>
        </div>
        
        <div className="space-y-4 relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-green-400 shadow-sm">
            <p className="text-sm text-green-700">
              <strong className="text-green-800">Start with Bismillah:</strong> Begin every endeavor in the name of Allah
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-green-400 shadow-sm">
            <p className="text-sm text-green-700">
              <strong className="text-green-800">Make sincere dua:</strong> Ask Allah for guidance and success in your goal
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-green-400 shadow-sm">
            <p className="text-sm text-green-700">
              <strong className="text-green-800">Trust in Allah:</strong> "And whoever relies upon Allah - then He is sufficient for him" (65:3)
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-green-400 shadow-sm">
            <p className="text-sm text-green-700">
              <strong className="text-green-800">Take action:</strong> Combine faith with effort - Allah helps those who help themselves
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Guidance count indicator */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {guidance.length} Quranic guidance{guidance.length !== 1 ? 's' : ''} found
        </div>
      </div>
      
      {guidance.map((match, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-xl border border-green-100/50 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden hover:scale-[1.02] hover:border-green-200"
        >
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-100/30 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="p-6 relative z-10">
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
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                {match.verse.surah} ({match.verse.surah_number}:{match.verse.ayah})
              </div>
              <div className="flex items-center gap-3">
                {/* Audio Button */}
                {match.verse.audio ? (
                  <button
                    onClick={() => handleAudioToggle(index)}
                    disabled={audioStates[index]?.isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      audioStates[index]?.isPlaying
                        ? 'bg-green-500 text-white shadow-md hover:bg-green-600'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } ${audioStates[index]?.isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={audioStates[index]?.isPlaying ? "Pause verse recitation" : "Play verse recitation"}
                  >
                    {audioStates[index]?.isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading...</span>
                      </>
                    ) : audioStates[index]?.isPlaying ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                        </svg>
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                ) : null}
              </div>
            </div>

            {/* Error Message */}
            {audioStates[index]?.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">{audioStates[index]?.error}</p>
                </div>
              </motion.div>
            )}

            {/* Arabic Text */}
            <div className="text-center mb-6 relative z-10">
              <p className="text-xl leading-relaxed text-gray-800 mb-4 font-arabic" dir="rtl">
                {match.verse.text_ar}
              </p>
              <p className="text-gray-600 leading-relaxed italic">
                "{match.verse.text_en}"
              </p>
            </div>

            {/* Reflection */}
            <div className="border-t border-green-200 pt-4 relative z-10">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-green-700">How this applies to your goal: </strong>
                {match.verse.reflection}
              </p>
            </div>



          </div>
        </motion.div>
      ))}

      {/* Load More Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {loadingMore ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">Loading more guidance...</span>
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium">Load More Guidance</span>
            </span>
          )}
        </button>
      </div>


    </div>
  );
} 