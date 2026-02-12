/**
 * Addon subscription API service.
 */
import apiClient from './client';
import type {
  AddonType,
  AddonStatusResponse,
  AddonSubscription,
  AddonSubscribeRequest,
  AddonPaymentInitResponse,
  AddonCancelRequest,
} from '@/types/addon.types';
import type { ApiResponse } from '@/types/api.types';

const ADDON_BASE = '/addons';

export const addonApi = {
  /**
   * Get all addon information and subscription status.
   */
  getStatus: async (): Promise<ApiResponse<AddonStatusResponse>> => {
    const response = await apiClient.get<ApiResponse<AddonStatusResponse>>(ADDON_BASE);
    return response.data;
  },

  /**
   * Get a specific addon subscription.
   */
  getSubscription: async (addonType: AddonType): Promise<ApiResponse<AddonSubscription>> => {
    const response = await apiClient.get<ApiResponse<AddonSubscription>>(
      `${ADDON_BASE}/${addonType}`
    );
    return response.data;
  },

  /**
   * Subscribe to an addon (initiates payment for paid addons).
   */
  subscribe: async (
    request: AddonSubscribeRequest
  ): Promise<ApiResponse<AddonPaymentInitResponse>> => {
    const response = await apiClient.post<ApiResponse<AddonPaymentInitResponse>>(
      `${ADDON_BASE}/subscribe`,
      request
    );
    return response.data;
  },

  /**
   * Activate a free addon (like Accurify Pay).
   */
  activateFreeAddon: async (addonType: AddonType): Promise<ApiResponse<AddonSubscription>> => {
    const response = await apiClient.post<ApiResponse<AddonSubscription>>(
      `${ADDON_BASE}/${addonType}/activate-free`
    );
    return response.data;
  },

  /**
   * Cancel an addon subscription.
   */
  cancel: async (request: AddonCancelRequest): Promise<ApiResponse<AddonSubscription>> => {
    const response = await apiClient.post<ApiResponse<AddonSubscription>>(
      `${ADDON_BASE}/cancel`,
      request
    );
    return response.data;
  },

  /**
   * Resume a cancelled addon subscription.
   */
  resume: async (addonType: AddonType): Promise<ApiResponse<AddonSubscription>> => {
    const response = await apiClient.post<ApiResponse<AddonSubscription>>(
      `${ADDON_BASE}/${addonType}/resume`
    );
    return response.data;
  },

  /**
   * Check if the business has access to a specific addon.
   */
  checkAccess: async (addonType: AddonType): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.get<ApiResponse<boolean>>(
      `${ADDON_BASE}/${addonType}/access`
    );
    return response.data;
  },

  /**
   * Verify a payment and activate the addon subscription.
   */
  verifyPayment: async (reference: string): Promise<ApiResponse<AddonSubscription>> => {
    const response = await apiClient.post<ApiResponse<AddonSubscription>>(
      `${ADDON_BASE}/verify-payment`,
      null,
      { params: { reference } }
    );
    return response.data;
  },
};

export default addonApi;
