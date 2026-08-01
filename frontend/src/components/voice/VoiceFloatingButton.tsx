'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, X, Sparkles } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { cn } from '@/lib/utils';

export function VoiceFloatingButton() {
  const {
    isListening,
    isSpeaking,
    transcript,
    response,
    startListening,
    stopListening,
    continuousMode,
    toggleContinuousMode,
  } = useVoice();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            startListening();
          } else {
            stopListening();
          }
        }}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300',
          isListening
            ? 'bg-gradient-to-r from-primary-500 to-accent-500 animate-pulse'
            : 'bg-gradient-to-r from-primary-600 to-accent-600 hover:shadow-primary-500/30',
          'hover:shadow-xl'
        )}
        aria-label={isListening ? 'Stop voice assistant' : 'Start voice assistant'}
      >
        {isListening ? (
          <div className="relative">
            <Mic className="w-7 h-7 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-500" />
            </div>
          </div>
        ) : (
          <MicOff className="w-7 h-7 text-white" />
        )}
      </motion.button>

      {/* Voice Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-32px)] bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  isListening ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-dark-border'
                )}>
                  <Sparkles className={cn(
                    'w-4 h-4',
                    isListening ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                  )} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Voice Assistant</p>
                  <p className="text-xs text-gray-500">
                    {isListening ? 'Listening...' : 'Tap to speak'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                aria-label="Close voice panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Indicator */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-dark-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                )} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {isListening ? 'Voice active' : 'Voice inactive'}
                </span>
              </div>
              <button
                onClick={toggleContinuousMode}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  continuousMode
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-200 dark:bg-dark-border text-gray-500'
                )}
              >
                {continuousMode ? 'Continuous' : 'Tap to speak'}
              </button>
            </div>

            {/* Transcript */}
            <div className="p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
              {transcript ? (
                <p className="text-sm text-gray-800 dark:text-gray-200">{transcript}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  {isListening ? 'Listening for commands...' : 'Press the button and speak a command'}
                </p>
              )}
            </div>

            {/* Response */}
            {response && (
              <div className="px-4 pb-4">
                <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/30">
                  <p className="text-sm text-primary-800 dark:text-primary-200">{response}</p>
                </div>
              </div>
            )}

            {/* Voice Waveform */}
            {isListening && (
              <div className="px-4 pb-4 flex items-center justify-center gap-0.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [4, Math.random() * 24 + 8, 4],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                    className="w-1 bg-primary-400 dark:bg-primary-600 rounded-full"
                  />
                ))}
              </div>
            )}

            {/* Help Text */}
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-400">
                Try saying: &ldquo;Take me to Lab 204&rdquo; or &ldquo;Help&rdquo;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

