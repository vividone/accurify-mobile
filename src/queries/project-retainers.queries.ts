import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectRetainersApi } from '@/services/api';
import type { RetainerRequest } from '@/types';

export const retainerKeys = {
  all: ['retainers'] as const,
  lists: () => [...retainerKeys.all, 'list'] as const,
  list: (page: number, size: number) =>
    [...retainerKeys.lists(), { page, size }] as const,
  details: () => [...retainerKeys.all, 'detail'] as const,
  detail: (id: string) => [...retainerKeys.details(), id] as const,
  periods: (id: string) => [...retainerKeys.all, id, 'periods'] as const,
};

export function useRetainers(page = 0, size = 20) {
  return useQuery({
    queryKey: retainerKeys.list(page, size),
    queryFn: () => projectRetainersApi.list(page, size),
  });
}

export function useRetainer(id: string) {
  return useQuery({
    queryKey: retainerKeys.detail(id),
    queryFn: () => projectRetainersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRetainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RetainerRequest) => projectRetainersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.lists() });
    },
  });
}

export function useUpdateRetainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RetainerRequest }) =>
      projectRetainersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: retainerKeys.detail(id) });
    },
  });
}

export function usePauseRetainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectRetainersApi.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.all });
    },
  });
}

export function useCancelRetainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectRetainersApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.all });
    },
  });
}

export function useRecordRetainerHours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hours }: { id: string; hours: number }) =>
      projectRetainersApi.recordHours(id, hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.all });
    },
  });
}

export function useRetainerPeriods(id: string) {
  return useQuery({
    queryKey: retainerKeys.periods(id),
    queryFn: () => projectRetainersApi.getPeriods(id),
    enabled: !!id,
  });
}

export function useCreateRetainerPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectRetainersApi.createPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.all });
    },
  });
}

export function useCloseRetainerPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (periodId: string) => projectRetainersApi.closePeriod(periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.all });
    },
  });
}
