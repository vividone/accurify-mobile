import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  RetainerRequest,
  RetainerResponse,
  RetainerPeriodResponse,
} from '@/types';

const BASE = '/retainers';

export const projectRetainersApi = {
  // List retainer agreements (paginated)
  list: async (page = 0, size = 20): Promise<PageResponse<RetainerResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    const response = await apiClient.get<ApiResponse<PageResponse<RetainerResponse>>>(
      `${BASE}?${params}`
    );
    return response.data.data!;
  },

  // Get single retainer agreement
  getById: async (id: string): Promise<RetainerResponse> => {
    const response = await apiClient.get<ApiResponse<RetainerResponse>>(
      `${BASE}/${id}`
    );
    return response.data.data!;
  },

  // Create retainer agreement
  create: async (data: RetainerRequest): Promise<RetainerResponse> => {
    const response = await apiClient.post<ApiResponse<RetainerResponse>>(BASE, data);
    return response.data.data!;
  },

  // Update retainer agreement
  update: async (id: string, data: RetainerRequest): Promise<RetainerResponse> => {
    const response = await apiClient.put<ApiResponse<RetainerResponse>>(
      `${BASE}/${id}`,
      data
    );
    return response.data.data!;
  },

  // Pause retainer agreement
  pause: async (id: string): Promise<RetainerResponse> => {
    const response = await apiClient.patch<ApiResponse<RetainerResponse>>(
      `${BASE}/${id}/pause`
    );
    return response.data.data!;
  },

  // Cancel retainer agreement
  cancel: async (id: string): Promise<RetainerResponse> => {
    const response = await apiClient.patch<ApiResponse<RetainerResponse>>(
      `${BASE}/${id}/cancel`
    );
    return response.data.data!;
  },

  // Record hours on a retainer
  recordHours: async (id: string, hours: number): Promise<RetainerResponse> => {
    const response = await apiClient.post<ApiResponse<RetainerResponse>>(
      `${BASE}/${id}/record-hours`,
      { hours }
    );
    return response.data.data!;
  },

  // List periods for a retainer
  getPeriods: async (id: string): Promise<RetainerPeriodResponse[]> => {
    const response = await apiClient.get<ApiResponse<RetainerPeriodResponse[]>>(
      `${BASE}/${id}/periods`
    );
    return response.data.data!;
  },

  // Create a new period for a retainer
  createPeriod: async (id: string): Promise<RetainerPeriodResponse> => {
    const response = await apiClient.post<ApiResponse<RetainerPeriodResponse>>(
      `${BASE}/${id}/periods`
    );
    return response.data.data!;
  },

  // Close a retainer period
  closePeriod: async (periodId: string): Promise<RetainerPeriodResponse> => {
    const response = await apiClient.post<ApiResponse<RetainerPeriodResponse>>(
      `${BASE}/periods/${periodId}/close`
    );
    return response.data.data!;
  },
};
