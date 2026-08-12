import type { AppNotification, NotificationList } from '@/types';
import { api } from './api';

export const notificationService = {
  async list(unreadOnly = false, limit = 50): Promise<NotificationList> {
    return api.get<NotificationList>('/api/notifications', {
      params: { unreadOnly, limit },
    });
  },

  async markRead(notificationId: string): Promise<AppNotification> {
    return api.post<AppNotification>(`/api/notifications/${notificationId}/read`);
  },

  async markAllRead(): Promise<{ updated: number }> {
    return api.post<{ updated: number }>('/api/notifications/read-all');
  },

  async remove(notificationId: string): Promise<void> {
    await api.delete(`/api/notifications/${notificationId}`);
  },
};
