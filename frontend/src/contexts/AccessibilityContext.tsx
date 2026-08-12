'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AccessibilityMode, UserPreferences } from '@/types';
import { useAuth } from './AuthContext';

interface AccessibilityContextType {
  mode: AccessibilityMode;
  preferences: UserPreferences;
  /** Persists to the server, then applies. Throws if the save fails. */
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  updateMode: (mode: AccessibilityMode) => Promise<void>;
  isHighContrast: boolean;
  isLargeText: boolean;
  isReducedMotion: boolean;
  isSaving: boolean;
}

/**
 * Used before sign-in and while the profile loads. Once a user is present the
 * server's stored preferences replace these — the backend owns the per-mode
 * presets so both halves of the app cannot drift apart.
 */
export const defaultPreferences: UserPreferences = {
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
  emailNotifications: true,
  pushNotifications: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { user, setAccessibilityMode, updatePreferences: savePreferences } = useAuth();
  const [mode, setMode] = useState<AccessibilityMode>('standard');
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);

  // Mirror whatever the server says this user's settings are.
  useEffect(() => {
    if (user) {
      setMode(user.accessibilityMode);
      setPreferences({ ...defaultPreferences, ...user.preferences });
    } else {
      setMode('standard');
      setPreferences(defaultPreferences);
    }
  }, [user]);

  // Project the preferences onto the document so every page picks them up.
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark =
        preferences.theme === 'dark' || (preferences.theme === 'system' && prefersDark);
      root.classList.toggle('dark', dark);
    };

    applyTheme();

    root.classList.toggle('high-contrast', preferences.highContrast);
    root.classList.toggle('large-touch-target', preferences.largeTouchTargets);
    root.classList.toggle('reduce-motion', preferences.reducedMotion);

    root.style.fontSize =
      preferences.fontSize === 'large'
        ? '18px'
        : preferences.fontSize === 'x-large'
          ? '22px'
          : '16px';

    root.style.setProperty(
      '--reduce-motion',
      preferences.reducedMotion ? 'reduce' : 'no-preference'
    );

    if (preferences.screenReaderOptimized) {
      root.setAttribute('data-screen-reader-optimized', 'true');
    } else {
      root.removeAttribute('data-screen-reader-optimized');
    }

    root.lang = preferences.language || 'en';

    // Follow the OS while the theme is set to "system".
    if (preferences.theme !== 'system' || typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [preferences]);

  const updatePreferences = useCallback(
    async (patch: Partial<UserPreferences>) => {
      const previous = preferences;
      // Apply straight away so the interface responds instantly, then persist.
      setPreferences({ ...preferences, ...patch });

      if (!user) return;

      setIsSaving(true);
      try {
        const updated = await savePreferences(patch);
        setPreferences({ ...defaultPreferences, ...updated.preferences });
      } catch (error) {
        setPreferences(previous); // roll back a change the server rejected
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [preferences, savePreferences, user]
  );

  const updateMode = useCallback(
    async (newMode: AccessibilityMode) => {
      const previousMode = mode;
      const previousPreferences = preferences;
      setMode(newMode);

      if (!user) return;

      setIsSaving(true);
      try {
        const updated = await setAccessibilityMode(newMode);
        setMode(updated.accessibilityMode);
        setPreferences({ ...defaultPreferences, ...updated.preferences });
      } catch (error) {
        setMode(previousMode);
        setPreferences(previousPreferences);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [mode, preferences, setAccessibilityMode, user]
  );

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
        isSaving,
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
