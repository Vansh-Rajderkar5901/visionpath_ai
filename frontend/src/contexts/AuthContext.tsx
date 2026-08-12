'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { AccessibilityMode, AuthState, User, UserPreferences } from '@/types';
import { authService } from '@/services/auth';
import { tokenStorage, USER_STORAGE_KEY } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    email?: string;
    phoneNumber?: string;
  }) => Promise<User>;
  setAccessibilityMode: (mode: AccessibilityMode) => Promise<User>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<User>;
  requestPasswordReset: (email: string) => Promise<{ message: string; resetToken?: string }>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * The cached user is only a paint-flicker optimisation for the first render.
 * Authentication itself always comes from the token plus a live /api/auth/me
 * check, so editing localStorage cannot grant access or an admin role.
 */
function readCachedUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function cacheUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  const applyUser = useCallback((user: User) => {
    cacheUser(user);
    setState({ user, isLoading: false, isAuthenticated: true });
  }, []);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  // Restore the session on first load by validating the stored token.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!tokenStorage.get()) {
        clearSession();
        return;
      }

      // Show the cached identity immediately, then confirm it with the server.
      const cached = readCachedUser();
      if (cached) {
        setState({ user: cached, isLoading: true, isAuthenticated: true });
      }

      try {
        const user = await authService.getCurrentUser();
        if (!cancelled) applyUser(user);
      } catch {
        if (!cancelled) clearSession();
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [applyUser, clearSession]);

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const user = await authService.login(email, password);
        applyUser(user);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('visionpath_remember', rememberMe ? 'true' : 'false');
        }
        router.push(user.accessibilityMode ? '/dashboard' : '/onboarding');
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [applyUser, router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const user = await authService.register(name, email, password);
        applyUser(user);
        router.push('/onboarding');
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [applyUser, router]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    clearSession();
    router.push('/');
  }, [clearSession, router]);

  const updateProfile = useCallback(
    async (data: { name?: string; email?: string; phoneNumber?: string }) => {
      const user = await authService.updateProfile(data);
      applyUser(user);
      return user;
    },
    [applyUser]
  );

  const setAccessibilityMode = useCallback(
    async (mode: AccessibilityMode) => {
      const user = await authService.updateMode(mode);
      applyUser(user);
      return user;
    },
    [applyUser]
  );

  const updatePreferences = useCallback(
    async (preferences: Partial<UserPreferences>) => {
      const user = await authService.updatePreferences(preferences);
      applyUser(user);
      return user;
    },
    [applyUser]
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    return authService.requestPasswordReset(email);
  }, []);

  const refresh = useCallback(async () => {
    try {
      applyUser(await authService.getCurrentUser());
    } catch {
      clearSession();
    }
  }, [applyUser, clearSession]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        setAccessibilityMode,
        updatePreferences,
        requestPasswordReset,
        refresh,
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
