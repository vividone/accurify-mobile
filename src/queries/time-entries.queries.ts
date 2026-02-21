import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeEntriesApi } from '@/services/api';
import { projectKeys } from './projects.queries';
import type { TimeEntryRequest } from '@/types';

export const timeEntryKeys = {
  all: ['time-entries'] as const,
  lists: () => [...timeEntryKeys.all, 'list'] as const,
  list: (page: number, size: number) =>
    [...timeEntryKeys.lists(), { page, size }] as const,
  byProject: (projectId: string, page: number, size: number) =>
    [...timeEntryKeys.all, 'by-project', projectId, { page, size }] as const,
  details: () => [...timeEntryKeys.all, 'detail'] as const,
  detail: (id: string) => [...timeEntryKeys.details(), id] as const,
};

export function useTimeEntries(page = 0, size = 20) {
  return useQuery({
    queryKey: timeEntryKeys.list(page, size),
    queryFn: () => timeEntriesApi.list(page, size),
  });
}

export function useProjectTimeEntries(
  projectId: string,
  page = 0,
  size = 20
) {
  return useQuery({
    queryKey: timeEntryKeys.byProject(projectId, page, size),
    queryFn: () => timeEntriesApi.listByProject(projectId, page, size),
    enabled: !!projectId,
  });
}

export function useTimeEntry(id: string) {
  return useQuery({
    queryKey: timeEntryKeys.detail(id),
    queryFn: () => timeEntriesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TimeEntryRequest) => timeEntriesApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: [...timeEntryKeys.all, 'by-project', variables.projectId],
      });
      // Also refresh the project detail to update summary stats
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
    },
  });
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TimeEntryRequest }) =>
      timeEntriesApi.update(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.detail(id) });
      queryClient.invalidateQueries({
        queryKey: [...timeEntryKeys.all, 'by-project', data.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(data.projectId),
      });
    },
  });
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => timeEntriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
