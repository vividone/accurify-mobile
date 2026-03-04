import apiClient from './client';
import type { ApiResponse, PageResponse } from '@/types';
import type { ServiceItem, ServiceItemRequest } from '@/types/service-item.types';

const BASE = '/service-items';

export const serviceItemsApi = {
  list: async (
    page = 0,
    size = 200,
    filters?: { active?: boolean }
  ): Promise<PageResponse<ServiceItem>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (filters?.active !== undefined) {
      params.append('active', filters.active.toString());
    }
    const response = await apiClient.get<ApiResponse<PageResponse<ServiceItem>>>(
      `${BASE}?${params}`
    );
    return response.data.data!;
  },

  search: async (query: string, page = 0, size = 20): Promise<PageResponse<ServiceItem>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      size: size.toString(),
    });
    const response = await apiClient.get<ApiResponse<PageResponse<ServiceItem>>>(
      `${BASE}/search?${params}`
    );
    return response.data.data!;
  },

  getById: async (id: string): Promise<ServiceItem> => {
    const response = await apiClient.get<ApiResponse<ServiceItem>>(`${BASE}/${id}`);
    return response.data.data!;
  },

  create: async (data: ServiceItemRequest): Promise<ServiceItem> => {
    const response = await apiClient.post<ApiResponse<ServiceItem>>(BASE, data);
    return response.data.data!;
  },

  update: async (id: string, data: ServiceItemRequest): Promise<ServiceItem> => {
    const response = await apiClient.put<ApiResponse<ServiceItem>>(`${BASE}/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  deactivate: async (id: string): Promise<void> => {
    await apiClient.post(`${BASE}/${id}/deactivate`);
  },

  activate: async (id: string): Promise<void> => {
    await apiClient.post(`${BASE}/${id}/activate`);
  },
};
