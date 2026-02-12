import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockApi } from '@/services/api';
import type { StockMovementRequest, ProductSaleRequest, StockMovementType } from '@/types';
import { productKeys } from './products.queries';

export const stockKeys = {
  all: ['stock'] as const,
  lists: () => [...stockKeys.all, 'list'] as const,
  list: (page: number, size: number) =>
    [...stockKeys.lists(), { page, size }] as const,
  byProduct: (productId: string, page: number, size: number) =>
    [...stockKeys.all, 'product', productId, { page, size }] as const,
  byType: (type: StockMovementType, page: number, size: number) =>
    [...stockKeys.all, 'type', type, { page, size }] as const,
  byDateRange: (startDate: string, endDate: string, page: number, size: number) =>
    [...stockKeys.all, 'date-range', startDate, endDate, { page, size }] as const,
  summary: (startDate?: string, endDate?: string) =>
    [...stockKeys.all, 'summary', { startDate, endDate }] as const,
  movementTypes: () => [...stockKeys.all, 'movement-types'] as const,
};

export function useStockHistory(page = 0, size = 20) {
  return useQuery({
    queryKey: stockKeys.list(page, size),
    queryFn: () => stockApi.list(page, size),
  });
}

export function useStockHistoryByProduct(productId: string, page = 0, size = 20) {
  return useQuery({
    queryKey: stockKeys.byProduct(productId, page, size),
    queryFn: () => stockApi.listByProduct(productId, page, size),
    enabled: !!productId,
  });
}

export function useStockHistoryByType(type: StockMovementType, page = 0, size = 20) {
  return useQuery({
    queryKey: stockKeys.byType(type, page, size),
    queryFn: () => stockApi.listByType(type, page, size),
    enabled: !!type,
  });
}

export function useStockHistoryByDateRange(
  startDate: string,
  endDate: string,
  page = 0,
  size = 20
) {
  return useQuery({
    queryKey: stockKeys.byDateRange(startDate, endDate, page, size),
    queryFn: () => stockApi.listByDateRange(startDate, endDate, page, size),
    enabled: !!startDate && !!endDate,
  });
}

export function useStockSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: stockKeys.summary(startDate, endDate),
    queryFn: () => stockApi.getSummary(startDate, endDate),
  });
}

export function useStockMovementTypes() {
  return useQuery({
    queryKey: stockKeys.movementTypes(),
    queryFn: () => stockApi.getMovementTypes(),
    staleTime: Infinity,
  });
}

export function useRecordStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockMovementRequest) => stockApi.recordMovement(data),
    onSuccess: (_, variables) => {
      // Invalidate stock queries
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stockKeys.summary() });
      // Invalidate product queries (stock quantity changed)
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.summary() });
      queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: productKeys.outOfStock() });
    },
  });
}

export function useRecordProductSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductSaleRequest) => stockApi.recordSale(data),
    onSuccess: (_, variables) => {
      // Invalidate stock queries
      queryClient.invalidateQueries({ queryKey: stockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stockKeys.summary() });
      // Invalidate product queries (stock quantity changed)
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.summary() });
      queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: productKeys.outOfStock() });
      // Invalidate transactions (sale creates a transaction)
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
