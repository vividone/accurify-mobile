import { useQuery } from '@tanstack/react-query';
import { profitabilityApi } from '@/services/api';

export const profitabilityKeys = {
  all: ['profitability'] as const,
  projects: () => [...profitabilityKeys.all, 'projects'] as const,
  project: (id: string) => [...profitabilityKeys.all, 'projects', id] as const,
  clients: () => [...profitabilityKeys.all, 'clients'] as const,
};

export function useProjectsProfitability(enabled = true) {
  return useQuery({
    queryKey: profitabilityKeys.projects(),
    queryFn: () => profitabilityApi.projects(),
    enabled,
  });
}

export function useProjectProfitability(id: string) {
  return useQuery({
    queryKey: profitabilityKeys.project(id),
    queryFn: () => profitabilityApi.project(id),
    enabled: !!id,
  });
}

export function useClientsProfitability(enabled = true) {
  return useQuery({
    queryKey: profitabilityKeys.clients(),
    queryFn: () => profitabilityApi.clients(),
    enabled,
  });
}
