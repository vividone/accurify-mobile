import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankAccountsApi } from '@/services/api/bank-accounts.api';
import type { ConnectBankRequest } from '@/types';

export const bankAccountKeys = {
    all: ['bankAccounts'] as const,
    list: () => [...bankAccountKeys.all, 'list'] as const,
    detail: (id: string) => [...bankAccountKeys.all, 'detail', id] as const,
};

export const useBankAccounts = () => {
    // Note: Access control is handled by PremiumRoute wrapper in router
    // This hook assumes the user has premium access if the component is mounted
    return useQuery({
        queryKey: bankAccountKeys.list(),
        queryFn: () => bankAccountsApi.list(),
    });
};

export const useBankAccount = (id: string) => {
    return useQuery({
        queryKey: bankAccountKeys.detail(id),
        queryFn: () => bankAccountsApi.getById(id),
        enabled: !!id,
    });
};

export const useConnectBankAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ConnectBankRequest) => bankAccountsApi.connect(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bankAccountKeys.list() });
        },
    });
};

export const useSyncBankAccount = () => {
    return useMutation({
        mutationFn: (id: string) => bankAccountsApi.sync(id),
    });
};

export const useDisconnectBankAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => bankAccountsApi.disconnect(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bankAccountKeys.list() });
        },
    });
};
