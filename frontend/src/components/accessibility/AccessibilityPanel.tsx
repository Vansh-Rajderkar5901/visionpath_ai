'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Repeat,
  Gauge,
  AudioLines,
  Languages,
  X,
  Accessibility,
} from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { cn } from '@/lib/utils';

/**
 * Floating accessibility control panel. Keyboard accessible:
 *  - Tab to reach the toggle button, Enter/Space to open it.
 *  - Inside the panel, Tab cycles through controls, Escape closes it.
 *
 * Controls:
 *  - Voice ON/OFF (master switch)
 *  - Mute announcements
 *  - Repeat last announcement
 *  - Speech speed slider (drives the persisted voiceSpeed preference)
 *  - Volume slider
 *  - Voice selection (from the browser's speechSynthesis voices)
 */
export function AccessibilityPanel() {
  const { speech, setSpeech, repeatLast, availableVoices, voiceSupported, announce } = useVoice();
  const { preferences, updatePreferences } = useAccessibility();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Announce panel open/close.
  useEffect(() => {
    if (open) {
      announce('Accessibility panel opened. Use tab to navigate the speech controls.', { force: true });
    } else {
      announce('Accessibility panel closed.', { force: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close the panel on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        // Return focus to the toggle button.
        const toggle = document.getElementById('accessibility-panel-toggle');
        toggle?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Keep focus within the panel while open (simple trap).
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) {
      firstFocusableRef.current?.focus();
    }
  }, [open]);

  const handleToggleEnabled = () => {
    const next = !speech.enabled;
    setSpeech({ enabled: next });
    if (next) {
      announce('Voice guidance enabled.', { force: true });
    } else {
      announce('Voice guidance disabled.', { force: true });
    }
  };

  const handleToggleMute = () => {
    const next = !speech.muted;
    setSpeech({ muted: next });
    if (next) {
      // Cannot speak when muted, so just show state.
      // (announce is suppressed by mute internally)
      announce(`Announcements muted.`, { force: true });
    } else {
      announce('Announcements unmuted.', { force: true });
    }
  };

  const handleRepeat = () => {
    repeatLast();
  };

  const handleSpeed = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updatePreferences({ voiceSpeed: val });
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSpeech({ volume: val });
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    setSpeech({ selectedVoiceIndex: idx });
    if (availableVoices[idx]) {
      announce(`Voice selected: ${availableVoices[idx].name}.`, { force: true });
    }
  };

  const toggleButton = (
    <button
      id="accessibility-panel-toggle"
      onClick={() => setOpen(!open)}
      className={cn(
        'fixed bottom-6 left-6 z-[9998] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300',
        open
          ? 'bg-primary-700 text-white'
          : 'bg-gradient-to-br from-primary-600 to-accent-600 text-white hover:shadow-primary-500/40'
      )}
      aria-label={open ? 'Close accessibility panel' : 'Open accessibility panel'}
      aria-expanded={open}
      aria-controls="accessibility-panel"
    >
      {open ? <X className="w-6 h-6" /> : <Accessibility className="w-6 h-6" />}
    </button>
  );

  return (
    <>
      {toggleButton}

      <AnimatePresence>
        {open && (
          <motion.div
            id="accessibility-panel"
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 z-[9998] w-[340px] max-w-[calc(100vw-32px)] bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border overflow-hidden"
            role="dialog"
            aria-label="Accessibility and speech controls"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <AudioLines className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Accessibility</p>
                  <p className="text-xs text-gray-500">Speech & screen reader</p>
                </div>
              </div>
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                speech.enabled && !speech.muted
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              )}>
                {speech.enabled && !speech.muted ? 'Voice on' : speech.muted ? 'Muted' : 'Off'}
              </span>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Master toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {speech.enabled ? <Mic className="w-4 h-4 text-primary-500" /> : <MicOff className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm font-medium">Voice Guidance</span>
                </div>
                <button
                  ref={firstFocusableRef}
                  onClick={handleToggleEnabled}
                  role="switch"
                  aria-checked={speech.enabled}
                  aria-label="Toggle voice guidance"
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    speech.enabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-border'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform',
                    speech.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  )} />
                </button>
              </div>

              {/* Mute */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {speech.muted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-primary-500" />}
                  <span className="text-sm font-medium">Mute Announcements</span>
                </div>
                <button
                  onClick={handleToggleMute}
                  role="switch"
                  aria-checked={speech.muted}
                  aria-label="Toggle mute announcements"
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    speech.muted ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-border'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform',
                    speech.muted ? 'translate-x-6' : 'translate-x-0.5'
                  )} />
                </button>
              </div>

              {/* Repeat last */}
              <button
                onClick={handleRepeat}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
              >
                <Repeat className="w-4 h-4" />
                Repeat Last Announcement
              </button>

              <div className="border-t border-gray-200 dark:border-dark-border pt-4 space-y-4">
                {/* Speed */}
                <div>
                  <label className="text-sm text-gray-500 mb-1 block flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Speech Speed: {preferences.voiceSpeed?.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.25"
                    value={preferences.voiceSpeed || 1}
                    onChange={handleSpeed}
                    className="w-full accent-primary-500"
                    aria-label="Speech speed"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>

                {/* Volume */}
                <div>
                  <label className="text-sm text-gray-500 mb-1 block flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Volume: {Math.round((speech.volume ?? 1) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={speech.volume ?? 1}
                    onChange={handleVolume}
                    className="w-full accent-primary-500"
                    aria-label="Volume"
                  />
                </div>

                {/* Voice selection */}
                {voiceSupported && availableVoices.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Voice
                    </label>
                    <select
                      value={speech.selectedVoiceIndex}
                      onChange={handleVoiceChange}
                      className="w-full text-sm bg-gray-50 dark:bg-dark-border border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Select voice"
                    >
                      <option value={-1}>Default voice</option>
                      {availableVoices.map((v, i) => (
                        <option key={v.name + i} value={i}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-border/40">
              <p className="text-xs text-gray-500">
                Press <kbd className="px-1 py-0.5 bg-white dark:bg-dark-card rounded border border-gray-200 dark:border-dark-border">Escape</kbd> to close. All controls are keyboard accessible.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
