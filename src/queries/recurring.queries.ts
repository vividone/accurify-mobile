import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recurringApi } from '@/services/api';
import type { RecurringTemplateRequest } from '@/types';

export const recurringKeys = {
  all: ['recurring'] as const,
  lists: () => [...recurringKeys.all, 'list'] as const,
  list: (page: number, size: number) => [...recurringKeys.lists(), { page, size }] as const,
  details: () => [...recurringKeys.all, 'detail'] as const,
  detail: (id: string) => [...recurringKeys.details(), id] as const,
};

export function useRecurringTemplates(page = 0, size = 20) {
  return useQuery({
    queryKey: recurringKeys.list(page, size),
    queryFn: () => recurringApi.list(page, size),
  });
}

export function useRecurringTemplate(id: string) {
  return useQuery({
    queryKey: recurringKeys.detail(id),
    queryFn: () => recurringApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecurringTemplateRequest) => recurringApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.lists() });
    },
  });
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecurringTemplateRequest }) =>
      recurringApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recurringKeys.detail(id) });
    },
  });
}

export function usePauseRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recurringApi.pause(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recurringKeys.detail(id) });
    },
  });
}

export function useResumeRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recurringApi.resume(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recurringKeys.detail(id) });
    },
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recurringApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.lists() });
    },
  });
}
