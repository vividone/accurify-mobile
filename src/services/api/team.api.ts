import apiClient from './client';
import type { ApiResponse } from '@/types';
import type { TeamMember, InviteTeamMemberRequest, UpdateTeamMemberRoleRequest } from '@/types/team.types';

const BASE = '/team';

export const teamApi = {
  getTeamMembers: async (): Promise<TeamMember[]> => {
    const response = await apiClient.get<ApiResponse<TeamMember[]>>(BASE);
    return response.data.data!;
  },

  inviteMember: async (data: InviteTeamMemberRequest): Promise<TeamMember> => {
    const response = await apiClient.post<ApiResponse<TeamMember>>(`${BASE}/invite`, data);
    return response.data.data!;
  },

  updateMemberRole: async (id: string, data: UpdateTeamMemberRoleRequest): Promise<TeamMember> => {
    const response = await apiClient.put<ApiResponse<TeamMember>>(`${BASE}/${id}/role`, data);
    return response.data.data!;
  },

  removeMember: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
