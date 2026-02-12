import apiClient from './client';
import type { ApiResponse, Business, BusinessRequest } from '@/types';

const BUSINESS_BASE = '/business';

export const businessApi = {
  // Get current user's business
  get: async (): Promise<Business> => {
    const response =
      await apiClient.get<ApiResponse<Business>>(BUSINESS_BASE);
    return response.data.data!;
  },

  // Create business
  create: async (data: BusinessRequest): Promise<Business> => {
    const response = await apiClient.post<ApiResponse<Business>>(
      BUSINESS_BASE,
      data
    );
    return response.data.data!;
  },

  // Update business
  update: async (data: BusinessRequest): Promise<Business> => {
    const response = await apiClient.put<ApiResponse<Business>>(
      BUSINESS_BASE,
      data
    );
    return response.data.data!;
  },

  // Upload logo
  uploadLogo: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<string>>(
      `${BUSINESS_BASE}/logo`,
      formData
    );
    return response.data.data!;
  },
};
