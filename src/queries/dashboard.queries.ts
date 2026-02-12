import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: () => dashboardApi.getDashboard(),
    staleTime: 60 * 1000, // 1 minute
  });
}
