import apiClient from './client';
import type {
  ApiResponse,
  MilestoneRequest,
  MilestoneResponse,
} from '@/types';

const PROJECTS_BASE = '/projects';

export const milestonesApi = {
  // List milestones for a project
  list: async (projectId: string): Promise<MilestoneResponse[]> => {
    const response = await apiClient.get<ApiResponse<MilestoneResponse[]>>(
      `${PROJECTS_BASE}/${projectId}/milestones`
    );
    return response.data.data!;
  },

  // Create a milestone for a project
  create: async (projectId: string, data: MilestoneRequest): Promise<MilestoneResponse> => {
    const response = await apiClient.post<ApiResponse<MilestoneResponse>>(
      `${PROJECTS_BASE}/${projectId}/milestones`,
      data
    );
    return response.data.data!;
  },

  // Update a milestone
  update: async (
    projectId: string,
    milestoneId: string,
    data: MilestoneRequest
  ): Promise<MilestoneResponse> => {
    const response = await apiClient.put<ApiResponse<MilestoneResponse>>(
      `${PROJECTS_BASE}/${projectId}/milestones/${milestoneId}`,
      data
    );
    return response.data.data!;
  },

  // Delete a milestone
  delete: async (projectId: string, milestoneId: string): Promise<void> => {
    await apiClient.delete(
      `${PROJECTS_BASE}/${projectId}/milestones/${milestoneId}`
    );
  },
};
