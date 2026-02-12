import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  Transaction,
  TransactionRequest,
  TransactionFilters,
  TransactionCategory,
} from '@/types';

const TRANSACTIONS_BASE = '/transactions';

export const transactionsApi = {
  // List transactions with pagination and filters
  list: async (
    page = 0,
    size = 20,
    filters?: TransactionFilters
  ): Promise<PageResponse<Transaction>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<
      ApiResponse<PageResponse<Transaction>>
    >(`${TRANSACTIONS_BASE}?${params}`);
    return response.data.data!;
  },

  // Get single transaction
  getById: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(
      `${TRANSACTIONS_BASE}/${id}`
    );
    return response.data.data!;
  },

  // Create transaction
  create: async (data: TransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      TRANSACTIONS_BASE,
      data
    );
    return response.data.data!;
  },

  // Update transaction category
  updateCategory: async (
    id: string,
    category: TransactionCategory
  ): Promise<Transaction> => {
    const response = await apiClient.patch<ApiResponse<Transaction>>(
      `${TRANSACTIONS_BASE}/${id}/category?category=${category}`
    );
    return response.data.data!;
  },

  // Delete transaction (manual only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${TRANSACTIONS_BASE}/${id}`);
  },
};
