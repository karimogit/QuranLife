'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';

interface FullscreenVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  arabicText: string;
  englishText: string;
  transliterationText?: string;
  surahInfo: string;
  audioUrl?: string;
  reflection?: string;
}

type TextDisplayMode = 'english' | 'phonetic';

export default function FullscreenVerseModal({
  isOpen,
  onClose,
  arabicText,
  englishText,
  transliterationText,
  surahInfo,
  audioUrl,
  reflection
}: FullscreenVerseModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textDisplayMode, setTextDisplayMode] = useState<TextDisplayMode>('english');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Stop audio when modal closes
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isOpen]);

  const handleAudioToggle = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        
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

        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 fullscreen-verse-backdrop"
          onClick={onClose}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900" />
          
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          {/* Audio element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnded}
              preload="metadata"
              playsInline
            />
          )}

          {/* Content container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative h-full flex flex-col items-center justify-center p-6 md:p-12 fullscreen-verse-content overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all group"
              aria-label="Close fullscreen view"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Surah info */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 md:mb-8"
            >
              <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm md:text-base font-medium border border-emerald-500/30">
                {surahInfo}
              </span>
            </motion.div>

            {/* Arabic text - LARGE */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`max-w-5xl text-center mb-8 md:mb-12 ${isPlaying ? 'arabic-playing' : ''}`}
            >
              <p
                className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-relaxed md:leading-loose text-white font-arabic fullscreen-verse-text"
                dir="rtl"
              >
                {arabicText}
              </p>
            </motion.div>

            {/* Toggle for English/Phonetic */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center justify-center gap-1 mb-4"
            >
              <button
                onClick={() => setTextDisplayMode('english')}
                className={`px-4 py-2 text-sm font-medium rounded-l-full transition-all ${
                  textDisplayMode === 'english'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setTextDisplayMode('phonetic')}
                className={`px-4 py-2 text-sm font-medium rounded-r-full transition-all ${
                  textDisplayMode === 'phonetic'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Phonetic
              </button>
            </motion.div>

            {/* Translation or transliteration */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-3xl text-center mb-8"
            >
              <p className="text-lg md:text-2xl lg:text-3xl text-white/80 italic leading-relaxed">
                {textDisplayMode === 'phonetic' && transliterationText
                  ? transliterationText
                  : `"${englishText}"`}
              </p>
            </motion.div>

            {/* Reflection */}
            {reflection && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="max-w-2xl text-center mb-8"
              >
                <p className="text-sm md:text-base text-emerald-300/70 leading-relaxed">
                  <span className="font-medium text-emerald-300">Reflection: </span>
                  {reflection}
                </p>
              </motion.div>
            )}

            {/* Audio controls */}
            {audioUrl && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={handleAudioToggle}
                  disabled={isLoading}
                  className={`flex items-center gap-3 px-8 py-4 rounded-full text-lg font-medium transition-all ${
                    isPlaying
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                      </svg>
                      <span>Pause Recitation</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <span>Listen to Recitation</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Keyboard hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-4 md:bottom-8 text-white/40 text-xs md:text-sm"
            >
              Press <kbd className="px-2 py-1 bg-white/10 rounded text-white/60">ESC</kbd> or click outside to close
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
