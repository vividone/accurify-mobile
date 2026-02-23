import { useQuery } from '@tanstack/react-query';
import { intelligenceApi } from '@/services/api/intelligence.api';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const intelligenceKeys = {
  all: ['intelligence'] as const,
  projectHealth: () => [...intelligenceKeys.all, 'project-health'] as const,
  utilization: (startDate: string, endDate: string) =>
    [...intelligenceKeys.all, 'utilization', startDate, endDate] as const,
  retainerHealth: () => [...intelligenceKeys.all, 'retainer-health'] as const,
  rateAnalysis: (startDate: string, endDate: string) =>
    [...intelligenceKeys.all, 'rate-analysis', startDate, endDate] as const,
};

export function useProjectHealth(enabled = true) {
  return useQuery({
    queryKey: intelligenceKeys.projectHealth(),
    queryFn: () => intelligenceApi.getProjectHealth(),
    staleTime: STALE_TIME,
    enabled,
  });
}

export function useUtilization(startDate: string, endDate: string) {
  return useQuery({
    queryKey: intelligenceKeys.utilization(startDate, endDate),
    queryFn: () => intelligenceApi.getUtilization(startDate, endDate),
    staleTime: STALE_TIME,
    enabled: !!startDate && !!endDate,
  });
}

export function useRetainerHealth(enabled = true) {
  return useQuery({
    queryKey: intelligenceKeys.retainerHealth(),
    queryFn: () => intelligenceApi.getRetainerHealth(),
    staleTime: STALE_TIME,
    enabled,
  });
}

export function useRateAnalysis(startDate: string, endDate: string) {
  return useQuery({
    queryKey: intelligenceKeys.rateAnalysis(startDate, endDate),
    queryFn: () => intelligenceApi.getRateAnalysis(startDate, endDate),
    staleTime: STALE_TIME,
    enabled: !!startDate && !!endDate,
  });
}
