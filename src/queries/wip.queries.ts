import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wipApi } from '@/services/api';

export const wipKeys = {
  all: ['wip'] as const,
  summary: () => [...wipKeys.all, 'summary'] as const,
  projects: () => [...wipKeys.all, 'projects'] as const,
  project: (projectId: string) => [...wipKeys.projects(), projectId] as const,
};

export function useWipSummary() {
  return useQuery({
    queryKey: wipKeys.summary(),
    queryFn: () => wipApi.getSummary(),
  });
}

export function useProjectWip(projectId: string) {
  return useQuery({
    queryKey: wipKeys.project(projectId),
    queryFn: () => wipApi.getProjectWip(projectId),
    enabled: !!projectId,
  });
}

export function useRecognizeRevenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => wipApi.recognizeFixedPriceRevenue(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wipKeys.all });
    },
  });
}
