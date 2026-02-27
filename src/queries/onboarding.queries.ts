import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '@/services/api/onboarding.api';
import type { OnboardingGoal } from '@/types/onboarding.types';

export function useOnboardingStatus() {
  return useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: () => onboardingApi.getStatus(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSetOnboardingGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goal: OnboardingGoal) => onboardingApi.setGoal(goal),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] }),
  });
}
