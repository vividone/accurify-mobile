import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '@/services/api';
import type { SupplierRequest } from '@/types';

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (page: number, size: number) =>
    [...supplierKeys.lists(), { page, size }] as const,
  active: () => [...supplierKeys.all, 'active'] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
};

export function useSuppliers(page = 0, size = 20) {
  return useQuery({
    queryKey: supplierKeys.list(page, size),
    queryFn: () => suppliersApi.list(page, size),
  });
}

export function useActiveSuppliers() {
  return useQuery({
    queryKey: supplierKeys.active(),
    queryFn: () => suppliersApi.listActive(),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => suppliersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SupplierRequest) => suppliersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.active() });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierRequest }) =>
      suppliersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.active() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.active() });
    },
  });
}

export function useActivateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.active() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) });
    },
  });
}

export function useDeactivateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersApi.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.active() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) });
    },
  });
}
