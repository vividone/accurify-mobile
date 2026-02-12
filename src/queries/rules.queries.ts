import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rulesApi } from '@/services/api/rules.api';
import type { CreateRuleRequest } from '@/types/rule.types';

export const ruleKeys = {
    all: ['rules'] as const,
    list: () => [...ruleKeys.all, 'list'] as const,
};

export const useRules = () => {
    return useQuery({
        queryKey: ruleKeys.list(),
        queryFn: rulesApi.getAll,
    });
};

export const useCreateRule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateRuleRequest) => rulesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ruleKeys.list() });
        },
    });
};

export const useDeleteRule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => rulesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ruleKeys.list() });
        },
    });
};
