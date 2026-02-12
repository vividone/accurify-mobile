import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  SubscriptionPlanResponse,
  SubscriptionPlanRequest,
  DiscountCodeResponse,
  DiscountCodeRequest,
  DiscountCodesParams,
  ApplyDiscountRequest,
  ApplyDiscountResponse,
} from '@/types';

const ADMIN_BASE = '/admin/pricing';
const SUBSCRIPTION_BASE = '/subscription';

export const pricingApi = {
  // ==================== Public Endpoints ====================

  /**
   * Get all active subscription plans (for pricing page)
   */
  getActivePlans: async (): Promise<SubscriptionPlanResponse[]> => {
    const response = await apiClient.get<ApiResponse<SubscriptionPlanResponse[]>>(
      `${SUBSCRIPTION_BASE}/plans`
    );
    return response.data.data!;
  },

  /**
   * Apply a discount code to a plan
   */
  applyDiscount: async (data: ApplyDiscountRequest): Promise<ApplyDiscountResponse> => {
    const response = await apiClient.post<ApiResponse<ApplyDiscountResponse>>(
      `${SUBSCRIPTION_BASE}/apply-discount`,
      data
    );
    return response.data.data!;
  },

  // ==================== Admin Plan Endpoints ====================

  /**
   * Get all subscription plans (including inactive) - admin only
   */
  getAllPlans: async (): Promise<SubscriptionPlanResponse[]> => {
    const response = await apiClient.get<ApiResponse<SubscriptionPlanResponse[]>>(
      `${ADMIN_BASE}/plans`
    );
    return response.data.data!;
  },

  /**
   * Get a subscription plan by ID - admin only
   */
  getPlan: async (planId: string): Promise<SubscriptionPlanResponse> => {
    const response = await apiClient.get<ApiResponse<SubscriptionPlanResponse>>(
      `${ADMIN_BASE}/plans/${planId}`
    );
    return response.data.data!;
  },

  /**
   * Create a new subscription plan - admin only
   */
  createPlan: async (data: SubscriptionPlanRequest): Promise<SubscriptionPlanResponse> => {
    const response = await apiClient.post<ApiResponse<SubscriptionPlanResponse>>(
      `${ADMIN_BASE}/plans`,
      data
    );
    return response.data.data!;
  },

  /**
   * Update a subscription plan - admin only
   */
  updatePlan: async (planId: string, data: SubscriptionPlanRequest): Promise<SubscriptionPlanResponse> => {
    const response = await apiClient.put<ApiResponse<SubscriptionPlanResponse>>(
      `${ADMIN_BASE}/plans/${planId}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Activate a subscription plan - admin only
   */
  activatePlan: async (planId: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`${ADMIN_BASE}/plans/${planId}/activate`);
  },

  /**
   * Deactivate a subscription plan - admin only
   */
  deactivatePlan: async (planId: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`${ADMIN_BASE}/plans/${planId}/deactivate`);
  },

  // ==================== Admin Discount Code Endpoints ====================

  /**
   * Get all discount codes - admin only
   */
  getDiscountCodes: async (params: DiscountCodesParams = {}): Promise<PageResponse<DiscountCodeResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<DiscountCodeResponse>>>(
      `${ADMIN_BASE}/discounts`,
      { params }
    );
    return response.data.data!;
  },

  /**
   * Get a discount code by ID - admin only
   */
  getDiscountCode: async (codeId: string): Promise<DiscountCodeResponse> => {
    const response = await apiClient.get<ApiResponse<DiscountCodeResponse>>(
      `${ADMIN_BASE}/discounts/${codeId}`
    );
    return response.data.data!;
  },

  /**
   * Create a new discount code - admin only
   */
  createDiscountCode: async (data: DiscountCodeRequest): Promise<DiscountCodeResponse> => {
    const response = await apiClient.post<ApiResponse<DiscountCodeResponse>>(
      `${ADMIN_BASE}/discounts`,
      data
    );
    return response.data.data!;
  },

  /**
   * Update a discount code - admin only
   */
  updateDiscountCode: async (codeId: string, data: DiscountCodeRequest): Promise<DiscountCodeResponse> => {
    const response = await apiClient.put<ApiResponse<DiscountCodeResponse>>(
      `${ADMIN_BASE}/discounts/${codeId}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Activate a discount code - admin only
   */
  activateDiscountCode: async (codeId: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`${ADMIN_BASE}/discounts/${codeId}/activate`);
  },

  /**
   * Deactivate a discount code - admin only
   */
  deactivateDiscountCode: async (codeId: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`${ADMIN_BASE}/discounts/${codeId}/deactivate`);
  },

  /**
   * Delete a discount code - admin only (only if unused)
   */
  deleteDiscountCode: async (codeId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`${ADMIN_BASE}/discounts/${codeId}`);
  },
};
