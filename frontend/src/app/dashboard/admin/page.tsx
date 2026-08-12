'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  Megaphone,
  Navigation,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '@/services/admin';
import { useAuth } from '@/contexts/AuthContext';
import { cn, formatRelativeTime } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const ACTIVITY_STYLES: Record<string, { icon: React.ElementType; className: string }> = {
  user: { icon: UserCheck, className: 'bg-blue-100 text-blue-600' },
  alert: { icon: AlertTriangle, className: 'bg-red-100 text-red-600' },
  navigation: { icon: Navigation, className: 'bg-green-100 text-green-600' },
};

export default function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [broadcast, setBroadcast] = useState({ title: '', message: '' });

  const isAdmin = user?.role === 'admin';

  const { data: stats, error: statsError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats(),
    enabled: isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getUsers(),
    enabled: isAdmin,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: () => adminService.getActivity(),
    enabled: isAdmin,
  });

  const { data: alerts } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => adminService.getAlerts(true),
    enabled: isAdmin,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({
      userId,
      changes,
    }: {
      userId: string;
      changes: { role?: 'admin' | 'user'; accountStatus?: 'ACTIVE' | 'SUSPENDED' };
    }) => adminService.updateUser(userId, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const broadcastMutation = useMutation({
    mutationFn: () => adminService.broadcast(broadcast),
    onSuccess: (result) => {
      setBroadcast({ title: '', message: '' });
      toast.success(result.message);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // The dashboard layout already gates on authentication; this is the
  // in-page guard for the admin-only view.
  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-500">You do not have administrator privileges.</p>
      </div>
    );
  }

  if (statsError) {
    return (
      <ErrorMessage
        title="Could not load the admin panel"
        message={(statsError as Error).message}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['admin-stats'] })}
      />
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      change: stats ? `+${stats.newUsersThisWeek} this week` : '',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Navigations (7d)',
      value: stats?.navigationsThisWeek ?? 0,
      change: '',
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Buildings Mapped',
      value: stats?.buildingsMapped ?? 0,
      change: stats ? `${stats.graphNodes} graph nodes` : '',
      icon: Building2,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Active Alerts',
      value: stats?.activeAlerts ?? 0,
      change: '',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900/30',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 flex-wrap"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your VisionPath platform</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
          <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Admin</span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
            {stat.change && <p className="text-xs text-gray-400 mt-1">{stat.change}</p>}
          </motion.div>
        ))}
      </div>

      {/* Active alerts */}
      {(alerts?.length ?? 0) > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30">
          <h2 className="font-semibold flex items-center gap-2 mb-3 text-red-700 dark:text-red-300">
            <AlertTriangle className="w-5 h-5" />
            Active Emergency Alerts
          </h2>
          <ul className="space-y-2">
            {alerts?.map((alert) => (
              <li key={alert.id} className="text-sm flex items-center justify-between gap-3 flex-wrap">
                <span>
                  <strong className="capitalize">{alert.type}</strong> from{' '}
                  {alert.userName ?? 'a user'}
                  {alert.location.building ? ` at ${alert.location.building}` : ''}
                </span>
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(alert.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Broadcast */}
        <section className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-primary-500" />
            Send Notification
          </h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              broadcastMutation.mutate();
            }}
            className="space-y-3"
          >
            <input
              className="input-field"
              placeholder="Title"
              value={broadcast.title}
              onChange={(event) => setBroadcast({ ...broadcast, title: event.target.value })}
              required
              aria-label="Notification title"
            />
            <textarea
              className="input-field min-h-[96px]"
              placeholder="Message to every active user"
              value={broadcast.message}
              onChange={(event) => setBroadcast({ ...broadcast, message: event.target.value })}
              required
              aria-label="Notification message"
            />
            <button
              type="submit"
              disabled={broadcastMutation.isPending}
              className="btn-primary w-full"
            >
              {broadcastMutation.isPending ? 'Sending...' : 'Send to all users'}
            </button>
          </form>
        </section>

        {/* Activity */}
        <section className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            Recent Activity
          </h2>
          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {activityLoading && <LoadingSpinner size="sm" text="Loading activity..." />}
            {activity?.length === 0 && (
              <p className="text-sm text-gray-500">No activity recorded yet.</p>
            )}
            {activity?.map((event, index) => {
              const style = ACTIVITY_STYLES[event.type] ?? ACTIVITY_STYLES.navigation;
              const Icon = style.icon;
              return (
                <div
                  key={`${event.action}-${index}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      style.className
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.action}</p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Users */}
      <section className="rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <h2 className="font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            Users
          </h2>
        </div>
        <div className="overflow-x-auto">
          {usersLoading ? (
            <div className="p-6">
              <LoadingSpinner size="sm" text="Loading users..." />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-dark-border/40 text-left">
                <tr>
                  <th className="p-3 font-semibold">Name</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Mode</th>
                  <th className="p-3 font-semibold">Role</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {users?.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3 text-gray-500">{item.email}</td>
                    <td className="p-3 text-gray-500 capitalize">
                      {item.accessibilityMode.replace('-', ' ')}
                    </td>
                    <td className="p-3">
                      <select
                        value={item.role}
                        onChange={(event) =>
                          updateUserMutation.mutate({
                            userId: item.id,
                            changes: { role: event.target.value as 'admin' | 'user' },
                          })
                        }
                        disabled={item.id === user?.id}
                        className="text-sm bg-transparent border border-gray-200 dark:border-dark-border rounded-lg px-2 py-1 disabled:opacity-50"
                        aria-label={`Role for ${item.name}`}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          updateUserMutation.mutate({
                            userId: item.id,
                            changes: {
                              accountStatus:
                                item.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                            },
                          })
                        }
                        disabled={item.id === user?.id}
                        className={cn(
                          'text-xs px-2 py-1 rounded-full font-medium disabled:opacity-50',
                          item.accountStatus === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        )}
                      >
                        {item.accountStatus}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
