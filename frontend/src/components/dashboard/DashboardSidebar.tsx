'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Map,
  Navigation,
  Mic,
  Camera,
  AlertTriangle,
  User,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Headphones,
  Volume2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useVoice } from '@/contexts/VoiceContext';
import { notificationService } from '@/services/notifications';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Map & Navigation', href: '/dashboard/map', icon: Map },
  { label: 'Indoor Navigation', href: '/dashboard/indoor', icon: Navigation },
  { label: 'Voice Assistant', href: '/dashboard/voice', icon: Mic },
  { label: 'OCR Reader', href: '/dashboard/ocr', icon: Camera },
  { label: 'Emergency SOS', href: '/dashboard/emergency', icon: AlertTriangle },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Admin Panel', href: '/dashboard/admin', icon: Shield, adminOnly: true },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { preferences, updatePreferences } = useAccessibility();
  const { speech, setSpeech } = useVoice();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Unread count drives the badge, rather than a hard-coded number.
  const { data: notifications } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => notificationService.list(true, 1),
    refetchInterval: 60_000,
    enabled: !!user,
  });
  const unreadCount = notifications?.unreadCount ?? 0;

  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  const quickActions = [
    {
      label: 'Screen Reader',
      icon: Eye,
      active: preferences.screenReaderOptimized,
      onToggle: () =>
        updatePreferences({
          screenReaderOptimized: !preferences.screenReaderOptimized,
        }).catch(() => undefined),
    },
    {
      label: 'Voice Guide',
      icon: Headphones,
      active: speech.enabled && !speech.muted,
      onToggle: () => setSpeech({ enabled: !speech.enabled, muted: false }),
    },
    {
      label: 'High Contrast',
      icon: Volume2,
      active: preferences.highContrast,
      onToggle: () =>
        updatePreferences({ highContrast: !preferences.highContrast }).catch(
          () => undefined
        ),
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border z-50 transition-all duration-300 flex flex-col',
          collapsed ? 'w-[72px]' : 'w-[280px]',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        role="navigation"
        aria-label="Dashboard navigation"
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-gray-200 dark:border-dark-border',
          collapsed ? 'justify-center' : 'gap-3'
        )}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Eye className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                VisionPath
              </span>
            )}
          </Link>
        </div>

        {/* User Info */}
        {!collapsed && user && (
          <div className="px-4 py-4 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            const badge = item.href === '/dashboard/emergency' ? unreadCount : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border hover:text-gray-900 dark:hover:text-white'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive && 'text-primary-600 dark:text-primary-400'
                )} />
                {!collapsed && (
                  <span className="text-sm">{item.label}</span>
                )}
                {badge > 0 && (
                  <span
                    className={cn(
                      'ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center',
                      collapsed && 'absolute top-1 right-1'
                    )}
                    aria-label={`${badge} unread notifications`}
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-dark-border">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onToggle}
                  role="switch"
                  aria-checked={action.active}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                    action.active
                      ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                  )}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                  {action.active && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-accent-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <div className={cn(
          'p-3 border-t border-gray-200 dark:border-dark-border',
          collapsed && 'flex justify-center'
        )}>
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 left-4 z-50 lg:hidden w-12 h-12 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center"
        aria-label="Toggle navigation menu"
      >
        <Navigation className="w-5 h-5" />
      </button>
    </>
  );
}
