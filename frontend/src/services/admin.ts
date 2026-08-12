import type { ActivityEvent, AdminStats, EmergencyAlert, User } from '@/types';
import { api } from './api';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    return api.get<AdminStats>('/api/admin/stats');
  },

  async getUsers(limit = 100): Promise<User[]> {
    return api.get<User[]>('/api/admin/users', { params: { limit } });
  },

  async updateUser(
    userId: string,
    changes: { role?: 'admin' | 'user'; accountStatus?: 'ACTIVE' | 'SUSPENDED' }
  ): Promise<User> {
    return api.patch<User>(`/api/admin/users/${userId}`, changes);
  },

  async getAlerts(activeOnly = false): Promise<EmergencyAlert[]> {
    return api.get<EmergencyAlert[]>('/api/admin/alerts', { params: { activeOnly } });
  },

  async getActivity(limit = 15): Promise<ActivityEvent[]> {
    return api.get<ActivityEvent[]>('/api/admin/activity', { params: { limit } });
  },

  async broadcast(input: {
    title: string;
    message: string;
    type?: 'class' | 'event' | 'emergency' | 'navigation' | 'system';
    actionUrl?: string;
  }): Promise<{ sent: number; message: string }> {
    return api.post('/api/admin/notifications', { type: 'system', ...input });
  },
};
