'use client';

import React, { Suspense, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { VoiceProvider } from '@/contexts/VoiceContext';
import { ThemeProvider } from './ThemeProvider';
import { AccessibilityAnnouncer } from '@/components/accessibility/AccessibilityAnnouncer';
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel';
import { SkipToContent } from '@/components/accessibility/SkipToContent';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AccessibilityProvider>
            <VoiceProvider>
              <SkipToContent />
              <Suspense fallback={null}>
                <AccessibilityAnnouncer />
              </Suspense>
              {children}
              <AccessibilityPanel />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </VoiceProvider>
          </AccessibilityProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

