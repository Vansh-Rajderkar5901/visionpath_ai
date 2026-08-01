'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { User, AuthState, AccessibilityMode } from '@/types';
import { authService } from '@/services/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setAccessibilityMode: (mode: AccessibilityMode) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('visionpath_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setState({ user, isLoading: false, isAuthenticated: true });
      } catch {
        localStorage.removeItem('visionpath_user');
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } else {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await authService.login(email, password);
      localStorage.setItem('visionpath_user', JSON.stringify(user));
      if (rememberMe) {
        localStorage.setItem('visionpath_remember', 'true');
      }
      setState({ user, isLoading: false, isAuthenticated: true });
      router.push(user.accessibilityMode ? '/dashboard' : '/onboarding');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await authService.register(name, email, password);
      localStorage.setItem('visionpath_user', JSON.stringify(user));
      setState({ user, isLoading: false, isAuthenticated: true });
      router.push('/onboarding');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [router]);

  const loginWithGoogle = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await authService.loginWithGoogle();
      localStorage.setItem('visionpath_user', JSON.stringify(user));
      setState({ user, isLoading: false, isAuthenticated: true });
      router.push(user.accessibilityMode ? '/dashboard' : '/onboarding');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem('visionpath_user');
    localStorage.removeItem('visionpath_remember');
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.push('/');
  }, [router]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!state.user) throw new Error('Not authenticated');
    const updatedUser = { ...state.user, ...data };
    localStorage.setItem('visionpath_user', JSON.stringify(updatedUser));
    setState(prev => ({ ...prev, user: updatedUser }));
  }, [state.user]);

  const setAccessibilityMode = useCallback(async (mode: AccessibilityMode) => {
    if (!state.user) throw new Error('Not authenticated');
    const updatedUser = { ...state.user, accessibilityMode: mode };
    localStorage.setItem('visionpath_user', JSON.stringify(updatedUser));
    setState(prev => ({ ...prev, user: updatedUser }));
    router.push('/dashboard');
  }, [state.user, router]);

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        setAccessibilityMode,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

