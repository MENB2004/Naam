import { apiRequest } from './api';
import {
  Alert,
  PublicAlert,
  AlertCreatePayload,
  Notification,
  NotificationListResponse,
} from '../types/alert';

export const alertService = {
  getAlerts: async (district?: string, includeAll: boolean = false): Promise<PublicAlert[]> => {
    const query = new URLSearchParams();
    if (district && district !== 'ALL') query.append('district', district);
    if (includeAll) query.append('include_all', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<PublicAlert[]>(`/alerts${qs}`);
  },

  broadcastAlert: async (payload: AlertCreatePayload): Promise<Alert> => {
    return apiRequest<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deactivateAlert: async (alertId: string): Promise<Alert> => {
    return apiRequest<Alert>(`/alerts/${alertId}/deactivate`, {
      method: 'PATCH',
    });
  },

  getMyNotifications: async (limit: number = 50): Promise<NotificationListResponse> => {
    return apiRequest<NotificationListResponse>(`/notifications?limit=${limit}`);
  },

  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    return apiRequest<{ unread_count: number }>('/notifications/unread-count');
  },

  markNotificationRead: async (notificationId: string): Promise<Notification> => {
    return apiRequest<Notification>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  markAllRead: async (): Promise<{ unread_count: number }> => {
    return apiRequest<{ unread_count: number }>('/notifications/mark-all-read', {
      method: 'POST',
    });
  },
};
