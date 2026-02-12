import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/services/api';
import { useSubscriptionStore } from '@/store/subscription.store';
import type { SubscriptionPlan } from '@/types';

export const subscriptionKeys = {
  all: ['subscription'] as const,
  usage: ['subscription', 'usage'] as const,
  history: ['subscription', 'history'] as const,
};

export function useSubscription() {
  const setSubscription = useSubscriptionStore((state) => state.setSubscription);

  return useQuery({
    queryKey: subscriptionKeys.all,
    queryFn: async () => {
      const data = await subscriptionApi.get();
      setSubscription(data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUsage() {
  return useQuery({
    queryKey: subscriptionKeys.usage,
    queryFn: () => subscriptionApi.getUsage(),
    staleTime: 1000 * 60 * 2, // 2 minutes - refresh more often for usage
  });
}

export function useInitializePayment() {
  return useMutation({
    mutationFn: (plan: SubscriptionPlan) =>
      subscriptionApi.initializePayment(plan),
  });
}

export function useStartTrial() {
  const queryClient = useQueryClient();
  const setSubscription = useSubscriptionStore((state) => state.setSubscription);

  return useMutation({
    mutationFn: () => subscriptionApi.startTrial(),
    onSuccess: (data) => {
      // Update Zustand store immediately
      setSubscription(data);
      // Also invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionApi.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function usePaymentHistory() {
  return useQuery({
    queryKey: subscriptionKeys.history,
    queryFn: () => subscriptionApi.getHistory(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
