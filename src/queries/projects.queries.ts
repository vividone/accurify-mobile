import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/services/api';
import type {
  ProjectRequest,
  ProjectStatus,
  BudgetLineItemRequest,
} from '@/types';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (page: number, size: number, status?: ProjectStatus) =>
    [...projectKeys.lists(), { page, size, status }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  budget: (id: string) => [...projectKeys.all, 'budget', id] as const,
  financialSummary: (id: string) => [...projectKeys.all, 'financial-summary', id] as const,
};

export function useProjects(page = 0, size = 20, status?: ProjectStatus) {
  return useQuery({
    queryKey: projectKeys.list(page, size, status),
    queryFn: () => projectsApi.list(page, size, status),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectRequest) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectRequest }) =>
      projectsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// --- Budget Line Items ---

export function useProjectBudget(projectId: string) {
  return useQuery({
    queryKey: projectKeys.budget(projectId),
    queryFn: () => projectsApi.getBudgetLineItems(projectId),
    enabled: !!projectId,
  });
}

export function useProjectFinancialSummary(projectId: string) {
  return useQuery({
    queryKey: projectKeys.financialSummary(projectId),
    queryFn: () => projectsApi.getFinancialSummary(projectId),
    enabled: !!projectId,
  });
}

export function useCreateBudgetLineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: BudgetLineItemRequest;
    }) => projectsApi.createBudgetLineItem(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.budget(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.financialSummary(projectId) });
    },
  });
}

export function useUpdateBudgetLineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      id,
      data,
    }: {
      projectId: string;
      id: string;
      data: BudgetLineItemRequest;
    }) => projectsApi.updateBudgetLineItem(projectId, id, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.budget(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.financialSummary(projectId) });
    },
  });
}

export function useDeleteBudgetLineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, id }: { projectId: string; id: string }) =>
      projectsApi.deleteBudgetLineItem(projectId, id),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.budget(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.financialSummary(projectId) });
    },
  });
}
