'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import FullscreenVerseModal from './FullscreenVerseModal';

interface Verse {
  id: number;
  surah: string;
  surah_number: number;
  ayah: number;
  text_ar: string;
  text_en: string;
  text_transliteration?: string; // Phonetic/transliteration text
  theme: string[];
  reflection: string;
  audio?: string; // Audio URL for the verse
}

interface VerseCardProps {
  verse: Verse;
}

type TextDisplayMode = 'english' | 'phonetic';

export default function VerseCard({ verse }: VerseCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [textDisplayMode, setTextDisplayMode] = useState<TextDisplayMode>('english');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate audio URL - use from verse data or return undefined
  const getAudioUrl = () => {
    if (verse.audio && verse.audio.trim().length > 0) return verse.audio;
    if (verse.surah_number && verse.ayah) {
      return `/api/audio?surah=${verse.surah_number}&ayah=${verse.ayah}&edition=ar.alafasy`;
    }
    return undefined;
  };

  const audioUrl = getAudioUrl();

  const handleAudioToggle = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        
        // Mobile-specific: Ensure audio is loaded before playing
        if (audioRef.current.readyState < 3) {
          audioRef.current.load();
          await new Promise((resolve, reject) => {
            const handleCanPlay = () => {
              audioRef.current?.removeEventListener('canplay', handleCanPlay);
              audioRef.current?.removeEventListener('error', handleError);
              resolve(undefined);
            };
            const handleError = () => {
              audioRef.current?.removeEventListener('canplay', handleCanPlay);
              audioRef.current?.removeEventListener('error', handleError);
              reject(new Error('Failed to load audio'));
            };
            audioRef.current?.addEventListener('canplay', handleCanPlay);
            audioRef.current?.addEventListener('error', handleError);
          });
        }

        // Reset audio to beginning and play
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
        setAudioError(null); // Clear any previous errors
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
      setIsPlaying(false);
      
      // Mobile-friendly error handling
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setAudioError(isMobile ? 
            'Please enable audio permissions in your browser settings and try again.' : 
            'Audio play was prevented - user interaction required'
          );
        } else if (error.name === 'NotSupportedError') {
          setAudioError(isMobile ? 
            'Audio format not supported on your device. Please try using a different browser.' : 
            'Audio format not supported on this device'
          );
        } else if (error.name === 'AbortError') {
          setAudioError('Audio playback was interrupted. Please try again.');
        } else {
          setAudioError(isMobile ? 
            'Audio playback failed. Please check your internet connection and try again.' : 
            'Audio playback failed. Please try again.'
          );
        }
      } else {
        setAudioError('An unexpected error occurred during audio playback.');
      }
      
      // Clear error after 5 seconds
      setTimeout(() => setAudioError(null), 5000);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Audio failed to load');
      console.error('Audio URL:', audioUrl);
      console.error('Audio readyState:', audioRef.current?.readyState);
      console.error('Audio error:', audioRef.current?.error);
    }
    
    setIsLoading(false);
    setIsPlaying(false);
    
    if (isMobile) {
      setAudioError('Audio may require Wi-Fi or mobile data. Please check your connection and try again.');
    } else {
      setAudioError(`Audio failed to load. URL: ${audioUrl ? audioUrl.slice(-30) : 'No URL provided'}`);
    }
    
    // Clear error after 5 seconds
    setTimeout(() => setAudioError(null), 5000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-xl p-6 border border-green-100/50 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
    >
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="metadata"
        playsInline
        controls={false}
        crossOrigin="anonymous"
      />

      {/* Decorative corner elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-100/30 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full translate-y-8 -translate-x-8"></div>
      
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h4 className="text-sm font-medium text-green-700">
          {verse.surah} ({verse.surah_number}:{verse.ayah})
        </h4>
        
        <div className="flex items-center gap-2">
          {/* Fullscreen button */}
          <button
            onClick={() => setIsFullscreen(true)}
            aria-label="View verse fullscreen"
            className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 transition-all touch-manipulation"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          {/* Audio controls */}
          {audioUrl ? (
            <button
              onClick={handleAudioToggle}
              onTouchStart={() => {}}
              disabled={isLoading}
              aria-label={isPlaying ? "Pause verse recitation" : "Play verse recitation"}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 touch-manipulation ${
                isPlaying
                  ? 'bg-green-500 text-white shadow-md hover:bg-green-600 active:bg-green-700'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              {isLoading ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Loading...</span>
                </>
              ) : isPlaying ? (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                  </svg>
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="hidden sm:inline">Listen</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
              Audio not available for this verse
            </div>
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {audioError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{audioError}</p>
          </div>
        </motion.div>
      )}

      <div className="text-center mb-6 relative z-10">
        <p 
          className="text-xl leading-relaxed text-gray-800 mb-4 font-arabic"
          dir="rtl"
        >
          {verse.text_ar}
        </p>
        
        {/* Toggle for English/Phonetic */}
        <div className="flex items-center justify-center gap-1 py-2">
          <button
            onClick={() => setTextDisplayMode('english')}
            className={`px-3 py-1 text-xs font-medium rounded-l-full transition-all ${
              textDisplayMode === 'english'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setTextDisplayMode('phonetic')}
            className={`px-3 py-1 text-xs font-medium rounded-r-full transition-all ${
              textDisplayMode === 'phonetic'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Phonetic
          </button>
        </div>

        <p className="text-gray-600 leading-relaxed italic">
          {textDisplayMode === 'phonetic' && verse.text_transliteration
            ? verse.text_transliteration
            : `"${verse.text_en}"`}
        </p>
      </div>

      <div className="border-t border-green-200 pt-4 relative z-10">
        <p className="text-sm text-gray-700 leading-relaxed">
          {verse.reflection}
        </p>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenVerseModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        arabicText={verse.text_ar}
        englishText={verse.text_en}
        transliterationText={verse.text_transliteration}
        surahInfo={`${verse.surah} (${verse.surah_number}:${verse.ayah})`}
        audioUrl={audioUrl}
        reflection={verse.reflection}
      />
    </motion.div>
  );
} 