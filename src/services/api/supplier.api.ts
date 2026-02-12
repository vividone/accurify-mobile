import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  Supplier,
  SupplierRequest,
} from '@/types';

const SUPPLIERS_BASE = '/suppliers';

export const suppliersApi = {
  // Create supplier
  create: async (data: SupplierRequest): Promise<Supplier> => {
    const response = await apiClient.post<ApiResponse<Supplier>>(
      SUPPLIERS_BASE,
      data
    );
    return response.data.data!;
  },

  // Update supplier
  update: async (supplierId: string, data: SupplierRequest): Promise<Supplier> => {
    const response = await apiClient.put<ApiResponse<Supplier>>(
      `${SUPPLIERS_BASE}/${supplierId}`,
      data
    );
    return response.data.data!;
  },

  // Get supplier by ID
  getById: async (supplierId: string): Promise<Supplier> => {
    const response = await apiClient.get<ApiResponse<Supplier>>(
      `${SUPPLIERS_BASE}/${supplierId}`
    );
    return response.data.data!;
  },

  // List suppliers (paginated)
  list: async (page = 0, size = 20): Promise<PageResponse<Supplier>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    const response = await apiClient.get<ApiResponse<PageResponse<Supplier>>>(
      `${SUPPLIERS_BASE}?${params}`
    );
    return response.data.data!;
  },

  // List active suppliers (for dropdowns)
  listActive: async (): Promise<Supplier[]> => {
    const response = await apiClient.get<ApiResponse<Supplier[]>>(
      `${SUPPLIERS_BASE}/active`
    );
    return response.data.data!;
  },

  // Search suppliers
  search: async (query: string, page = 0, size = 20): Promise<PageResponse<Supplier>> => {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      size: size.toString(),
    });
    const response = await apiClient.get<ApiResponse<PageResponse<Supplier>>>(
      `${SUPPLIERS_BASE}/search?${params}`
    );
    return response.data.data!;
  },

  // Deactivate supplier
  deactivate: async (supplierId: string): Promise<void> => {
    await apiClient.post(`${SUPPLIERS_BASE}/${supplierId}/deactivate`);
  },

  // Activate supplier
  activate: async (supplierId: string): Promise<void> => {
    await apiClient.post(`${SUPPLIERS_BASE}/${supplierId}/activate`);
  },

  // Delete supplier
  delete: async (supplierId: string): Promise<void> => {
    await apiClient.delete(`${SUPPLIERS_BASE}/${supplierId}`);
  },
};
