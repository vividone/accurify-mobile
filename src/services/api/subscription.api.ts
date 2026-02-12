import apiClient from './client';
import type {
  ApiResponse,
  Subscription,
  InitializePaymentResponse,
  SubscriptionPlan,
  PaymentHistory,
} from '@/types';

const SUBSCRIPTION_BASE = '/subscription';

// Usage tracking types
export interface UsageItem {
  label: string;
  used: number;
  limit: number; // -1 means unlimited
  unlimited: boolean;
}

export interface UsageResponse {
  invoicesToday: UsageItem;
  totalClients: UsageItem;
  totalProducts: UsageItem;
  isPremium: boolean;
}

export const subscriptionApi = {
  // Get current subscription status
  get: async (): Promise<Subscription> => {
    const response =
      await apiClient.get<ApiResponse<Subscription>>(SUBSCRIPTION_BASE);
    return response.data.data!;
  },

  // Start free trial
  startTrial: async (): Promise<Subscription> => {
    const response = await apiClient.post<ApiResponse<Subscription>>(
      `${SUBSCRIPTION_BASE}/start-trial`
    );
    return response.data.data!;
  },

  // Initialize payment (get Paystack URL)
  initializePayment: async (
    plan: SubscriptionPlan
  ): Promise<InitializePaymentResponse> => {
    const response = await apiClient.post<
      ApiResponse<InitializePaymentResponse>
    >(`${SUBSCRIPTION_BASE}/initialize?plan=${plan}`);
    return response.data.data!;
  },

  // Cancel subscription
  cancel: async (): Promise<void> => {
    await apiClient.post(`${SUBSCRIPTION_BASE}/cancel`);
  },

  // Verify payment after Paystack redirect
  verifyPayment: async (reference: string): Promise<Subscription> => {
    const response = await apiClient.post<ApiResponse<Subscription>>(
      `${SUBSCRIPTION_BASE}/verify?reference=${reference}`
    );
    return response.data.data!;
  },

  // Get usage statistics
  getUsage: async (): Promise<UsageResponse> => {
    const response = await apiClient.get<ApiResponse<UsageResponse>>(
      `${SUBSCRIPTION_BASE}/usage`
    );
    return response.data.data!;
  },

  // Get payment history
  getHistory: async (page = 0, size = 20): Promise<PaymentHistory[]> => {
    const response = await apiClient.get<ApiResponse<PaymentHistory[]>>(
      `${SUBSCRIPTION_BASE}/history?page=${page}&size=${size}`
    );
    return response.data.data!;
  },
};
