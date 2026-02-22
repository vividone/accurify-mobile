import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectExpensesApi } from '@/services/api';
import { projectKeys } from './projects.queries';
import type { ProjectExpenseRequest } from '@/types';

export const projectExpenseKeys = {
  all: ['project-expenses'] as const,
  lists: () => [...projectExpenseKeys.all, 'list'] as const,
  byProject: (projectId: string, page: number, size: number) =>
    [...projectExpenseKeys.all, 'by-project', projectId, { page, size }] as const,
  details: () => [...projectExpenseKeys.all, 'detail'] as const,
  detail: (projectId: string, id: string) =>
    [...projectExpenseKeys.details(), projectId, id] as const,
};

export function useProjectExpenses(projectId: string, page = 0, size = 20) {
  return useQuery({
    queryKey: projectExpenseKeys.byProject(projectId, page, size),
    queryFn: () => projectExpensesApi.list(projectId, page, size),
    enabled: !!projectId,
  });
}

export function useCreateProjectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: ProjectExpenseRequest;
    }) => projectExpensesApi.create(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: [...projectExpenseKeys.all, 'by-project', projectId],
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
    },
  });
}

export function useUpdateProjectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      id,
      data,
    }: {
      projectId: string;
      id: string;
      data: ProjectExpenseRequest;
    }) => projectExpensesApi.update(projectId, id, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: [...projectExpenseKeys.all, 'by-project', projectId],
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
    },
  });
}

export function useDeleteProjectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, id }: { projectId: string; id: string }) =>
      projectExpensesApi.delete(projectId, id),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: [...projectExpenseKeys.all, 'by-project', projectId],
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
    },
  });
}
