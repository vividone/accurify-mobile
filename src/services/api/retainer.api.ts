import apiClient from './client';
import type { ApiResponse, PageResponse } from '@/types';
import type {
  ServiceTier,
  AccountantSubscription,
  MonthlyDeliverable,
  AccountantStats,
  PracticeDashboard,
  CreateSubscriptionRequest,
  SubmitDeliverableRequest,
} from '@/types/retainer.types';

const RETAINER_BASE = '/retainer';
const DELIVERABLE_BASE = '/deliverables';

export const retainerApi = {
  // ==================== Service Tiers ====================

  getTiers: async (): Promise<ServiceTier[]> => {
    const response = await apiClient.get<ApiResponse<ServiceTier[]>>(`${RETAINER_BASE}/tiers`);
    return response.data.data!;
  },

  getTier: async (tierId: string): Promise<ServiceTier> => {
    const response = await apiClient.get<ApiResponse<ServiceTier>>(`${RETAINER_BASE}/tiers/${tierId}`);
    return response.data.data!;
  },

  // ==================== Subscriptions ====================

  createSubscription: async (data: CreateSubscriptionRequest): Promise<AccountantSubscription> => {
    const response = await apiClient.post<ApiResponse<AccountantSubscription>>(
      `${RETAINER_BASE}/subscriptions`,
      data
    );
    return response.data.data!;
  },

  initializePayment: async (
    subscriptionId: string,
    callbackUrl: string
  ): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> => {
    const response = await apiClient.post<
      ApiResponse<{ authorizationUrl: string; accessCode: string; reference: string }>
    >(`${RETAINER_BASE}/subscriptions/${subscriptionId}/initialize-payment`, null, {
      params: { callbackUrl },
    });
    return response.data.data!;
  },

  verifyPayment: async (reference: string): Promise<AccountantSubscription> => {
    const response = await apiClient.post<ApiResponse<AccountantSubscription>>(
      `${RETAINER_BASE}/subscriptions/verify-payment`,
      null,
      { params: { reference } }
    );
    return response.data.data!;
  },

  activateSubscription: async (subscriptionId: string, paystackCode: string): Promise<AccountantSubscription> => {
    const response = await apiClient.post<ApiResponse<AccountantSubscription>>(
      `${RETAINER_BASE}/subscriptions/${subscriptionId}/activate`,
      null,
      { params: { paystackSubscriptionCode: paystackCode } }
    );
    return response.data.data!;
  },

  pauseSubscription: async (subscriptionId: string): Promise<AccountantSubscription> => {
    const response = await apiClient.post<ApiResponse<AccountantSubscription>>(
      `${RETAINER_BASE}/subscriptions/${subscriptionId}/pause`
    );
    return response.data.data!;
  },

  resumeSubscription: async (subscriptionId: string): Promise<AccountantSubscription> => {
    const response = await apiClient.post<ApiResponse<AccountantSubscription>>(
      `${RETAINER_BASE}/subscriptions/${subscriptionId}/resume`
    );
    return response.data.data!;
  },

  cancelSubscription: async (subscriptionId: string, reason?: string): Promise<AccountantSubscription> => {
    const response = await apiClient.post<ApiResponse<AccountantSubscription>>(
      `${RETAINER_BASE}/subscriptions/${subscriptionId}/cancel`,
      null,
      { params: { reason } }
    );
    return response.data.data!;
  },

  scheduleCancellation: async (subscriptionId: string, reason?: string): Promise<AccountantSubscription> => {
    const response = await apiClient.post<ApiResponse<AccountantSubscription>>(
      `${RETAINER_BASE}/subscriptions/${subscriptionId}/schedule-cancellation`,
      null,
      { params: { reason } }
    );
    return response.data.data!;
  },

  getSubscription: async (subscriptionId: string): Promise<AccountantSubscription> => {
    const response = await apiClient.get<ApiResponse<AccountantSubscription>>(
      `${RETAINER_BASE}/subscriptions/${subscriptionId}`
    );
    return response.data.data!;
  },

  getBusinessSubscriptions: async (businessId: string): Promise<AccountantSubscription[]> => {
    const response = await apiClient.get<ApiResponse<AccountantSubscription[]>>(
      `${RETAINER_BASE}/subscriptions/business/${businessId}`
    );
    return response.data.data!;
  },

  getActiveBusinessSubscription: async (businessId: string): Promise<AccountantSubscription> => {
    const response = await apiClient.get<ApiResponse<AccountantSubscription>>(
      `${RETAINER_BASE}/subscriptions/business/${businessId}/active`
    );
    return response.data.data!;
  },

  // ==================== Accountant Dashboard ====================

  getAccountantSubscriptions: async (): Promise<AccountantSubscription[]> => {
    const response = await apiClient.get<ApiResponse<AccountantSubscription[]>>(
      `${RETAINER_BASE}/accountant/subscriptions`
    );
    return response.data.data!;
  },

  getPracticeDashboard: async (): Promise<PracticeDashboard> => {
    const response = await apiClient.get<ApiResponse<PracticeDashboard>>(
      `${RETAINER_BASE}/accountant/dashboard`
    );
    return response.data.data!;
  },

  getAccountantStats: async (): Promise<AccountantStats> => {
    const response = await apiClient.get<ApiResponse<AccountantStats>>(
      `${RETAINER_BASE}/accountant/stats`
    );
    return response.data.data!;
  },

  getClientCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<number>>(
      `${RETAINER_BASE}/accountant/client-count`
    );
    return response.data.data!;
  },

  canAcceptClients: async (): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<boolean>>(
      `${RETAINER_BASE}/accountant/can-accept-clients`
    );
    return response.data.data!;
  },

  // ==================== Deliverables ====================

  getDeliverable: async (deliverableId: string): Promise<MonthlyDeliverable> => {
    const response = await apiClient.get<ApiResponse<MonthlyDeliverable>>(
      `${DELIVERABLE_BASE}/${deliverableId}`
    );
    return response.data.data!;
  },

  getSubscriptionDeliverables: async (subscriptionId: string): Promise<MonthlyDeliverable[]> => {
    const response = await apiClient.get<ApiResponse<MonthlyDeliverable[]>>(
      `${DELIVERABLE_BASE}/subscription/${subscriptionId}`
    );
    return response.data.data!;
  },

  getCurrentDeliverable: async (subscriptionId: string): Promise<MonthlyDeliverable> => {
    const response = await apiClient.get<ApiResponse<MonthlyDeliverable>>(
      `${DELIVERABLE_BASE}/subscription/${subscriptionId}/current`
    );
    return response.data.data!;
  },

  getPendingDeliverables: async (): Promise<MonthlyDeliverable[]> => {
    const response = await apiClient.get<ApiResponse<MonthlyDeliverable[]>>(
      `${DELIVERABLE_BASE}/accountant/pending`
    );
    return response.data.data!;
  },

  getDeliverableHistory: async (params: { page?: number; size?: number } = {}): Promise<PageResponse<MonthlyDeliverable>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<MonthlyDeliverable>>>(
      `${DELIVERABLE_BASE}/accountant/history`,
      { params }
    );
    return response.data.data!;
  },

  startWork: async (deliverableId: string): Promise<MonthlyDeliverable> => {
    const response = await apiClient.post<ApiResponse<MonthlyDeliverable>>(
      `${DELIVERABLE_BASE}/${deliverableId}/start`
    );
    return response.data.data!;
  },

  submitDeliverable: async (deliverableId: string, data: SubmitDeliverableRequest): Promise<MonthlyDeliverable> => {
    const response = await apiClient.post<ApiResponse<MonthlyDeliverable>>(
      `${DELIVERABLE_BASE}/${deliverableId}/submit`,
      data
    );
    return response.data.data!;
  },

  approveDeliverable: async (deliverableId: string): Promise<MonthlyDeliverable> => {
    const response = await apiClient.post<ApiResponse<MonthlyDeliverable>>(
      `${DELIVERABLE_BASE}/${deliverableId}/approve`
    );
    return response.data.data!;
  },

  requestRevision: async (deliverableId: string, notes: string): Promise<MonthlyDeliverable> => {
    const response = await apiClient.post<ApiResponse<MonthlyDeliverable>>(
      `${DELIVERABLE_BASE}/${deliverableId}/request-revision`,
      null,
      { params: { notes } }
    );
    return response.data.data!;
  },

  rejectDeliverable: async (deliverableId: string, reason: string): Promise<MonthlyDeliverable> => {
    const response = await apiClient.post<ApiResponse<MonthlyDeliverable>>(
      `${DELIVERABLE_BASE}/${deliverableId}/reject`,
      null,
      { params: { reason } }
    );
    return response.data.data!;
  },

  // ==================== Admin Payout Management ====================

  getReadyForPayout: async (): Promise<MonthlyDeliverable[]> => {
    const response = await apiClient.get<ApiResponse<MonthlyDeliverable[]>>(
      `${DELIVERABLE_BASE}/ready-for-payout`
    );
    return response.data.data!;
  },

  markPaid: async (deliverableId: string, payoutReference: string): Promise<MonthlyDeliverable> => {
    const response = await apiClient.post<ApiResponse<MonthlyDeliverable>>(
      `${DELIVERABLE_BASE}/${deliverableId}/mark-paid`,
      null,
      { params: { payoutReference } }
    );
    return response.data.data!;
  },
};
