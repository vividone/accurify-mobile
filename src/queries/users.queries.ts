import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users.api';
import type { UserRole } from '@/types/admin.types';

export const userKeys = {
    all: ['users'] as const,
    list: () => [...userKeys.all, 'list'] as const,
};

export const useUsers = () => {
    return useQuery({
        queryKey: userKeys.list(),
        queryFn: usersApi.list,
    });
};

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
            usersApi.updateRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.list() });
        },
    });
};
