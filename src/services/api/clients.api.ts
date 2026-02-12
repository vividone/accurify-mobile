import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  Client,
  ClientRequest,
} from '@/types';

const CLIENTS_BASE = '/clients';

export const clientsApi = {
  // List clients with pagination
  list: async (page = 0, size = 20): Promise<PageResponse<Client>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get<ApiResponse<PageResponse<Client>>>(
      `${CLIENTS_BASE}?${params}`
    );
    return response.data.data!;
  },

  // Search clients
  search: async (query: string): Promise<Client[]> => {
    const response = await apiClient.get<ApiResponse<Client[]>>(
      `${CLIENTS_BASE}/search?q=${encodeURIComponent(query)}`
    );
    return response.data.data!;
  },

  // Get single client
  getById: async (id: string): Promise<Client> => {
    const response = await apiClient.get<ApiResponse<Client>>(
      `${CLIENTS_BASE}/${id}`
    );
    return response.data.data!;
  },

  // Create client
  create: async (data: ClientRequest): Promise<Client> => {
    const response = await apiClient.post<ApiResponse<Client>>(
      CLIENTS_BASE,
      data
    );
    return response.data.data!;
  },

  // Update client
  update: async (id: string, data: ClientRequest): Promise<Client> => {
    const response = await apiClient.put<ApiResponse<Client>>(
      `${CLIENTS_BASE}/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete client
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${CLIENTS_BASE}/${id}`);
  },
};
