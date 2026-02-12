import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { PageResponse } from '@/types';
import type { ProductBatch, BatchRequest, FefoSuggestion, ExpiryAlertResponse } from '@/types/product.types';

// ==================== Query Keys ====================

export const batchKeys = {
  all: ['batches'] as const,
  byProduct: (productId: string) => [...batchKeys.all, 'product', productId] as const,
  available: (productId: string) => [...batchKeys.all, 'available', productId] as const,
  detail: (batchId: string) => [...batchKeys.all, 'detail', batchId] as const,
  expiring: (days: number) => [...batchKeys.all, 'expiring', days] as const,
  expired: () => [...batchKeys.all, 'expired'] as const,
  expiryAlerts: (days: number) => [...batchKeys.all, 'alerts', days] as const,
  fefoSuggestion: (productId: string, quantity: number) =>
    [...batchKeys.all, 'fefo', productId, quantity] as const,
};

// ==================== API Functions ====================

const batchApi = {
  // CRUD
  getBatches: async (productId: string, page = 0, size = 20): Promise<PageResponse<ProductBatch>> => {
    const response = await api.get(`/products/${productId}/batches`, {
      params: { page, size },
    });
    return response.data.data;
  },

  getAvailableBatches: async (productId: string): Promise<ProductBatch[]> => {
    const response = await api.get(`/products/${productId}/batches/available`);
    return response.data.data;
  },

  getBatch: async (batchId: string): Promise<ProductBatch> => {
    const response = await api.get(`/batches/${batchId}`);
    return response.data.data;
  },

  createBatch: async (productId: string, data: BatchRequest): Promise<ProductBatch> => {
    const response = await api.post(`/products/${productId}/batches`, data);
    return response.data.data;
  },

  updateBatch: async (batchId: string, data: BatchRequest): Promise<ProductBatch> => {
    const response = await api.put(`/batches/${batchId}`, data);
    return response.data.data;
  },

  deactivateBatch: async (batchId: string): Promise<void> => {
    await api.delete(`/batches/${batchId}`);
  },

  // FEFO Operations
  getFefoSuggestions: async (productId: string, quantity: number): Promise<FefoSuggestion[]> => {
    const response = await api.get(`/products/${productId}/batches/fefo-suggestion`, {
      params: { quantity },
    });
    return response.data.data;
  },

  deductStockFefo: async (productId: string, quantity: number): Promise<{ batchId: string; quantityDeducted: number }[]> => {
    const response = await api.post(`/products/${productId}/batches/deduct-fefo`, null, {
      params: { quantity },
    });
    return response.data.data;
  },

  deductFromBatch: async (batchId: string, quantity: number): Promise<ProductBatch> => {
    const response = await api.post(`/batches/${batchId}/deduct`, null, {
      params: { quantity },
    });
    return response.data.data;
  },

  addToBatch: async (batchId: string, quantity: number): Promise<ProductBatch> => {
    const response = await api.post(`/batches/${batchId}/add`, null, {
      params: { quantity },
    });
    return response.data.data;
  },

  // Expiry Alerts
  getExpiringBatches: async (days = 30): Promise<ProductBatch[]> => {
    const response = await api.get('/batches/expiring', {
      params: { days },
    });
    return response.data.data;
  },

  getExpiredBatches: async (): Promise<ProductBatch[]> => {
    const response = await api.get('/batches/expired');
    return response.data.data;
  },

  getExpiryAlerts: async (days = 30): Promise<ExpiryAlertResponse> => {
    const response = await api.get('/batches/expiry-alerts', {
      params: { days },
    });
    return response.data.data;
  },

  countExpiringBatches: async (days = 30): Promise<number> => {
    const response = await api.get('/batches/expiring/count', {
      params: { days },
    });
    return response.data.data;
  },
};

// ==================== Query Hooks ====================

export function useBatches(productId: string, page = 0, size = 20) {
  return useQuery({
    queryKey: [...batchKeys.byProduct(productId), page, size],
    queryFn: () => batchApi.getBatches(productId, page, size),
    enabled: !!productId,
  });
}

export function useAvailableBatches(productId: string) {
  return useQuery({
    queryKey: batchKeys.available(productId),
    queryFn: () => batchApi.getAvailableBatches(productId),
    enabled: !!productId,
  });
}

export function useBatch(batchId: string) {
  return useQuery({
    queryKey: batchKeys.detail(batchId),
    queryFn: () => batchApi.getBatch(batchId),
    enabled: !!batchId,
  });
}

export function useFefoSuggestions(productId: string, quantity: number) {
  return useQuery({
    queryKey: batchKeys.fefoSuggestion(productId, quantity),
    queryFn: () => batchApi.getFefoSuggestions(productId, quantity),
    enabled: !!productId && quantity > 0,
  });
}

export function useExpiringBatches(days = 30) {
  return useQuery({
    queryKey: batchKeys.expiring(days),
    queryFn: () => batchApi.getExpiringBatches(days),
  });
}

export function useExpiredBatches() {
  return useQuery({
    queryKey: batchKeys.expired(),
    queryFn: () => batchApi.getExpiredBatches(),
  });
}

export function useExpiryAlerts(days = 30) {
  return useQuery({
    queryKey: batchKeys.expiryAlerts(days),
    queryFn: () => batchApi.getExpiryAlerts(days),
  });
}

// ==================== Mutation Hooks ====================

export function useCreateBatch(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchRequest) => batchApi.createBatch(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.byProduct(productId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.available(productId) });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, data }: { batchId: string; data: BatchRequest }) =>
      batchApi.updateBatch(batchId, data),
    onSuccess: (_, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeactivateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) => batchApi.deactivateBatch(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeductStockFefo(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quantity: number) => batchApi.deductStockFefo(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.byProduct(productId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.available(productId) });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });
}

export function useDeductFromBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, quantity }: { batchId: string; quantity: number }) =>
      batchApi.deductFromBatch(batchId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });
}

export function useAddToBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, quantity }: { batchId: string; quantity: number }) =>
      batchApi.addToBatch(batchId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });
}
