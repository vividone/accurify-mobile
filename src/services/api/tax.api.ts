import apiClient from './client';
import type { ApiResponse, TaxSummary } from '@/types';

const TAX_BASE = '/tax';

export const taxApi = {
  // Get tax summary
  getSummary: async (): Promise<TaxSummary> => {
    const response = await apiClient.get<ApiResponse<TaxSummary>>(
      `${TAX_BASE}/summary`
    );
    return response.data.data!;
  },
};
