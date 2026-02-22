import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  TeamMember,
  TeamMemberRequest,
} from '@/types';

const BASE = '/team-members';

export const teamMembersApi = {
  // List team members with pagination
  list: async (page = 0, size = 20): Promise<PageResponse<TeamMember>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get<ApiResponse<PageResponse<TeamMember>>>(
      `${BASE}?${params}`
    );
    return response.data.data!;
  },

  // Get single team member
  getById: async (id: string): Promise<TeamMember> => {
    const response = await apiClient.get<ApiResponse<TeamMember>>(
      `${BASE}/${id}`
    );
    return response.data.data!;
  },

  // Create team member
  create: async (data: TeamMemberRequest): Promise<TeamMember> => {
    const response = await apiClient.post<ApiResponse<TeamMember>>(
      BASE,
      data
    );
    return response.data.data!;
  },

  // Update team member
  update: async (id: string, data: TeamMemberRequest): Promise<TeamMember> => {
    const response = await apiClient.put<ApiResponse<TeamMember>>(
      `${BASE}/${id}`,
      data
    );
    return response.data.data!;
  },

  // Deactivate team member
  deactivate: async (id: string): Promise<void> => {
    await apiClient.patch(`${BASE}/${id}/deactivate`);
  },
};
