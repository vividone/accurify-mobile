import apiClient from './client';
import type { ApiResponse, FiscalPeriod } from '@/types';

const BASE = '/fiscal-periods';

export const fiscalPeriodsApi = {
  getForYear: async (year: number): Promise<FiscalPeriod[]> => {
    const response = await apiClient.get<ApiResponse<FiscalPeriod[]>>(`${BASE}?year=${year}`);
    return response.data.data!;
  },

  close: async (id: string): Promise<FiscalPeriod> => {
    const response = await apiClient.post<ApiResponse<FiscalPeriod>>(`${BASE}/${id}/close`);
    return response.data.data!;
  },

  reopen: async (id: string): Promise<FiscalPeriod> => {
    const response = await apiClient.post<ApiResponse<FiscalPeriod>>(`${BASE}/${id}/reopen`);
    return response.data.data!;
  },

  yearEndClose: async (year: number): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`${BASE}/year-end-close?year=${year}`);
  },
};
