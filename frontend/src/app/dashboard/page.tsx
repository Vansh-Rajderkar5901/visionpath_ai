'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Map,
  Navigation,
  Mic,
  Camera,
  AlertTriangle,
  Bell,
  Compass,
  Clock,
  TrendingUp,
  ArrowRight,
  Calendar,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/services/dashboard';
import { cn } from '@/lib/utils';
import { formatTime, formatDate } from '@/lib/utils';

const quickActions = [
  { label: 'Navigate', href: '/dashboard/map', icon: Navigation, color: 'from-primary-500 to-accent-500' },
  { label: 'Voice', href: '/dashboard/voice', icon: Mic, color: 'from-purple-500 to-pink-500' },
  { label: 'OCR', href: '/dashboard/ocr', icon: Camera, color: 'from-blue-500 to-cyan-500' },
  { label: 'Emergency', href: '/dashboard/emergency', icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const { data: upcomingClasses } = useQuery({
    queryKey: ['upcoming-classes'],
    queryFn: dashboardService.getUpcomingClasses,
  });

  const { data: recentLocations } = useQuery({
    queryKey: ['recent-locations'],
    queryFn: dashboardService.getRecentLocations,
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold">
          {greeting()}, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here&apos;s your accessibility overview
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Navigations', value: stats?.totalNavigations || 0, icon: Compass, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
          { label: 'Saved Places', value: stats?.savedLocations || 0, icon: MapPin, color: 'text-accent-600', bg: 'bg-accent-100 dark:bg-accent-900/30' },
          { label: 'Classes', value: stats?.upcomingClasses || 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
        ].map((stat, i) => (
          <div key={stat.label} className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <Link
              key={action.label}
              href={action.href}
              className="group relative p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border card-hover overflow-hidden"
            >
              <div className={cn(
                'w-12 h-12 rounded-xl bg-gradient-to-br p-3 mb-3 shadow-lg',
                action.color
              )}>
                <action.icon className="w-full h-full text-white" />
              </div>
              <p className="font-semibold text-sm">{action.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {['Find your way', 'Speak commands', 'Read text', 'Get help'][i]}
              </p>
              <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Upcoming Classes & Recent Locations */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Classes</h2>
            <Link href="/dashboard/map" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingClasses?.map((cls) => (
              <div key={cls.id} className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{cls.courseName}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{cls.instructor}</p>
                  </div>
                  <span className="text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full">
                    {cls.day}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {cls.building}, {cls.room}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Locations</h2>
            <Link href="/dashboard/map" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentLocations?.slice(0, 3).map((loc) => (
              <div key={loc.id} className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{loc.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{loc.building}, {loc.floor}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(loc.lastVisited)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-1.5">
                    <div
                      className="bg-primary-500 rounded-full h-1.5"
                      style={{ width: `${Math.min((loc.frequency / 30) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{loc.frequency} visits</span>
                </div>
                <Link
                  href={`/dashboard/map?destination=${encodeURIComponent(loc.name)}`}
                  className="inline-flex items-center gap-1 mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Navigate here
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Map Preview */}
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
          <Link
            href="/dashboard/map"
            className="btn-secondary"
          >
            <Map className="w-5 h-5 mr-2" />
            View Interactive Map
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

