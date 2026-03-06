import apiClient from './client';
import type { ApiResponse, PageResponse, CreditNote, CreditNoteRequest } from '@/types';

const BASE = '/credit-notes';

export const creditNotesApi = {
  list: async (page = 0, size = 20): Promise<PageResponse<CreditNote>> => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    const response = await apiClient.get<ApiResponse<PageResponse<CreditNote>>>(`${BASE}?${params}`);
    return response.data.data!;
  },

  getById: async (id: string): Promise<CreditNote> => {
    const response = await apiClient.get<ApiResponse<CreditNote>>(`${BASE}/${id}`);
    return response.data.data!;
  },

  create: async (data: CreditNoteRequest): Promise<CreditNote> => {
    const response = await apiClient.post<ApiResponse<CreditNote>>(BASE, data);
    return response.data.data!;
  },

  issue: async (id: string): Promise<CreditNote> => {
    const response = await apiClient.post<ApiResponse<CreditNote>>(`${BASE}/${id}/issue`);
    return response.data.data!;
  },

  void_: async (id: string, reason?: string): Promise<CreditNote> => {
    const response = await apiClient.post<ApiResponse<CreditNote>>(`${BASE}/${id}/void`, { reason });
    return response.data.data!;
  },

  getPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`${BASE}/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },
};
