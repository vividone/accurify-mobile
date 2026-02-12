import { api } from '@/services/api';
import type { ApiResponse } from '@/types/api.types';
import type { CategorizationRule, CreateRuleRequest } from '@/types/rule.types';

export const rulesApi = {
    getAll: async (): Promise<CategorizationRule[]> => {
        const response = await api.get<ApiResponse<CategorizationRule[]>>('/rules');
        return response.data.data || [];
    },

    create: async (data: CreateRuleRequest): Promise<CategorizationRule> => {
        const response = await api.post<ApiResponse<CategorizationRule>>('/rules', data);
        if (!response.data.data) throw new Error('Failed to create rule');
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/rules/${id}`);
    },
};
