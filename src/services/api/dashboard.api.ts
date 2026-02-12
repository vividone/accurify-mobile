import apiClient from './client';
import type { ApiResponse, DashboardData } from '@/types';

export const dashboardApi = {
  // Get dashboard data
  getDashboard: async (): Promise<DashboardData> => {
    const response =
      await apiClient.get<ApiResponse<DashboardData>>('/dashboard');
    return response.data.data!;
  },
};
