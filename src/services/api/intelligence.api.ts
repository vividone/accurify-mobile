import apiClient from './client';
import type {
  ApiResponse,
  ProjectHealthReport,
  UtilizationReport,
  RetainerHealthReport,
  RateAnalysisReport,
} from '@/types';

const BASE = '/intelligence';

export const intelligenceApi = {
  getProjectHealth: async (): Promise<ProjectHealthReport> => {
    const response = await apiClient.get<ApiResponse<ProjectHealthReport>>(
      `${BASE}/project-health`
    );
    return response.data.data!;
  },

  getUtilization: async (startDate: string, endDate: string): Promise<UtilizationReport> => {
    const response = await apiClient.get<ApiResponse<UtilizationReport>>(
      `${BASE}/utilization`,
      { params: { startDate, endDate } }
    );
    return response.data.data!;
  },

  getRetainerHealth: async (): Promise<RetainerHealthReport> => {
    const response = await apiClient.get<ApiResponse<RetainerHealthReport>>(
      `${BASE}/retainer-health`
    );
    return response.data.data!;
  },

  getRateAnalysis: async (startDate: string, endDate: string): Promise<RateAnalysisReport> => {
    const response = await apiClient.get<ApiResponse<RateAnalysisReport>>(
      `${BASE}/rate-analysis`,
      { params: { startDate, endDate } }
    );
    return response.data.data!;
  },
};
