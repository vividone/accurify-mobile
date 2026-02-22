import apiClient from './client';
import type {
  ApiResponse,
  ProjectProfitability,
  ClientProfitability,
} from '@/types';

const BASE = '/profitability';

export const profitabilityApi = {
  // Get profitability for all projects
  projects: async (): Promise<ProjectProfitability[]> => {
    const response = await apiClient.get<ApiResponse<ProjectProfitability[]>>(
      `${BASE}/projects`
    );
    return response.data.data!;
  },

  // Get profitability for a single project
  project: async (id: string): Promise<ProjectProfitability> => {
    const response = await apiClient.get<ApiResponse<ProjectProfitability>>(
      `${BASE}/projects/${id}`
    );
    return response.data.data!;
  },

  // Get profitability by client
  clients: async (): Promise<ClientProfitability[]> => {
    const response = await apiClient.get<ApiResponse<ClientProfitability[]>>(
      `${BASE}/clients`
    );
    return response.data.data!;
  },
};
