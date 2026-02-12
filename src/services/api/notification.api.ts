import apiClient from './client';
import type { ApiResponse, PageResponse } from '@/types';
import type {
  NotificationResponse,
  NotificationCountResponse,
  MarkNotificationsReadRequest,
  BroadcastResponse,
  BroadcastRequest,
} from '@/types/notification.types';

const NOTIFICATIONS_BASE = '/notifications';
const ADMIN_NOTIFICATIONS_BASE = '/admin/notifications';

export interface GetNotificationsParams {
  page?: number;
  size?: number;
  unreadOnly?: boolean;
}

export interface GetBroadcastsParams {
  page?: number;
  size?: number;
}

export const notificationApi = {
  // =====================
  // User Notifications
  // =====================

  /**
   * Get paginated notifications for the current user.
   */
  getNotifications: async (
    params: GetNotificationsParams = {}
  ): Promise<PageResponse<NotificationResponse>> => {
    const response = await apiClient.get<
      ApiResponse<PageResponse<NotificationResponse>>
    >(NOTIFICATIONS_BASE, { params });
    return response.data.data!;
  },

  /**
   * Get recent notifications for dropdown display.
   */
  getRecentNotifications: async (): Promise<NotificationResponse[]> => {
    const response = await apiClient.get<ApiResponse<NotificationResponse[]>>(
      `${NOTIFICATIONS_BASE}/recent`
    );
    return response.data.data!;
  },

  /**
   * Get unread notification count.
   */
  getUnreadCount: async (): Promise<NotificationCountResponse> => {
    const response = await apiClient.get<ApiResponse<NotificationCountResponse>>(
      `${NOTIFICATIONS_BASE}/count`
    );
    return response.data.data!;
  },

  /**
   * Mark a single notification as read.
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.patch(`${NOTIFICATIONS_BASE}/${notificationId}/read`);
  },

  /**
   * Mark multiple notifications as read.
   */
  markMultipleAsRead: async (notificationIds: string[]): Promise<void> => {
    const request: MarkNotificationsReadRequest = { notificationIds };
    await apiClient.patch(`${NOTIFICATIONS_BASE}/read`, request);
  },

  /**
   * Mark all notifications as read.
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch(`${NOTIFICATIONS_BASE}/read-all`);
  },

  // =====================
  // Admin Broadcasts
  // =====================

  /**
   * Get all broadcasts (admin).
   */
  getBroadcasts: async (
    params: GetBroadcastsParams = {}
  ): Promise<PageResponse<BroadcastResponse>> => {
    const response = await apiClient.get<
      ApiResponse<PageResponse<BroadcastResponse>>
    >(`${ADMIN_NOTIFICATIONS_BASE}/broadcasts`, { params });
    return response.data.data!;
  },

  /**
   * Get broadcast by ID (admin).
   */
  getBroadcast: async (id: string): Promise<BroadcastResponse> => {
    const response = await apiClient.get<ApiResponse<BroadcastResponse>>(
      `${ADMIN_NOTIFICATIONS_BASE}/broadcasts/${id}`
    );
    return response.data.data!;
  },

  /**
   * Create a new broadcast (admin).
   */
  createBroadcast: async (
    request: BroadcastRequest
  ): Promise<BroadcastResponse> => {
    const response = await apiClient.post<ApiResponse<BroadcastResponse>>(
      `${ADMIN_NOTIFICATIONS_BASE}/broadcasts`,
      request
    );
    return response.data.data!;
  },

  /**
   * Update an existing broadcast (admin).
   */
  updateBroadcast: async (
    id: string,
    request: BroadcastRequest
  ): Promise<BroadcastResponse> => {
    const response = await apiClient.put<ApiResponse<BroadcastResponse>>(
      `${ADMIN_NOTIFICATIONS_BASE}/broadcasts/${id}`,
      request
    );
    return response.data.data!;
  },

  /**
   * Send a broadcast immediately (admin).
   */
  sendBroadcast: async (id: string): Promise<void> => {
    await apiClient.post(`${ADMIN_NOTIFICATIONS_BASE}/broadcasts/${id}/send`);
  },

  /**
   * Cancel a broadcast (admin).
   */
  cancelBroadcast: async (id: string): Promise<void> => {
    await apiClient.post(`${ADMIN_NOTIFICATIONS_BASE}/broadcasts/${id}/cancel`);
  },
};
