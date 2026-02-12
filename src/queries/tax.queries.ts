import { useQuery } from '@tanstack/react-query';
import { taxApi } from '@/services/api';

export const taxKeys = {
  all: ['tax'] as const,
  summary: () => [...taxKeys.all, 'summary'] as const,
};

export function useTaxDashboard() {
  return useQuery({
    queryKey: taxKeys.summary(),
    queryFn: () => taxApi.getSummary(),
  });
}
