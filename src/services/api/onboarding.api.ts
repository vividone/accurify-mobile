import apiClient from './client';
import type { ApiResponse } from '@/types';
import type { OnboardingGoal, OnboardingStatus, MilestoneItem } from '@/types/onboarding.types';

export const onboardingApi = {
  getStatus: async (): Promise<OnboardingStatus> => {
    const response = await apiClient.get<ApiResponse<OnboardingStatus>>('/onboarding/status');
    return response.data.data!;
  },

  setGoal: async (goal: OnboardingGoal): Promise<void> => {
    await apiClient.put('/onboarding/goal', { goal });
  },

  dismissAction: async (actionKey: string): Promise<void> => {
    await apiClient.post('/onboarding/dismiss', { actionKey });
  },

  getMilestones: async (): Promise<MilestoneItem[]> => {
    const response = await apiClient.get<ApiResponse<MilestoneItem[]>>('/onboarding/milestones');
    return response.data.data!;
  },
};
