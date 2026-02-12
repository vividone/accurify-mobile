import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/api';
import type { ProductRequest, ProductCategory } from '@/types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (page: number, size: number, filters?: { active?: boolean; category?: ProductCategory }) =>
    [...productKeys.lists(), { page, size, ...filters }] as const,
  search: (query: string, page: number, size: number) =>
    [...productKeys.all, 'search', query, { page, size }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  summary: () => [...productKeys.all, 'summary'] as const,
  lowStock: () => [...productKeys.all, 'low-stock'] as const,
  outOfStock: () => [...productKeys.all, 'out-of-stock'] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
};

export function useProducts(
  page = 0,
  size = 20,
  filters?: { active?: boolean; category?: ProductCategory }
) {
  return useQuery({
    queryKey: productKeys.list(page, size, filters),
    queryFn: () => productsApi.list(page, size, filters),
  });
}

export function useSearchProducts(query: string, page = 0, size = 20) {
  return useQuery({
    queryKey: productKeys.search(query, page, size),
    queryFn: () => productsApi.search(query, page, size),
    enabled: query.length >= 2,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}

export function useProductSummary() {
  return useQuery({
    queryKey: productKeys.summary(),
    queryFn: () => productsApi.getSummary(),
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: productKeys.lowStock(),
    queryFn: () => productsApi.getLowStock(),
  });
}

export function useOutOfStockProducts() {
  return useQuery({
    queryKey: productKeys.outOfStock(),
    queryFn: () => productsApi.getOutOfStock(),
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productsApi.getCategories(),
    staleTime: Infinity, // Categories don't change
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductRequest) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.summary() });
      queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: productKeys.outOfStock() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductRequest }) =>
      productsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.summary() });
      queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: productKeys.outOfStock() });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.summary() });
    },
  });
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.summary() });
    },
  });
}

export function useActivateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.summary() });
    },
  });
}

export function useUploadProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      productsApi.uploadImage(productId, file),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
