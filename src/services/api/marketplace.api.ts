import apiClient from './client';
import type { ApiResponse, Industry } from '@/types';
import type {
  AccountantProfile,
  UpdateAccountantProfileRequest,
  PayoutSettingsResponse,
  UpdatePayoutSettingsRequest,
} from '@/types/marketplace.types';

const MARKETPLACE_BASE = '/marketplace';

export const marketplaceApi = {
  // ==================== Public Marketplace ====================

  /**
   * Get all available accountants for hire
   */
  getAvailableAccountants: async (): Promise<AccountantProfile[]> => {
    const response = await apiClient.get<ApiResponse<AccountantProfile[]>>(
      `${MARKETPLACE_BASE}/accountants`
    );
    return response.data.data!;
  },

  /**
   * Get a specific accountant's profile
   */
  getAccountantProfile: async (accountantId: string): Promise<AccountantProfile> => {
    const response = await apiClient.get<ApiResponse<AccountantProfile>>(
      `${MARKETPLACE_BASE}/accountants/${accountantId}`
    );
    return response.data.data!;
  },

  /**
   * Search accountants by name or title
   */
  searchAccountants: async (query?: string): Promise<AccountantProfile[]> => {
    const response = await apiClient.get<ApiResponse<AccountantProfile[]>>(
      `${MARKETPLACE_BASE}/accountants/search`,
      { params: { query } }
    );
    return response.data.data!;
  },

  /**
   * Get accountants by industry specialization
   */
  getAccountantsByIndustry: async (industry: Industry): Promise<AccountantProfile[]> => {
    const response = await apiClient.get<ApiResponse<AccountantProfile[]>>(
      `${MARKETPLACE_BASE}/accountants/by-industry/${industry}`
    );
    return response.data.data!;
  },

  // ==================== Accountant Profile Management ====================

  /**
   * Get the current accountant's profile
   */
  getMyProfile: async (): Promise<AccountantProfile> => {
    const response = await apiClient.get<ApiResponse<AccountantProfile>>(
      `${MARKETPLACE_BASE}/profile/me`
    );
    return response.data.data!;
  },

  /**
   * Update the current accountant's profile
   */
  updateMyProfile: async (data: UpdateAccountantProfileRequest): Promise<AccountantProfile> => {
    const response = await apiClient.put<ApiResponse<AccountantProfile>>(
      `${MARKETPLACE_BASE}/profile/me`,
      data
    );
    return response.data.data!;
  },

  // ==================== Payout Settings ====================

  /**
   * Get the current accountant's payout settings
   */
  getMyPayoutSettings: async (): Promise<PayoutSettingsResponse> => {
    const response = await apiClient.get<ApiResponse<PayoutSettingsResponse>>(
      `${MARKETPLACE_BASE}/profile/me/payout`
    );
    return response.data.data!;
  },

  /**
   * Update the current accountant's payout settings
   */
  updateMyPayoutSettings: async (data: UpdatePayoutSettingsRequest): Promise<PayoutSettingsResponse> => {
    const response = await apiClient.put<ApiResponse<PayoutSettingsResponse>>(
      `${MARKETPLACE_BASE}/profile/me/payout`,
      data
    );
    return response.data.data!;
  },
};
