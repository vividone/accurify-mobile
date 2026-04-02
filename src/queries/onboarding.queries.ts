import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '@/services/api/onboarding.api';
import type { OnboardingGoal } from '@/types/onboarding.types';

export const onboardingKeys = {
  all: ['onboarding'] as const,
  status: () => [...onboardingKeys.all, 'status'] as const,
  milestones: () => [...onboardingKeys.all, 'milestones'] as const,
};

export function useOnboardingStatus() {
  return useQuery({
    queryKey: onboardingKeys.status(),
    queryFn: () => onboardingApi.getStatus(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSetOnboardingGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goal: OnboardingGoal) => onboardingApi.setGoal(goal),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: onboardingKeys.all }),
  });
}

export function useDismissAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actionKey: string) => onboardingApi.dismissAction(actionKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: onboardingKeys.status() }),
  });
}
