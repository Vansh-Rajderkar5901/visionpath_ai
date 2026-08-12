'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Camera,
  Clock,
  Compass,
  Map,
  MapPin,
  Mic,
  Navigation,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/services/dashboard';
import { cn, formatClockTime, formatRelativeTime } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const quickActions = [
  {
    label: 'Navigate',
    href: '/dashboard/indoor',
    icon: Navigation,
    color: 'from-primary-500 to-accent-500',
    hint: 'Find your way',
  },
  {
    label: 'Voice',
    href: '/dashboard/voice',
    icon: Mic,
    color: 'from-purple-500 to-pink-500',
    hint: 'Speak commands',
  },
  {
    label: 'OCR',
    href: '/dashboard/ocr',
    icon: Camera,
    color: 'from-blue-500 to-cyan-500',
    hint: 'Read text',
  },
  {
    label: 'Emergency',
    href: '/dashboard/emergency',
    icon: AlertTriangle,
    color: 'from-red-500 to-orange-500',
    hint: 'Get help',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: upcomingClasses, isLoading: classesLoading } = useQuery({
    queryKey: ['upcoming-classes'],
    queryFn: () => dashboardService.getUpcomingClasses(),
  });

  const { data: recentLocations, isLoading: locationsLoading } = useQuery({
    queryKey: ['recent-locations'],
    queryFn: () => dashboardService.getRecentLocations(),
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    {
      label: 'Navigations',
      value: stats?.totalNavigations ?? 0,
      icon: Compass,
      color: 'text-primary-600',
      bg: 'bg-primary-100 dark:bg-primary-900/30',
    },
    {
      label: 'Places Visited',
      value: stats?.savedLocations ?? 0,
      icon: MapPin,
      color: 'text-accent-600',
      bg: 'bg-accent-100 dark:bg-accent-900/30',
    },
    {
      label: 'Classes',
      value: stats?.upcomingClasses ?? 0,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Unread Alerts',
      value: stats?.unreadNotifications ?? 0,
      icon: Bell,
      color: 'text-orange-600',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {greeting()}, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here&apos;s your accessibility overview
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              {stat.label === 'Navigations' && (stats?.navigationsThisWeek ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <TrendingUp className="w-3.5 h-3.5" />+{stats?.navigationsThisWeek}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group relative p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border card-hover overflow-hidden"
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-xl bg-gradient-to-br p-3 mb-3 shadow-lg',
                  action.color
                )}
              >
                <action.icon className="w-full h-full text-white" />
              </div>
              <p className="font-semibold text-sm">{action.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{action.hint}</p>
              <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming classes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Classes</h2>
          </div>
          <div className="space-y-3">
            {classesLoading && <LoadingSpinner size="sm" text="Loading timetable..." />}
            {!classesLoading && (upcomingClasses?.length ?? 0) === 0 && (
              <EmptyState
                icon={<Calendar className="w-8 h-8 text-gray-400" />}
                title="No classes scheduled"
                description="Your timetable will appear here once classes are added."
                className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border"
              />
            )}
            {upcomingClasses?.map((cls) => (
              <div
                key={cls.id}
                className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{cls.courseName}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{cls.instructor}</p>
                  </div>
                  <span className="text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full flex-shrink-0">
                    {cls.day}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatClockTime(cls.startTime)} - {formatClockTime(cls.endTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {cls.building}, {cls.room}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Recent locations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Locations</h2>
            <Link
              href="/dashboard/indoor"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Navigate
            </Link>
          </div>
          <div className="space-y-3">
            {locationsLoading && <LoadingSpinner size="sm" text="Loading history..." />}
            {!locationsLoading && (recentLocations?.length ?? 0) === 0 && (
              <EmptyState
                icon={<MapPin className="w-8 h-8 text-gray-400" />}
                title="No journeys yet"
                description="Places you navigate to will show up here."
                action={
                  <Link href="/dashboard/indoor" className="btn-primary text-sm">
                    Plan a route
                  </Link>
                }
                className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border"
              />
            )}
            {recentLocations?.map((location) => (
              <div
                key={location.id}
                className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{location.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {location.building}
                      {location.floor ? `, ${location.floor}` : ''}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatRelativeTime(location.lastVisited)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-1.5">
                    <div
                      className="bg-primary-500 rounded-full h-1.5"
                      style={{ width: `${Math.min((location.frequency / 10) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {location.frequency} {location.frequency === 1 ? 'visit' : 'visits'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Map preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
      >
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold">Campus Map</h2>
          </div>
          <Link
            href="/dashboard/map"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Open full map
          </Link>
        </div>
        <div className="aspect-[21/9] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-border dark:to-dark-card flex items-center justify-center">
          <Link href="/dashboard/map" className="btn-secondary">
            <Map className="w-5 h-5 mr-2" />
            View Interactive Map
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
