'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Map,
  Bell,
  BarChart3,
  Shield,
  Upload,
  Settings,
  ChevronRight,
  TrendingUp,
  Activity,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const adminStats = [
  { label: 'Total Users', value: '1,247', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { label: 'Active Navigations', value: '89', change: '+5%', icon: Activity, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  { label: 'Buildings Mapped', value: '12', change: '+2', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  { label: 'Emergency Alerts', value: '3', change: '-1', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
];

const adminActions = [
  { label: 'Manage Users', icon: Users, description: 'View, edit, and manage user accounts', href: '#' },
  { label: 'Manage Buildings', icon: Building2, description: 'Add and configure campus buildings', href: '#' },
  { label: 'Floor Plans', icon: Map, description: 'Upload and manage floor plan maps', href: '#' },
  { label: 'Upload Maps', icon: Upload, description: 'Upload indoor navigation maps', href: '#' },
  { label: 'Emergency Notifications', icon: Bell, description: 'Send emergency alerts to users', href: '#' },
  { label: 'Analytics', icon: BarChart3, description: 'View platform usage analytics', href: '#' },
];

export default function AdminPage() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your VisionPath platform
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
          <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Admin</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Admin Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border card-hover text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 p-3 mb-3 shadow-lg">
              <action.icon className="w-full h-full text-white" />
            </div>
            <h3 className="font-semibold mb-1">{action.label}</h3>
            <p className="text-sm text-gray-500">{action.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
      >
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary-500" />
          Recent Activity
        </h2>
        <div className="space-y-3">
          {[
            { action: 'New user registered', time: '2 min ago', type: 'user' },
            { action: 'Building map updated: Engineering Block', time: '15 min ago', type: 'map' },
            { action: 'Emergency drill notification sent', time: '1 hour ago', type: 'alert' },
            { action: 'Floor plan uploaded: Science Block - Floor 2', time: '2 hours ago', type: 'upload' },
            { action: 'User reported issue with navigation', time: '3 hours ago', type: 'report' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'map' ? 'bg-purple-100 text-purple-600' :
                activity.type === 'alert' ? 'bg-red-100 text-red-600' :
                activity.type === 'upload' ? 'bg-green-100 text-green-600' :
                'bg-yellow-100 text-yellow-600'
              )}>
                {activity.type === 'user' ? <UserCheck className="w-4 h-4" /> :
                 activity.type === 'map' ? <Map className="w-4 h-4" /> :
                 activity.type === 'alert' ? <AlertTriangle className="w-4 h-4" /> :
                 <Activity className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

