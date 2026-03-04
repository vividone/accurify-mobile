import { useQuery } from '@tanstack/react-query';
import { intelligenceApi } from '@/services/api/intelligence.api';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const intelligenceKeys = {
  all: ['intelligence'] as const,
  projectHealth: () => [...intelligenceKeys.all, 'project-health'] as const,
};

export function useProjectHealth(enabled = true) {
  return useQuery({
    queryKey: intelligenceKeys.projectHealth(),
    queryFn: () => intelligenceApi.getProjectHealth(),
    staleTime: STALE_TIME,
    enabled,
  });
}
