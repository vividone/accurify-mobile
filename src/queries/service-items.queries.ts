import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceItemsApi } from '@/services/api/service-items.api';
import type { ServiceItemRequest } from '@/types/service-item.types';

export const serviceItemKeys = {
  all: ['service-items'] as const,
  lists: () => [...serviceItemKeys.all, 'list'] as const,
  list: (page: number, size: number, filters?: { active?: boolean }) =>
    [...serviceItemKeys.lists(), { page, size, ...filters }] as const,
  search: (query: string, page: number, size: number) =>
    [...serviceItemKeys.all, 'search', query, { page, size }] as const,
  details: () => [...serviceItemKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceItemKeys.details(), id] as const,
};

export function useServiceItems(
  page = 0,
  size = 200,
  filters?: { active?: boolean }
) {
  return useQuery({
    queryKey: serviceItemKeys.list(page, size, filters),
    queryFn: () => serviceItemsApi.list(page, size, filters),
  });
}

export function useSearchServiceItems(query: string, page = 0, size = 20) {
  return useQuery({
    queryKey: serviceItemKeys.search(query, page, size),
    queryFn: () => serviceItemsApi.search(query, page, size),
    enabled: query.length >= 2,
  });
}

export function useCreateServiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ServiceItemRequest) => serviceItemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceItemKeys.lists() });
    },
  });
}

export function useUpdateServiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceItemRequest }) =>
      serviceItemsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: serviceItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceItemKeys.detail(id) });
    },
  });
}

export function useDeleteServiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceItemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceItemKeys.lists() });
    },
  });
}
