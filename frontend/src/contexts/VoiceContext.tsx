'use client';

import React, { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';
import { VoiceCommand, VoiceCommandIntent, VoiceAssistantState } from '@/types';
import { useAccessibility } from './AccessibilityContext';
import toast from 'react-hot-toast';

interface VoiceContextType extends VoiceAssistantState {
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  toggleContinuousMode: () => void;
  processCommand: (text: string) => void;
}

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

export function VoiceProvider({ children }: { children: ReactNode }) {
  const { preferences } = useAccessibility();
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    response: '',
    continuousMode: false,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) && 'speechSynthesis' in window;

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice recognition is not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = state.continuousMode;
    recognition.interimResults = true;
    recognition.lang = preferences.language || 'en-US';

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      setState(prev => ({ ...prev, transcript }));

      if (event.results[event.results.length - 1].isFinal) {
        processCommand(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      toast.error('Text-to-speech is not supported');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = preferences.voiceSpeed || 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = preferences.language || 'en-US';

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
  }, [preferences.voiceSpeed, preferences.language]);

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
      'notifications': '/dashboard/notifications',
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

