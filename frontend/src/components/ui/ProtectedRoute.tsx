'use client';

import React, { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoading } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  const shouldRedirect = !isLoading && (!isAuthenticated || (adminOnly && user?.role !== 'admin'));

  // Redirects belong in an effect: navigating during render is a React side
  // effect in the render phase and warns in development.
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (adminOnly && user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [adminOnly, isAuthenticated, isLoading, router, user?.role]);

  if (isLoading || shouldRedirect) {
    return <PageLoading />;
  }

  return <>{children}</>;
}
