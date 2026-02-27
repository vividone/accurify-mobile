import apiClient from './client';
import type { ApiResponse } from '@/types';
import type { OnboardingGoal, OnboardingStatus } from '@/types/onboarding.types';

export const onboardingApi = {
  getStatus: async (): Promise<OnboardingStatus> => {
    const response = await apiClient.get<ApiResponse<OnboardingStatus>>('/onboarding/status');
    return response.data.data!;
  },

  setGoal: async (goal: OnboardingGoal): Promise<void> => {
    await apiClient.put('/onboarding/goal', { goal });
  },
};
