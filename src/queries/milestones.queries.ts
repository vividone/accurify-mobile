import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { milestonesApi } from '@/services/api';
import type { MilestoneRequest } from '@/types';

export const milestoneKeys = {
  all: ['milestones'] as const,
  byProject: (projectId: string) =>
    ['milestones', 'project', projectId] as const,
};

export function useMilestones(projectId: string) {
  return useQuery({
    queryKey: milestoneKeys.byProject(projectId),
    queryFn: () => milestonesApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: MilestoneRequest;
    }) => milestonesApi.create(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: milestoneKeys.byProject(projectId),
      });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      milestoneId,
      data,
    }: {
      projectId: string;
      milestoneId: string;
      data: MilestoneRequest;
    }) => milestonesApi.update(projectId, milestoneId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: milestoneKeys.byProject(projectId),
      });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      milestoneId,
    }: {
      projectId: string;
      milestoneId: string;
    }) => milestonesApi.delete(projectId, milestoneId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: milestoneKeys.byProject(projectId),
      });
    },
  });
}
