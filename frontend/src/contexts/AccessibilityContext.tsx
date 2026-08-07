'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AccessibilityMode, UserPreferences } from '@/types';
import { useAuth } from './AuthContext';

interface AccessibilityContextType {
  mode: AccessibilityMode;
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  updateMode: (mode: AccessibilityMode) => void;
  isHighContrast: boolean;
  isLargeText: boolean;
  isReducedMotion: boolean;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  fontSize: 'normal',
  voiceSpeed: 1,
  language: 'en',
  highContrast: false,
  reducedMotion: false,
  screenReaderOptimized: false,
  voiceNavigation: false,
  textToSpeech: false,
  voiceCommands: false,
  largeTouchTargets: false,
  audioFeedback: false,
  magnifierReady: false,
  continuousListening: false,
};

const modeDefaults: Record<AccessibilityMode, Partial<UserPreferences>> = {
  'visually-impaired': {
    screenReaderOptimized: true,
    voiceNavigation: true,
    textToSpeech: true,
    voiceCommands: true,
    largeTouchTargets: true,
    highContrast: true,
    audioFeedback: true,
    fontSize: 'x-large',
  },
  'low-vision': {
    fontSize: 'large',
    highContrast: true,
    voiceNavigation: true,
    textToSpeech: true,
    voiceCommands: true,
    magnifierReady: true,
    theme: 'dark',
  },
  'standard': {
    fontSize: 'normal',
    highContrast: false,
    voiceNavigation: false,
    textToSpeech: false,
    voiceCommands: false,
    theme: 'system',
  },
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { user, updateProfile } = useAuth();
  const [mode, setMode] = useState<AccessibilityMode>('standard');
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    if (user) {
      setMode(user.accessibilityMode);
      setPreferences({
        ...defaultPreferences,
        ...modeDefaults[user.accessibilityMode],
        ...user.preferences,
      });
    }
  }, [user]);

  useEffect(() => {
    // Apply preferences to DOM
    const root = document.documentElement;

    // Theme
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // High Contrast
    root.classList.toggle('high-contrast', preferences.highContrast);

    // Large Touch Targets
    root.classList.toggle('large-touch-target', preferences.largeTouchTargets);

    // Font Size
    root.style.fontSize = preferences.fontSize === 'large' ? '18px' : preferences.fontSize === 'x-large' ? '22px' : '16px';

    // Reduced Motion
    if (preferences.reducedMotion) {
      root.style.setProperty('--reduce-motion', 'reduce');
    } else {
      root.style.setProperty('--reduce-motion', 'no-preference');
    }

    // Screen Reader Optimization
    if (preferences.screenReaderOptimized) {
      root.setAttribute('aria-screen-reader-optimized', 'true');
    } else {
      root.removeAttribute('aria-screen-reader-optimized');
    }
  }, [preferences]);

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...prefs };
    setPreferences(updated);
    if (user) {
      await updateProfile({ preferences: updated });
    }
  };

  const updateMode = async (newMode: AccessibilityMode) => {
    setMode(newMode);
    const mergedPrefs = {
      ...defaultPreferences,
      ...modeDefaults[newMode],
    };
    setPreferences(mergedPrefs);
    if (user) {
      await updateProfile({ accessibilityMode: newMode, preferences: mergedPrefs });
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        mode,
        preferences,
        updatePreferences,
        updateMode,
        isHighContrast: preferences.highContrast,
        isLargeText: preferences.fontSize !== 'normal',
        isReducedMotion: preferences.reducedMotion,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
