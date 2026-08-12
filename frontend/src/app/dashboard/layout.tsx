'use client';

import React from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { VoiceFloatingButton } from '@/components/voice/VoiceFloatingButton';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <DashboardSidebar />
        <main
          id="main-content"
          className="lg:pl-[280px] min-h-screen transition-all duration-300"
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
        <VoiceFloatingButton />
      </div>
    </ProtectedRoute>
  );
}
