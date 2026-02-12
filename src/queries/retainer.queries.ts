import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retainerApi } from '@/services/api/retainer.api';
import type { CreateSubscriptionRequest, SubmitDeliverableRequest } from '@/types/retainer.types';

export const retainerKeys = {
  all: ['retainer'] as const,
  tiers: () => [...retainerKeys.all, 'tiers'] as const,
  tier: (id: string) => [...retainerKeys.all, 'tier', id] as const,
  subscriptions: () => [...retainerKeys.all, 'subscriptions'] as const,
  subscription: (id: string) => [...retainerKeys.all, 'subscription', id] as const,
  businessSubscriptions: (businessId: string) => [...retainerKeys.all, 'business', businessId, 'subscriptions'] as const,
  accountantSubscriptions: () => [...retainerKeys.all, 'accountant', 'subscriptions'] as const,
  practiceDashboard: () => [...retainerKeys.all, 'practice-dashboard'] as const,
  accountantStats: () => [...retainerKeys.all, 'accountant-stats'] as const,
  deliverables: () => [...retainerKeys.all, 'deliverables'] as const,
  deliverable: (id: string) => [...retainerKeys.all, 'deliverable', id] as const,
  subscriptionDeliverables: (subscriptionId: string) => [...retainerKeys.all, 'subscription', subscriptionId, 'deliverables'] as const,
  pendingDeliverables: () => [...retainerKeys.all, 'pending-deliverables'] as const,
  deliverableHistory: (params?: object) => [...retainerKeys.all, 'deliverable-history', params] as const,
};

// ==================== Service Tiers ====================

export const useServiceTiers = () => {
  return useQuery({
    queryKey: retainerKeys.tiers(),
    queryFn: () => retainerApi.getTiers(),
  });
};

export const useServiceTier = (tierId: string) => {
  return useQuery({
    queryKey: retainerKeys.tier(tierId),
    queryFn: () => retainerApi.getTier(tierId),
    enabled: !!tierId,
  });
};

// ==================== Subscriptions ====================

export const useSubscription = (subscriptionId: string) => {
  return useQuery({
    queryKey: retainerKeys.subscription(subscriptionId),
    queryFn: () => retainerApi.getSubscription(subscriptionId),
    enabled: !!subscriptionId,
  });
};

export const useBusinessSubscriptions = (businessId: string) => {
  return useQuery({
    queryKey: retainerKeys.businessSubscriptions(businessId),
    queryFn: () => retainerApi.getBusinessSubscriptions(businessId),
    enabled: !!businessId,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => retainerApi.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.subscriptions() });
    },
  });
};

export const useInitializePayment = () => {
  return useMutation({
    mutationFn: ({ subscriptionId, callbackUrl }: { subscriptionId: string; callbackUrl: string }) =>
      retainerApi.initializePayment(subscriptionId, callbackUrl),
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reference: string) => retainerApi.verifyPayment(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: retainerKeys.accountantSubscriptions() });
    },
  });
};

export const usePauseSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) => retainerApi.pauseSubscription(subscriptionId),
    onSuccess: (_, subscriptionId) => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.subscription(subscriptionId) });
      queryClient.invalidateQueries({ queryKey: retainerKeys.accountantSubscriptions() });
      queryClient.invalidateQueries({ queryKey: retainerKeys.subscriptions() });
    },
  });
};

export const useResumeSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) => retainerApi.resumeSubscription(subscriptionId),
    onSuccess: (_, subscriptionId) => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.subscription(subscriptionId) });
      queryClient.invalidateQueries({ queryKey: retainerKeys.accountantSubscriptions() });
      queryClient.invalidateQueries({ queryKey: retainerKeys.subscriptions() });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, reason }: { subscriptionId: string; reason?: string }) =>
      retainerApi.cancelSubscription(subscriptionId, reason),
    onSuccess: (_, { subscriptionId }) => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.subscription(subscriptionId) });
      queryClient.invalidateQueries({ queryKey: retainerKeys.accountantSubscriptions() });
      queryClient.invalidateQueries({ queryKey: retainerKeys.subscriptions() });
    },
  });
};

export const useScheduleCancellation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, reason }: { subscriptionId: string; reason?: string }) =>
      retainerApi.scheduleCancellation(subscriptionId, reason),
    onSuccess: (_, { subscriptionId }) => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.subscription(subscriptionId) });
      queryClient.invalidateQueries({ queryKey: retainerKeys.accountantSubscriptions() });
      queryClient.invalidateQueries({ queryKey: retainerKeys.subscriptions() });
    },
  });
};

