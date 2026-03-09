import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fiscalPeriodsApi } from '@/services/api';

export const fiscalPeriodKeys = {
  all: ['fiscal-periods'] as const,
  lists: () => [...fiscalPeriodKeys.all, 'list'] as const,
  list: (year: number) => [...fiscalPeriodKeys.lists(), year] as const,
};

export function useFiscalPeriods(year: number) {
  return useQuery({
    queryKey: fiscalPeriodKeys.list(year),
    queryFn: () => fiscalPeriodsApi.getForYear(year),
  });
}

export function useClosePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fiscalPeriodsApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fiscalPeriodKeys.all });
    },
  });
}

export function useReopenPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fiscalPeriodsApi.reopen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fiscalPeriodKeys.all });
    },
  });
}

export function useYearEndClose() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (year: number) => fiscalPeriodsApi.yearEndClose(year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fiscalPeriodKeys.all });
      queryClient.invalidateQueries({ queryKey: ['gl'] });
    },
  });
}
