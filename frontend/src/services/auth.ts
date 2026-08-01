import { User, APIResponse } from '@/types';
import { api } from './api';

// Mock data for development
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@visionpath.ai': {
    password: 'admin123',
    user: {
      id: 'admin-001',
      email: 'admin@visionpath.ai',
      name: 'Admin User',
      photoURL: '',
      role: 'admin',
      accessibilityMode: 'standard',
      preferences: {
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
        notifications: {
          pushEnabled: true,
          emailEnabled: true,
          classReminders: true,
          eventAlerts: true,
          emergencyAlerts: true,
          navigationReminders: true,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

export const authService = {
  async login(email: string, password: string): Promise<User> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.password === password) {
      return mockUser.user;
    }

    // For demo: auto-create user for any login
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0].replace(/[.-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      photoURL: '',
      role: 'user',
      accessibilityMode: 'standard',
      preferences: {
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
        notifications: {
          pushEnabled: true,
          emailEnabled: true,
          classReminders: true,
          eventAlerts: true,
          emergencyAlerts: true,
          navigationReminders: true,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_USERS[email] = { password, user: newUser };
    return newUser;
  },

  async register(name: string, email: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      photoURL: '',
      role: 'user',
      accessibilityMode: 'standard',
      preferences: {
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
        notifications: {
          pushEnabled: true,
          emailEnabled: true,
          classReminders: true,
          eventAlerts: true,
          emergencyAlerts: true,
          navigationReminders: true,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_USERS[email] = { password, user: newUser };
    return newUser;
  },

  async loginWithGoogle(): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      id: `google-user-${Date.now()}`,
      email: 'user@gmail.com',
      name: 'Google User',
      photoURL: 'https://lh3.googleusercontent.com/a/default-user',
      role: 'user',
      accessibilityMode: 'standard',
      preferences: {
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
        notifications: {
          pushEnabled: true,
          emailEnabled: true,
          classReminders: true,
          eventAlerts: true,
          emergencyAlerts: true,
          navigationReminders: true,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  async resetPassword(email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!MOCK_USERS[email]) {
      throw new Error('No account found with this email');
    }
  },

  async getProfile(userId: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const user = Object.values(MOCK_USERS).find((u) => u.user.id === userId);
    if (!user) throw new Error('User not found');
    return user.user;
  },
};