// ==================== Accountant Dashboard ====================

export const useAccountantSubscriptions = () => {
  return useQuery({
    queryKey: retainerKeys.accountantSubscriptions(),
    queryFn: () => retainerApi.getAccountantSubscriptions(),
  });
};

export const usePracticeDashboard = () => {
  return useQuery({
    queryKey: retainerKeys.practiceDashboard(),
    queryFn: () => retainerApi.getPracticeDashboard(),
  });
};

export const useAccountantStats = () => {
  return useQuery({
    queryKey: retainerKeys.accountantStats(),
    queryFn: () => retainerApi.getAccountantStats(),
  });
};

export const useCanAcceptClients = () => {
  return useQuery({
    queryKey: [...retainerKeys.all, 'can-accept-clients'],
    queryFn: () => retainerApi.canAcceptClients(),
  });
};

// ==================== Deliverables ====================

export const useDeliverable = (deliverableId: string) => {
  return useQuery({
    queryKey: retainerKeys.deliverable(deliverableId),
    queryFn: () => retainerApi.getDeliverable(deliverableId),
    enabled: !!deliverableId,
  });
};

export const useSubscriptionDeliverables = (subscriptionId: string) => {
  return useQuery({
    queryKey: retainerKeys.subscriptionDeliverables(subscriptionId),
    queryFn: () => retainerApi.getSubscriptionDeliverables(subscriptionId),
    enabled: !!subscriptionId,
  });
};

export const usePendingDeliverables = () => {
  return useQuery({
    queryKey: retainerKeys.pendingDeliverables(),
    queryFn: () => retainerApi.getPendingDeliverables(),
  });
};

export const useDeliverableHistory = (params: { page?: number; size?: number } = {}) => {
  return useQuery({
    queryKey: retainerKeys.deliverableHistory(params),
    queryFn: () => retainerApi.getDeliverableHistory(params),
  });
};

export const useStartWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deliverableId: string) => retainerApi.startWork(deliverableId),
    onSuccess: (_, deliverableId) => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.deliverable(deliverableId) });
      queryClient.invalidateQueries({ queryKey: retainerKeys.pendingDeliverables() });
      queryClient.invalidateQueries({ queryKey: retainerKeys.practiceDashboard() });
    },
  });
};

export const useSubmitDeliverable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deliverableId, data }: { deliverableId: string; data: SubmitDeliverableRequest }) =>
      retainerApi.submitDeliverable(deliverableId, data),
    onSuccess: (_, { deliverableId }) => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.deliverable(deliverableId) });
      queryClient.invalidateQueries({ queryKey: retainerKeys.pendingDeliverables() });
      queryClient.invalidateQueries({ queryKey: retainerKeys.practiceDashboard() });
      queryClient.invalidateQueries({ queryKey: retainerKeys.accountantStats() });
    },
  });
};

export const useApproveDeliverable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deliverableId: string) => retainerApi.approveDeliverable(deliverableId),
    onSuccess: (_, deliverableId) => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.deliverable(deliverableId) });
      queryClient.invalidateQueries({ queryKey: retainerKeys.practiceDashboard() });
      queryClient.invalidateQueries({ queryKey: retainerKeys.accountantStats() });
    },
  });
};

export const useRequestRevision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deliverableId, notes }: { deliverableId: string; notes: string }) =>
      retainerApi.requestRevision(deliverableId, notes),
    onSuccess: (_, { deliverableId }) => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.deliverable(deliverableId) });
      queryClient.invalidateQueries({ queryKey: retainerKeys.pendingDeliverables() });
    },
  });
};

// ==================== Admin Payout Management ====================

export const useReadyForPayout = () => {
  return useQuery({
    queryKey: [...retainerKeys.all, 'ready-for-payout'],
    queryFn: () => retainerApi.getReadyForPayout(),
  });
};

export const useMarkPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deliverableId, payoutReference }: { deliverableId: string; payoutReference: string }) =>
      retainerApi.markPaid(deliverableId, payoutReference),
    onSuccess: (_, { deliverableId }) => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.deliverable(deliverableId) });
      queryClient.invalidateQueries({ queryKey: [...retainerKeys.all, 'ready-for-payout'] });
      queryClient.invalidateQueries({ queryKey: retainerKeys.accountantStats() });
    },
  });
};
