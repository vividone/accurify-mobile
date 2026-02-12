import { api } from '@/services/api';
import type { ApiResponse, PageResponse } from '@/types/api.types';
import type { UserListResponse, UserRole } from '@/types/admin.types';

export const usersApi = {
    list: async (): Promise<UserListResponse[]> => {
        const response = await api.get<ApiResponse<PageResponse<UserListResponse>>>('/admin/users');
        return response.data.data?.content || [];
    },

    updateRole: async (userId: string, role: UserRole): Promise<UserListResponse> => {
        const response = await api.patch<ApiResponse<UserListResponse>>(`/admin/users/${userId}/role`, { role });
        if (!response.data.data) throw new Error('Failed to update role');
        return response.data.data;
    },
};
