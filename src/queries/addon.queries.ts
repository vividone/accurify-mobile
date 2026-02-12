/**
 * React Query hooks for addon subscriptions.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addonApi } from '@/services/api/addon.api';
import type { AddonType, AddonSubscribeRequest, AddonCancelRequest } from '@/types/addon.types';

// ==================== Query Keys ====================

export const addonKeys = {
  all: ['addons'] as const,
  status: () => [...addonKeys.all, 'status'] as const,
  subscription: (addonType: AddonType) => [...addonKeys.all, 'subscription', addonType] as const,
  access: (addonType: AddonType) => [...addonKeys.all, 'access', addonType] as const,
};

// ==================== Queries ====================

/**
 * Get all addon information and subscription status.
 */
export function useAddonStatus() {
  return useQuery({
    queryKey: addonKeys.status(),
    queryFn: async () => {
      const response = await addonApi.getStatus();
      return response.data;
    },
  });
}

/**
 * Get a specific addon subscription.
 */
export function useAddonSubscription(addonType: AddonType) {
  return useQuery({
    queryKey: addonKeys.subscription(addonType),
    queryFn: async () => {
      const response = await addonApi.getSubscription(addonType);
      return response.data;
    },
  });
}

/**
 * Check if the business has access to a specific addon.
 */
export function useAddonAccess(addonType: AddonType) {
  return useQuery({
    queryKey: addonKeys.access(addonType),
    queryFn: async () => {
      const response = await addonApi.checkAccess(addonType);
      return response.data;
    },
  });
}

// ==================== Mutations ====================

/**
 * Subscribe to an addon.
 */
export function useSubscribeAddon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddonSubscribeRequest) => addonApi.subscribe(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addonKeys.all });
    },
  });
}

/**
 * Activate a free addon (like Accurify Pay).
 */
export function useActivateFreeAddon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addonType: AddonType) => addonApi.activateFreeAddon(addonType),
    onSuccess: (_, addonType) => {
      queryClient.invalidateQueries({ queryKey: addonKeys.all });
      queryClient.invalidateQueries({ queryKey: addonKeys.subscription(addonType) });
      queryClient.invalidateQueries({ queryKey: addonKeys.access(addonType) });
    },
  });
}

/**
 * Cancel an addon subscription.
 */
export function useCancelAddon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddonCancelRequest) => addonApi.cancel(request),
    onSuccess: (_, request) => {
      queryClient.invalidateQueries({ queryKey: addonKeys.all });
      queryClient.invalidateQueries({ queryKey: addonKeys.subscription(request.addonType) });
    },
  });
}

/**
 * Resume a cancelled addon subscription.
 */
export function useResumeAddon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addonType: AddonType) => addonApi.resume(addonType),
    onSuccess: (_, addonType) => {
      queryClient.invalidateQueries({ queryKey: addonKeys.all });
      queryClient.invalidateQueries({ queryKey: addonKeys.subscription(addonType) });
    },
  });
}
