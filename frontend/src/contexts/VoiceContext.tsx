'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { VoiceCommand, VoiceCommandIntent, VoiceAssistantState, SpeechSettings } from '@/types';
import { useAccessibility } from './AccessibilityContext';
import toast from 'react-hot-toast';

interface VoiceContextType extends VoiceAssistantState {
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  toggleContinuousMode: () => void;
  processCommand: (text: string) => void;
  // ---- Screen reader / speech control helpers ----
  speech: SpeechSettings;
  setSpeech: (patch: Partial<SpeechSettings>) => void;
  speakDescriptive: (text: string, opts?: { priority?: 'polite' | 'assertive'; force?: boolean }) => void;
  announce: (text: string, opts?: { priority?: 'polite' | 'assertive'; force?: boolean }) => void;
  repeatLast: () => void;
  availableVoices: SpeechSynthesisVoice[];
  voiceSupported: boolean;
}

// Minimal Web Speech API type declarations (not included in standard TS DOM libs)
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

// Predefined command patterns
const commandPatterns: { pattern: RegExp; intent: VoiceCommandIntent; entities: string[] }[] = [
  { pattern: /take me to (.*)/i, intent: 'navigate', entities: ['destination'] },
  { pattern: /guide me to (.*)/i, intent: 'navigate', entities: ['destination'] },
  { pattern: /navigate to (.*)/i, intent: 'navigate', entities: ['destination'] },
  { pattern: /read this/i, intent: 'read', entities: [] },
  { pattern: /read (.*)/i, intent: 'read', entities: ['text'] },
  { pattern: /call (.*)/i, intent: 'call', entities: ['contact'] },
  { pattern: /open (.*)/i, intent: 'open', entities: ['page'] },
  { pattern: /search (.*)/i, intent: 'search', entities: ['query'] },
  { pattern: /emergency/i, intent: 'emergency', entities: [] },
  { pattern: /help/i, intent: 'help', entities: [] },
  { pattern: /cancel/i, intent: 'cancel', entities: [] },
  { pattern: /where is (.*)/i, intent: 'search', entities: ['place'] },
];

