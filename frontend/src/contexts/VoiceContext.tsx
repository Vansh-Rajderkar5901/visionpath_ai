'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { SpeechSettings, VoiceAssistantState, VoiceCommandResult } from '@/types';
import { voiceService } from '@/services/voice';
import { emitVoiceEvent, VOICE_EVENTS } from '@/lib/voiceEvents';
import { useAccessibility } from './AccessibilityContext';
import { useAuth } from './AuthContext';

interface VoiceContextType extends VoiceAssistantState {
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  toggleContinuousMode: () => void;
  /** Interpret an utterance through the server and act on the result. */
  processCommand: (text: string) => Promise<VoiceCommandResult | null>;
  isProcessing: boolean;
  lastResult: VoiceCommandResult | null;
  /** Where the user currently is, so "take me to X" can produce a real route. */
  currentNode: string | null;
  setCurrentNode: (nodeId: string | null) => void;
  // ---- Screen reader / speech control helpers ----
  speech: SpeechSettings;
  setSpeech: (patch: Partial<SpeechSettings>) => void;
  speakDescriptive: (text: string, opts?: { priority?: 'polite' | 'assertive'; force?: boolean }) => void;
  announce: (text: string, opts?: { priority?: 'polite' | 'assertive'; force?: boolean }) => void;
  repeatLast: () => void;
  availableVoices: SpeechSynthesisVoice[];
  voiceSupported: boolean;
  recognitionSupported: boolean;
}

// Minimal Web Speech API declarations (not in the standard TS DOM libs).
interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

const CURRENT_NODE_STORAGE_KEY = 'visionpath_current_node';

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return (Ctor as SpeechRecognitionConstructor) || null;
}

