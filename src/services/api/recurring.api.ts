import apiClient from './client';
import type { ApiResponse, PageResponse, RecurringTemplate, RecurringTemplateRequest } from '@/types';

const BASE = '/recurring';

export const recurringApi = {
  list: async (page = 0, size = 20): Promise<PageResponse<RecurringTemplate>> => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    const response = await apiClient.get<ApiResponse<PageResponse<RecurringTemplate>>>(`${BASE}?${params}`);
    return response.data.data!;
  },

  getById: async (id: string): Promise<RecurringTemplate> => {
    const response = await apiClient.get<ApiResponse<RecurringTemplate>>(`${BASE}/${id}`);
    return response.data.data!;
  },

  create: async (data: RecurringTemplateRequest): Promise<RecurringTemplate> => {
    const response = await apiClient.post<ApiResponse<RecurringTemplate>>(BASE, data);
    return response.data.data!;
  },

  update: async (id: string, data: RecurringTemplateRequest): Promise<RecurringTemplate> => {
    const response = await apiClient.put<ApiResponse<RecurringTemplate>>(`${BASE}/${id}`, data);
    return response.data.data!;
  },

  pause: async (id: string): Promise<RecurringTemplate> => {
    const response = await apiClient.post<ApiResponse<RecurringTemplate>>(`${BASE}/${id}/pause`);
    return response.data.data!;
  },

  resume: async (id: string): Promise<RecurringTemplate> => {
    const response = await apiClient.post<ApiResponse<RecurringTemplate>>(`${BASE}/${id}/resume`);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