// Command responses
const commandResponses: Record<string, string> = {
  'navigate': 'Navigating to your destination. Please follow the guidance.',
  'read': 'Reading the text aloud now.',
  'call': 'Initiating the call.',
  'open': 'Opening the requested page.',
  'search': 'Searching for what you asked.',
  'emergency': 'Emergency mode activated. Sending your location to emergency contacts.',
  'help': 'I can help you navigate, read text, make calls, or search. Just tell me what you need.',
  'cancel': 'Action cancelled. How can I help you?',
};

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return (Ctor as SpeechRecognitionConstructor) || null;
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const { preferences } = useAccessibility();
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    response: '',
    continuousMode: false,
  });

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const lastSpokenRef = useRef<{ text: string; at: number }>({ text: '', at: 0 });
  const hasHydratedSpeechRef = useRef(false);

  const isSupported = typeof window !== 'undefined' && !!getSpeechRecognitionConstructor() && 'speechSynthesis' in window;

  // ---- Speech control settings ----
  const [speech, setSpeechState] = useState<SpeechSettings>(() => {
    if (typeof window === 'undefined') {
      return { enabled: true, muted: false, volume: 1, selectedVoiceIndex: -1, lastSpoken: '' };
    }
    try {
      const raw = localStorage.getItem('visionpath_speech');
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SpeechSettings>;
        return {
          enabled: parsed.enabled ?? true,
          muted: parsed.muted ?? false,
          volume: parsed.volume ?? 1,
          selectedVoiceIndex: parsed.selectedVoiceIndex ?? -1,
          lastSpoken: parsed.lastSpoken ?? '',
        };
      }
    } catch {
      // ignore malformed storage
    }
    return { enabled: true, muted: false, volume: 1, selectedVoiceIndex: -1, lastSpoken: '' };
  });

  const setSpeech = useCallback((patch: Partial<SpeechSettings>) => {
    setSpeechState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem('visionpath_speech', JSON.stringify(next));
      } catch {
        // storage may be unavailable
      }
      return next;
    });
  }, []);

  // Load & track available voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const voiceSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

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

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice recognition is not supported in your browser');
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) {
      toast.error('Voice recognition is not supported');
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = state.continuousMode;
    recognition.interimResults = true;
    recognition.lang = preferences.language || 'en-US';

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true }));
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      setState(prev => ({ ...prev, transcript }));

      const lastResult = event.results[event.results.length - 1];
      if (lastResult && lastResult.isFinal) {
        processCommand(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setState(prev => ({ ...prev, isListening: false }));
      toast.error('Voice recognition error: ' + event.error);
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
      if (state.continuousMode) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, state.continuousMode, preferences.language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  /**
   * Core TTS engine. Respects the on/off switch and mute setting, uses the
   * selected voice, volume, and speech rate. Tracks lastSpoken for the
   * "repeat last announcement" control. Cancels prior speech before speaking.
   */
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    const s = speech;
    // Master on/off + mute check. Still record text so repeat works for
    // already-spoken content? No - if disabled, do nothing.
    if (!s.enabled || s.muted) return;
    if (!text || !text.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = preferences.voiceSpeed || 1;
    utterance.pitch = 1;
    utterance.volume = s.volume ?? 1;
    utterance.lang = preferences.language || 'en-US';

    const voices = voicesRef.current.length > 0 ? voicesRef.current : (window.speechSynthesis.getVoices() || []);
    if (s.selectedVoiceIndex >= 0 && voices[s.selectedVoiceIndex]) {
      const voice = voices[s.selectedVoiceIndex];
      utterance.voice = voice;
      utterance.lang = voice.lang || utterance.lang;
    }

    setSpeechState((prev) => {
      const next = { ...prev, lastSpoken: text };
      try {
        localStorage.setItem('visionpath_speech', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    lastSpokenRef.current = { text, at: Date.now() };

    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true }));
    };
    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
    };
    utterance.onerror = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    window.speechSynthesis.speak(utterance);
    synthesisRef.current = window.speechSynthesis;
  }, [speech.enabled, speech.muted, speech.volume, speech.selectedVoiceIndex, preferences.voiceSpeed, preferences.language]);

  /**
   * Speak, but avoid repeating the identical string within a short window
   * (unless force is true or it has different priority context). This powers
   * focus/hover announcements so the same element is not re-read endlessly.
   */
  const speakDescriptive = useCallback(
    (text: string, opts?: { priority?: 'polite' | 'assertive'; force?: boolean }) => {
      if (!text || !text.trim()) return;
      const now = Date.now();
      const prev = lastSpokenRef.current;
      // Suppress repeated identical announcements within 1.4s (focus re-entry)
      if (!opts?.force && prev.text === text && now - prev.at < 1400) {
        return;
      }
      lastSpokenRef.current = { text, at: now };
      speak(text);
    },
    [speak]
  );

  /** Alias for speakDescriptive — normalized announcement entry point. */
  const announce = useCallback(
    (text: string, opts?: { priority?: 'polite' | 'assertive'; force?: boolean }) => {
      speakDescriptive(text, opts);
    },
    [speakDescriptive]
  );

  /** Repeat the most recent announcement (skips dedup). */
  const repeatLast = useCallback(() => {
    const s = speech;
    if (!s.enabled || s.muted) return;
    if (!s.lastSpoken || !s.lastSpoken.trim()) {
      announce('There is no previous announcement to repeat.');
      return;
    }
    speak(s.lastSpoken);
  }, [speech, speak, announce]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  const toggleContinuousMode = useCallback(() => {
    setState(prev => ({ ...prev, continuousMode: !prev.continuousMode }));
    if (state.isListening) {
      stopListening();
    }
  }, [state.isListening, stopListening]);

  const processCommand = useCallback((text: string) => {
    let matched = false;

    for (const { pattern, intent, entities } of commandPatterns) {
      const match = text.match(pattern);
      if (match) {
        matched = true;
        const command: VoiceCommand = {
          text,
          intent,
          confidence: 0.9,
          entities: {},
        };

        entities.forEach((entity, index) => {
          command.entities[entity] = match[index + 1] || '';
        });

        // Handle specific commands
        switch (intent) {
          case 'navigate':
            handleNavigation(command);
            break;
          case 'read':
            handleRead(command);
            break;
          case 'call':
            handleCall(command);
            break;
          case 'open':
            handleOpen(command);
            break;
          case 'search':
            handleSearch(command);
            break;
          case 'emergency':
            handleEmergency();
            break;
          case 'help':
            handleHelp();
            break;
          case 'cancel':
            handleCancel();
            break;
        }

        const response = commandResponses[intent] || 'Command received. Processing your request.';
        setState(prev => ({ ...prev, response }));

        if (preferences.textToSpeech) {
          speak(response);
        }
        break;
      }
    }

    if (!matched) {
      const sorryMsg = "I didn't understand that command. Try saying 'Help' for available commands.";
      setState(prev => ({ ...prev, response: sorryMsg }));
      if (preferences.textToSpeech) {
        speak(sorryMsg);
      }
    }
  }, [preferences.textToSpeech, speak]);

  const handleNavigation = (command: VoiceCommand) => {
    const destination = command.entities['destination'] || command.entities['place'];
    if (destination) {
      toast.success(`Navigating to ${destination}`);
      // Trigger navigation in map component via event
      window.dispatchEvent(new CustomEvent('navigate', { detail: { destination } }));
    }
  };

  const handleRead = (_command: VoiceCommand) => {
    toast.success('Reading mode activated');
    window.dispatchEvent(new CustomEvent('read-aloud'));
  };

  const handleCall = (command: VoiceCommand) => {
    const contact = command.entities['contact'];
    if (contact) {
      toast.success(`Calling ${contact}`);
    }
  };

  const handleOpen = (command: VoiceCommand) => {
    const page = command.entities['page']?.toLowerCase();
    const routes: Record<string, string> = {
      'profile': '/profile',
      'dashboard': '/dashboard',
      'map': '/dashboard/map',
      'maps': '/dashboard/map',
      'navigation': '/dashboard/map',
      'ocr': '/dashboard/ocr',
      'scanner': '/dashboard/ocr',
      'emergency': '/dashboard/emergency',
      'settings': '/profile',
    };

    const route = routes[page];
    if (route) {
      window.location.href = route;
    } else {
      toast.error(`Couldn't find page: ${page}`);
    }
  };

  const handleSearch = (command: VoiceCommand) => {
    const query = command.entities['query'] || command.entities['place'];
    if (query) {
      toast.success(`Searching for ${query}`);
      window.dispatchEvent(new CustomEvent('search', { detail: { query } }));
    }
  };

  const handleEmergency = () => {
    toast.error('Emergency mode activated!');
    window.dispatchEvent(new CustomEvent('emergency-sos'));
  };

  const handleHelp = () => {
    const helpText = `Available commands:
    - "Take me to [destination]"
    - "Guide me to [place]"
    - "Read this"
    - "Call [contact]"
    - "Open [page]"
    - "Search [query]"
    - "Emergency"
    - "Help"
    - "Cancel"`;

    toast.success('Help guide', { duration: 5000 });
    if (preferences.textToSpeech) {
      speak(helpText);
    }
  };

  const handleCancel = () => {
    toast.success('Action cancelled');
  };

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
        // ---- Screen reader / speech control helpers ----
        speech,
        setSpeech,
        speakDescriptive,
        announce,
        repeatLast,
        availableVoices,
        voiceSupported,
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
