import apiClient from './client';
import type { ApiResponse, WipSummaryResponse, ProjectWipResponse } from '@/types';

const BASE = '/wip';

export const wipApi = {
  getSummary: async (): Promise<WipSummaryResponse> => {
    const response = await apiClient.get<ApiResponse<WipSummaryResponse>>(
      `${BASE}/summary`
    );
    return response.data.data!;
  },

  getProjectWip: async (projectId: string): Promise<ProjectWipResponse> => {
    const response = await apiClient.get<ApiResponse<ProjectWipResponse>>(
      `${BASE}/projects/${projectId}`
    );
    return response.data.data!;
  },

  recognizeFixedPriceRevenue: async (projectId: string): Promise<void> => {
    await apiClient.post(`${BASE}/projects/${projectId}/recognize`);
  },
};
