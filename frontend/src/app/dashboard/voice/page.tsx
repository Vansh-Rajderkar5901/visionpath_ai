'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Command,
  List,
  Loader2,
  MapPin,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { voiceService } from '@/services/voice';
import { cn } from '@/lib/utils';

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
    processCommand,
    isProcessing,
    lastResult,
    currentNode,
    recognitionSupported,
  } = useVoice();

  const [showCommands, setShowCommands] = useState(true);
  const [typedCommand, setTypedCommand] = useState('');

  const { data: commandInfo } = useQuery({
    queryKey: ['voice-commands'],
    queryFn: () => voiceService.getExamples(),
    staleTime: 30 * 60 * 1000,
  });

  const handleTypedSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = typedCommand.trim();
    if (!text) return;
    setTypedCommand('');
    void processCommand(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 flex-wrap"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Voice Assistant</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Control VisionPath with natural voice commands
          </p>
        </div>
        <button
          onClick={() => setShowCommands(!showCommands)}
          className="btn-secondary text-sm flex items-center gap-2"
          aria-expanded={showCommands}
        >
          <List className="w-4 h-4" />
          Commands
        </button>
      </motion.div>

      {!recognitionSupported && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Speech recognition is not available in this browser
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
              Chrome or Edge support it. You can still type commands below and the assistant
              will answer out loud.
            </p>
          </div>
        </div>
      )}

      {!currentNode && (
        <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-900/30 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary-800 dark:text-primary-200">
            Set your current location on the Indoor Navigation page and the assistant will give
            you a full walking route instead of just finding the room.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Mic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-center"
          >
            <div className="relative inline-block mb-6">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={!recognitionSupported}
                className={cn(
                  'w-32 h-32 rounded-full transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed',
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
                  {Array.from({ length: 8 }).map((_, index) => (
                    <motion.div
                      key={index}
                      animate={{ height: [4, 24, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: index * 0.1 }}
                      className="w-1.5 bg-primary-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {isListening
                ? 'Listening — speak your command'
                : isProcessing
                  ? 'Thinking...'
                  : 'Tap the microphone or type a command below'}
            </p>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={toggleContinuousMode}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  continuousMode
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-200 dark:bg-dark-border text-gray-500'
                )}
              >
                {continuousMode ? 'Continuous listening on' : 'Tap to speak'}
              </button>
              {isSpeaking && (
                <button onClick={stopSpeaking} className="btn-secondary text-xs py-1.5">
                  <Volume2 className="w-3.5 h-3.5 mr-1.5" />
                  Stop speaking
                </button>
              )}
            </div>

            {/* Typed fallback — also the accessible path when the mic is blocked */}
            <form onSubmit={handleTypedSubmit} className="mt-6 flex gap-2">
              <input
                type="text"
                value={typedCommand}
                onChange={(event) => setTypedCommand(event.target.value)}
                placeholder='Type a command, e.g. "take me to BS-17A"'
                className="input-field flex-1"
                aria-label="Type a voice command"
              />
              <button
                type="submit"
                disabled={isProcessing || !typedCommand.trim()}
                className="btn-primary px-4 disabled:opacity-50"
                aria-label="Send command"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </motion.div>

          {/* Transcript + response */}
          {(transcript || response) && (
            <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border space-y-3">
              {transcript && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    You said
                  </p>
                  <p className="text-sm mt-1">{transcript}</p>
                </div>
              )}
              {response && (
                <div aria-live="polite">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Assistant
                  </p>
                  <p className="text-sm mt-1 text-primary-800 dark:text-primary-200">
                    {response}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Route from the last command */}
          {lastResult?.route && (
            <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
              <h2 className="font-semibold mb-3">
                Route to {lastResult.route.end.name} — {lastResult.route.distance} m
              </h2>
              <ol className="space-y-2 list-decimal list-inside text-sm">
                {lastResult.route.instructions.map((instruction, index) => (
                  <li key={index}>{instruction.text}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Suggestions when the assistant was unsure */}
          {(lastResult?.matches.length ?? 0) > 0 && !lastResult?.route && (
            <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
              <h2 className="font-semibold mb-3">Did you mean</h2>
              <div className="flex flex-wrap gap-2">
                {lastResult?.matches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => processCommand(`take me to ${match.name}`)}
                    className="px-3 py-1.5 rounded-full text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100"
                  >
                    {match.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Command list */}
        {showCommands && (
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border h-fit"
          >
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Command className="w-5 h-5 text-primary-500" />
              Try saying
            </h2>
            <div className="space-y-3">
              {commandInfo?.examples.map((example) => (
                <button
                  key={example.command}
                  onClick={() => processCommand(example.command)}
                  className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-dark-border/40 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                    &ldquo;{example.command}&rdquo;
                  </p>
                  <p className="text-xs text-gray-500 mt-1 ml-6">{example.description}</p>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </div>
    </div>
  );
}
