'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  BookOpen,
  Calendar,
  AlertTriangle,
  Navigation,
  Info,
  CheckCheck,
  Trash2,
  Clock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';
import toast from 'react-hot-toast';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'class':
      return BookOpen;
    case 'event':
      return Calendar;
    case 'emergency':
      return AlertTriangle;
    case 'navigation':
      return Navigation;
    case 'system':
      return Info;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'class':
      return 'text-primary-600 bg-primary-100 dark:bg-primary-900/30';
    case 'event':
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
    case 'emergency':
      return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    case 'navigation':
      return 'text-accent-600 bg-accent-100 dark:bg-accent-900/30';
    case 'system':
      return 'text-gray-600 bg-gray-100 dark:bg-dark-border';
  }
};

export default function NotificationsPage() {
  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: dashboardService.getNotifications,
  });

  const handleMarkAllRead = async () => {
    await dashboardService.markAllNotificationsRead();
    refetch();
    toast.success('All notifications marked as read');
  };

  const handleMarkRead = async (id: string) => {
    await dashboardService.markNotificationRead(id);
    refetch();
  };

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount} unread notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="btn-ghost text-sm"
            disabled={unreadCount === 0}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all read
          </button>
          <button className="btn-ghost text-sm text-gray-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Notification List */}
      <div className="space-y-3">
        {notifications?.map((notification, index) => {
          const Icon = getNotificationIcon(notification.type);
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'p-4 rounded-2xl border transition-all duration-200',
                notification.read
                  ? 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border'
                  : 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-900/30 shadow-sm'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  getNotificationColor(notification.type)
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={cn(
                        'text-sm',
                        !notification.read && 'font-semibold'
                      )}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          className="p-1 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                          aria-label="Mark as read"
                        >
                          <CheckCheck className="w-4 h-4 text-primary-500" />
                        </button>
                      )}
                    </div>
                  </div>
                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View details →
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {(!notifications || notifications.length === 0) && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

