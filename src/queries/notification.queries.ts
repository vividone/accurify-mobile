import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  notificationApi,
  type GetNotificationsParams,
  type GetBroadcastsParams,
} from '@/services/api/notification.api';
import type { BroadcastRequest } from '@/types/notification.types';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: GetNotificationsParams) =>
    [...notificationKeys.lists(), params] as const,
  recent: () => [...notificationKeys.all, 'recent'] as const,
  count: () => [...notificationKeys.all, 'count'] as const,
  broadcasts: () => [...notificationKeys.all, 'broadcasts'] as const,
  broadcastList: (params: GetBroadcastsParams) =>
    [...notificationKeys.broadcasts(), 'list', params] as const,
  broadcast: (id: string) => [...notificationKeys.broadcasts(), id] as const,
};

// =====================
// User Notification Hooks
// =====================

/**
 * Hook to fetch paginated notifications.
 */
export function useNotifications(params: GetNotificationsParams = {}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationApi.getNotifications(params),
  });
}

/**
 * Hook to fetch recent notifications for dropdown.
 */
export function useRecentNotifications() {
  return useQuery({
    queryKey: notificationKeys.recent(),
    queryFn: () => notificationApi.getRecentNotifications(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to fetch unread notification count.
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.count(),
    queryFn: () => notificationApi.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to mark a single notification as read.
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to mark multiple notifications as read.
 */
export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: string[]) =>
      notificationApi.markMultipleAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to mark all notifications as read.
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

// =====================
// Admin Broadcast Hooks
// =====================

/**
 * Hook to fetch paginated broadcasts (admin).
 */
export function useBroadcasts(params: GetBroadcastsParams = {}) {
  return useQuery({
    queryKey: notificationKeys.broadcastList(params),
    queryFn: () => notificationApi.getBroadcasts(params),
  });
}

/**
 * Hook to fetch a single broadcast (admin).
 */
export function useBroadcast(id: string) {
  return useQuery({
    queryKey: notificationKeys.broadcast(id),
    queryFn: () => notificationApi.getBroadcast(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new broadcast (admin).
 */
export function useCreateBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BroadcastRequest) =>
      notificationApi.createBroadcast(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.broadcasts() });
    },
  });
}

/**
 * Hook to update a broadcast (admin).
 */
export function useUpdateBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: BroadcastRequest }) =>
      notificationApi.updateBroadcast(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.broadcasts() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.broadcast(id) });
    },
  });
}

/**
 * Hook to send a broadcast (admin).
 */
export function useSendBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.sendBroadcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.broadcasts() });
    },
  });
}

/**
 * Hook to cancel a broadcast (admin).
 */
export function useCancelBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.cancelBroadcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.broadcasts() });
    },
  });
}