function defaultSpeechSettings(): SpeechSettings {
  return { enabled: true, muted: false, volume: 1, selectedVoiceIndex: -1, lastSpoken: '' };
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const { preferences } = useAccessibility();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    response: '',
    continuousMode: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<VoiceCommandResult | null>(null);
  const [currentNode, setCurrentNodeState] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const lastSpokenRef = useRef<{ text: string; at: number }>({ text: '', at: 0 });
  // Refs mirror state that the long-lived recognition callbacks read. Reading
  // them from state would capture the value at the time `startListening` ran.
  const continuousModeRef = useRef(false);
  const stoppedByUserRef = useRef(false);
  const processCommandRef = useRef<(text: string) => Promise<VoiceCommandResult | null>>();

  const voiceSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;
  const recognitionSupported =
    typeof window !== 'undefined' && !!getSpeechRecognitionConstructor();

  // ---- speech settings (device-local) ----

  const [speech, setSpeechState] = useState<SpeechSettings>(() => {
    if (typeof window === 'undefined') return defaultSpeechSettings();
    try {
      const raw = window.localStorage.getItem('visionpath_speech');
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SpeechSettings>;
        return { ...defaultSpeechSettings(), ...parsed };
      }
    } catch {
      // ignore malformed storage
    }
    return defaultSpeechSettings();
  });

  const setSpeech = useCallback((patch: Partial<SpeechSettings>) => {
    setSpeechState((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem('visionpath_speech', JSON.stringify(next));
      } catch {
        // storage may be unavailable
      }
      return next;
    });
  }, []);

  const setCurrentNode = useCallback((nodeId: string | null) => {
    setCurrentNodeState(nodeId);
    try {
      if (nodeId) {
        window.localStorage.setItem(CURRENT_NODE_STORAGE_KEY, nodeId);
      } else {
        window.localStorage.removeItem(CURRENT_NODE_STORAGE_KEY);
      }
    } catch {
      // storage may be unavailable
    }
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CURRENT_NODE_STORAGE_KEY);
      if (stored) setCurrentNodeState(stored);
    } catch {
      // storage may be unavailable
    }
  }, []);

  // ---- voices ----

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // ---- speaking ----

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!speech.enabled || speech.muted) return;
      if (!text || !text.trim()) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = preferences.voiceSpeed || 1;
      utterance.pitch = 1;
      utterance.volume = speech.volume ?? 1;
      utterance.lang = preferences.language || 'en-US';

      const voices =
        voicesRef.current.length > 0
          ? voicesRef.current
          : window.speechSynthesis.getVoices() || [];
      if (speech.selectedVoiceIndex >= 0 && voices[speech.selectedVoiceIndex]) {
        const voice = voices[speech.selectedVoiceIndex];
        utterance.voice = voice;
        utterance.lang = voice.lang || utterance.lang;
      }

      setSpeech({ lastSpoken: text });
      lastSpokenRef.current = { text, at: Date.now() };

      utterance.onstart = () => setState((prev) => ({ ...prev, isSpeaking: true }));
      utterance.onend = () => setState((prev) => ({ ...prev, isSpeaking: false }));
      utterance.onerror = () => setState((prev) => ({ ...prev, isSpeaking: false }));

      window.speechSynthesis.speak(utterance);
    },
    [
      speech.enabled,
      speech.muted,
      speech.volume,
      speech.selectedVoiceIndex,
      preferences.voiceSpeed,
      preferences.language,
      setSpeech,
    ]
  );

  /**
   * Speak, but drop an identical message repeated within 1.4 seconds. This is
   * what keeps focus and hover announcements from reading the same element
   * over and over.
   */
  const speakDescriptive = useCallback(
    (text: string, opts?: { priority?: 'polite' | 'assertive'; force?: boolean }) => {
      if (!text || !text.trim()) return;
      const now = Date.now();
      const previous = lastSpokenRef.current;
      if (!opts?.force && previous.text === text && now - previous.at < 1400) return;
      lastSpokenRef.current = { text, at: now };
      speak(text);
    },
    [speak]
  );

  const announce = useCallback(
    (text: string, opts?: { priority?: 'polite' | 'assertive'; force?: boolean }) => {
      speakDescriptive(text, opts);
    },
    [speakDescriptive]
  );

  const repeatLast = useCallback(() => {
    if (!speech.enabled || speech.muted) return;
    if (!speech.lastSpoken || !speech.lastSpoken.trim()) {
      announce('There is no previous announcement to repeat.', { force: true });
      return;
    }
    speak(speech.lastSpoken);
  }, [speech, speak, announce]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setState((prev) => ({ ...prev, isSpeaking: false }));
  }, []);

  // ---- command handling ----

  const processCommand = useCallback(
    async (text: string): Promise<VoiceCommandResult | null> => {
      const utterance = text.trim();
      if (!utterance) return null;

      if (!isAuthenticated) {
        const message = 'Please sign in to use the voice assistant.';
        setState((prev) => ({ ...prev, response: message }));
        speak(message);
        return null;
      }

      setIsProcessing(true);
      try {
        const result = await voiceService.sendCommand(utterance, currentNode);
        setLastResult(result);
        setState((prev) => ({ ...prev, response: result.response }));

        switch (result.action?.type) {
          case 'navigate':
            emitVoiceEvent(VOICE_EVENTS.navigate, {
              nodeId: result.action.nodeId || '',
              name: result.action.name || '',
              route: result.route,
            });
            toast.success(`Navigating to ${result.action.name}`);
            break;
          case 'open':
            if (result.action.url) router.push(result.action.url);
            break;
          case 'read-aloud':
            emitVoiceEvent(VOICE_EVENTS.readAloud);
            router.push('/dashboard/ocr');
            break;
          case 'emergency-sos':
            emitVoiceEvent(VOICE_EVENTS.emergencySOS);
            router.push('/dashboard/emergency');
            toast.error('Emergency mode activated');
            break;
          case 'call':
            if (result.action.contact) toast.success(`Calling ${result.action.contact}`);
            break;
          case 'cancel':
            stopSpeaking();
            break;
          default:
            break;
        }

        if (result.intent === 'search' && result.matches.length > 0) {
          emitVoiceEvent(VOICE_EVENTS.search, {
            query: utterance,
            matches: result.matches,
          });
        }

        // The assistant always answers out loud — it is the primary interface
        // for users who cannot see the screen, so this does not wait on the
        // text-to-speech preference the way passive announcements do.
        speak(result.response);
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'I could not reach the server. Please try again.';
        setState((prev) => ({ ...prev, response: message }));
        speak(message);
        toast.error(message);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [currentNode, isAuthenticated, router, speak, stopSpeaking]
  );

  // Keep the ref pointing at the latest closure for the recognition callbacks.
  useEffect(() => {
    processCommandRef.current = processCommand;
  }, [processCommand]);

  useEffect(() => {
    continuousModeRef.current = state.continuousMode;
  }, [state.continuousMode]);

  // ---- listening ----

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) {
      toast.error(
        'Voice recognition is not supported in this browser. Try Chrome or Edge.'
      );
      return;
    }

    // Restarting over a live session throws; tear the old one down first.
    if (recognitionRef.current) {
      stoppedByUserRef.current = true;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    stoppedByUserRef.current = false;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = continuousModeRef.current;
    recognition.interimResults = true;
    recognition.lang = preferences.language === 'en' ? 'en-US' : preferences.language || 'en-US';

    recognition.onstart = () => {
      setState((prev) => ({ ...prev, isListening: true, transcript: '' }));
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');

      setState((prev) => ({ ...prev, transcript }));

      const lastResultItem = event.results[event.results.length - 1];
      if (lastResultItem && lastResultItem.isFinal) {
        void processCommandRef.current?.(transcript);
      }
    };

    recognition.onerror = (event) => {
      setState((prev) => ({ ...prev, isListening: false }));
      // "aborted" and "no-speech" are routine; don't nag the user about them.
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast.error('Microphone access is blocked. Allow it in your browser settings.');
        return;
      }
      toast.error(`Voice recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }));
      if (continuousModeRef.current && !stoppedByUserRef.current) {
        try {
          recognition.start();
        } catch {
          recognitionRef.current = null;
        }
      } else {
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      toast.error('Could not start the microphone. Please try again.');
      recognitionRef.current = null;
    }
  }, [preferences.language]);

  const stopListening = useCallback(() => {
    stoppedByUserRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const toggleContinuousMode = useCallback(() => {
    setState((prev) => {
      const next = !prev.continuousMode;
      continuousModeRef.current = next;
      return { ...prev, continuousMode: next };
    });
    stopListening();
  }, [stopListening]);

  // Release the microphone if the provider unmounts mid-session.
  useEffect(() => {
    return () => {
      stoppedByUserRef.current = true;
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  return (
    <VoiceContext.Provider
      value={{
        ...state,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        toggleContinuousMode,
        processCommand,
        isProcessing,
        lastResult,
        currentNode,
        setCurrentNode,
        speech,
        setSpeech,
        speakDescriptive,
        announce,
        repeatLast,
        availableVoices,
        voiceSupported,
        recognitionSupported,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
