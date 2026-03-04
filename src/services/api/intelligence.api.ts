import apiClient from './client';
import type {
  ApiResponse,
  ProjectHealthReport,
} from '@/types';

const BASE = '/intelligence';

export const intelligenceApi = {
  getProjectHealth: async (): Promise<ProjectHealthReport> => {
    const response = await apiClient.get<ApiResponse<ProjectHealthReport>>(
      `${BASE}/project-health`
    );
    return response.data.data!;
  },
};
