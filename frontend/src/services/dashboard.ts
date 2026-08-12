import type { DashboardStats, RecentLocation, UpcomingClass } from '@/types';
import { api } from './api';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>('/api/dashboard/stats');
  },

  async getUpcomingClasses(limit = 5): Promise<UpcomingClass[]> {
    return api.get<UpcomingClass[]>('/api/dashboard/upcoming-classes', {
      params: { limit },
    });
  },

  async getRecentLocations(limit = 6): Promise<RecentLocation[]> {
    return api.get<RecentLocation[]>('/api/dashboard/recent-locations', {
      params: { limit },
    });
  },
};
