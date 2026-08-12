'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  Settings,
  List,
  Command,
  Sparkles,
  ChevronRight,
  Play,
  Pause,
  Loader2,
  Globe,
  Sliders,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { cn } from '@/lib/utils';

const exampleCommands = [
  { command: 'Take me to Lab 204', description: 'Navigate to any room' },
  { command: 'Guide me to Principal Office', description: 'Get directions' },
  { command: 'Read this notice', description: 'OCR text reading' },
  { command: 'Where is the nearest washroom?', description: 'Find facilities' },
  { command: 'Call security', description: 'Emergency contacts' },
  { command: 'Open profile', description: 'Navigate pages' },
  { command: 'Navigate to Library', description: 'Indoor navigation' },
  { command: 'Help', description: 'Available commands' },
];

export default function VoicePage() {
  const {
    isListening,
    isSpeaking,
    transcript,
    response,
    startListening,
    stopListening,
    stopSpeaking,
    continuousMode,
    toggleContinuousMode,
  } = useVoice();
  const { preferences, updatePreferences } = useAccessibility();
  const [showCommands, setShowCommands] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Voice Assistant</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Control VisionPath with natural voice commands
          </p>
        </div>
        <button
          onClick={() => setShowCommands(!showCommands)}
          className="btn-secondary text-sm"
        >
          <List className="w-4 h-4 mr-2" />
          Commands
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Voice Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voice Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-center"
          >
            {/* Voice Button */}
            <div className="relative inline-block mb-6">
              <button
                onClick={isListening ? stopListening : startListening}
                className={cn(
                  'w-32 h-32 rounded-full transition-all duration-500 flex items-center justify-center',
                  isListening
                    ? 'bg-gradient-to-br from-primary-500 to-accent-500 scale-110 shadow-2xl shadow-primary-500/40'
                    : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-dark-border dark:to-dark-card hover:scale-105 shadow-lg'
                )}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
              >
                {isListening ? (
                  <div className="relative">
                    <Mic className="w-12 h-12 text-white" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-accent-500" />
                    </span>
                  </div>
                ) : (
                  <MicOff className="w-12 h-12 text-gray-400" />
                )}
              </button>

              {isListening && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, Math.random() * 32 + 8, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1.5 bg-primary-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>

            <p className="text-lg font-semibold mb-2">
              {isListening ? 'Listening...' : 'Tap to speak'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {isListening
                ? 'Speak a command clearly'
                : 'Press the button and speak your command'}
            </p>

            {/* Transcript */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gray-50 dark:bg-dark-border mb-4"
              >
                <p className="text-sm text-gray-500 mb-1">You said:</p>
                <p className="font-medium">{transcript}</p>
              </motion.div>
            )}

            {/* Response */}
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/30"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-gray-500 mb-1">Response:</p>
                    <p className="text-sm font-medium text-primary-800 dark:text-primary-200">{response}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={toggleContinuousMode}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  continuousMode
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-100 dark:bg-dark-border text-gray-500'
                )}
              >
                {continuousMode ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                Continuous Mode
              </button>

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-border text-sm font-medium"
                >
                  <Pause className="w-4 h-4" />
                  Stop Speaking
                </button>
              )}
            </div>
          </motion.div>

          {/* Command Grid */}
          {showCommands && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
            >
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Command className="w-5 h-5 text-primary-500" />
                Example Commands
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {exampleCommands.map((cmd) => (
                  <button
                    key={cmd.command}
                    onClick={() => {
                      // You could trigger processing of this command
                      if (window.SpeechRecognition || window.webkitSpeechRecognition) {
                        // Use the voice context to process
                      }
                    }}
                    className="text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                  >
                    <p className="font-medium text-sm">&ldquo;{cmd.command}&rdquo;</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cmd.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
          >
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary-500" />
              Voice Settings
            </h2>
            <div className="space-y-4">
              {/* Language */}
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Language</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-dark-border">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <select
                    value={preferences.language}
                    onChange={(e) => updatePreferences({ language: e.target.value })}
                    className="bg-transparent w-full text-sm focus:outline-none"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </div>

              {/* Voice Speed */}
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Voice Speed: {preferences.voiceSpeed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.25"
                  value={preferences.voiceSpeed}
                  onChange={(e) => updatePreferences({ voiceSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-primary-500"
                  aria-label="Voice speed"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* TTS Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Text-to-Speech</span>
                <button
                  onClick={() => updatePreferences({ textToSpeech: !preferences.textToSpeech })}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    preferences.textToSpeech ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-border'
                  )}
                  aria-label="Toggle text-to-speech"
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform',
                    preferences.textToSpeech ? 'translate-x-6' : 'translate-x-0.5'
                  )} />
                </button>
              </div>

              {/* Voice Commands */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Voice Commands</span>
                <button
                  onClick={() => updatePreferences({ voiceCommands: !preferences.voiceCommands })}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    preferences.voiceCommands ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-border'
                  )}
                  aria-label="Toggle voice commands"
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform',
                    preferences.voiceCommands ? 'translate-x-6' : 'translate-x-0.5'
                  )} />
                </button>
              </div>

              {/* Audio Feedback */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Audio Feedback</span>
                <button
                  onClick={() => updatePreferences({ audioFeedback: !preferences.audioFeedback })}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    preferences.audioFeedback ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-border'
                  )}
                  aria-label="Toggle audio feedback"
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform',
                    preferences.audioFeedback ? 'translate-x-6' : 'translate-x-0.5'
                  )} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
          >
            <h2 className="font-semibold mb-3">Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Listening</span>
                <span className={cn(
                  'font-medium',
                  isListening ? 'text-green-600' : 'text-gray-400'
                )}>
                  {isListening ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Speaking</span>
                <span className={cn(
                  'font-medium',
                  isSpeaking ? 'text-green-600' : 'text-gray-400'
                )}>
                  {isSpeaking ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Continuous Mode</span>
                <span className={cn(
                  'font-medium',
                  continuousMode ? 'text-green-600' : 'text-gray-400'
                )}>
                  {continuousMode ? 'On' : 'Off'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Browser Support</span>
                <span className="font-medium text-green-600">
                  {typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
                    ? 'Supported'
                    : 'Not supported'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

