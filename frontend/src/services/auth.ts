import type { AuthResponse, User, UserPreferences, AccessibilityMode } from '@/types';
import { api, tokenStorage } from './api';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const result = await api.post<AuthResponse>('/api/auth/login', { email, password });
    tokenStorage.set(result.accessToken);
    return result.user;
  },

  async register(name: string, email: string, password: string): Promise<User> {
    const result = await api.post<AuthResponse>('/api/auth/register', {
      name,
      email,
      password,
    });
    tokenStorage.set(result.accessToken);
    return result.user;
  },

  /** Reads the session back from the server; the token alone is not trusted. */
  async getCurrentUser(): Promise<User> {
    return api.get<User>('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Signing out must succeed locally even if the server is unreachable.
    } finally {
      tokenStorage.clear();
    }
  },

  async requestPasswordReset(email: string): Promise<{ message: string; resetToken?: string }> {
    return api.post('/api/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return api.post('/api/auth/reset-password', { token, newPassword });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return api.post('/api/auth/change-password', { currentPassword, newPassword });
  },

  async updateProfile(data: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    accessibilityMode?: AccessibilityMode;
  }): Promise<User> {
    return api.patch<User>('/api/users/me', data);
  },

  async updateMode(accessibilityMode: AccessibilityMode): Promise<User> {
    return api.put<User>('/api/users/me/mode', { accessibilityMode });
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<User> {
    return api.put<User>('/api/users/me/preferences', preferences);
  },
};
