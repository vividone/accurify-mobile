import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type GetUsersParams } from '@/services/api/admin.api';
import type { UpdateUserRoleRequest, BusinessListParams, AccountantListParams, AssignAccountantRequest, CreateAccountantRequest, BillingSubscriptionsParams, BillingTransactionsParams, SystemInvoicesParams } from '@/types';
import { SubscriptionPlan } from '@/types';

export const adminKeys = {
    all: ['admin'] as const,
    users: (params: GetUsersParams) => [...adminKeys.all, 'users', params] as const,
    user: (id: string) => [...adminKeys.all, 'user', id] as const,
    stats: () => [...adminKeys.all, 'stats'] as const,
    businesses: (params: BusinessListParams) => [...adminKeys.all, 'businesses', params] as const,
    business: (id: string) => [...adminKeys.all, 'business', id] as const,
    accountants: (params: AccountantListParams) => [...adminKeys.all, 'accountants', params] as const,
    accountant: (id: string) => [...adminKeys.all, 'accountant', id] as const,
    // Billing
    billingStats: () => [...adminKeys.all, 'billing', 'stats'] as const,
    subscriptions: (params: BillingSubscriptionsParams) => [...adminKeys.all, 'billing', 'subscriptions', params] as const,
    transactions: (params: BillingTransactionsParams) => [...adminKeys.all, 'billing', 'transactions', params] as const,
    systemInvoices: (params: SystemInvoicesParams) => [...adminKeys.all, 'billing', 'invoices', params] as const,
};

export const useAdminUsers = (params: GetUsersParams = {}) => {
    return useQuery({
        queryKey: adminKeys.users(params),
        queryFn: () => adminApi.getUsers(params),
    });
};

export const useAdminUser = (userId: string) => {
    return useQuery({
        queryKey: adminKeys.user(userId),
        queryFn: () => adminApi.getUser(userId),
        enabled: !!userId,
    });
};

export const useAdminStats = () => {
    return useQuery({
        queryKey: adminKeys.stats(),
        queryFn: () => adminApi.getSystemStats(),
    });
};

export const useAdminUpdateUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRoleRequest }) =>
            adminApi.updateUserRole(userId, data),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.user(userId) });
            queryClient.invalidateQueries({ queryKey: adminKeys.all }); // Invalidate list as well
        },
    });
};

export const useAdminBusinesses = (params: BusinessListParams = {}) => {
    return useQuery({
        queryKey: adminKeys.businesses(params),
        queryFn: () => adminApi.getBusinesses(params),
    });
};

export const useAdminBusiness = (businessId: string) => {
    return useQuery({
        queryKey: adminKeys.business(businessId),
        queryFn: () => adminApi.getBusiness(businessId),
        enabled: !!businessId,
    });
};

export const useAdminAccountants = (params: AccountantListParams = {}) => {
    return useQuery({
        queryKey: adminKeys.accountants(params),
        queryFn: () => adminApi.getAccountants(params),
    });
};

export const useAdminAccountant = (accountantId: string) => {
    return useQuery({
        queryKey: adminKeys.accountant(accountantId),
        queryFn: () => adminApi.getAccountant(accountantId),
        enabled: !!accountantId,
    });
};

export const useAssignAccountant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AssignAccountantRequest) => adminApi.assignAccountant(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.all });
        },
    });
};

export const useUnassignAccountant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (businessId: string) => adminApi.unassignAccountant(businessId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.all });
        },
    });
};

export const useCreateAccountant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAccountantRequest) => adminApi.createAccountant(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.all });
        },
    });
};

export const useSendAccountantInvite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (accountantId: string) => adminApi.sendAccountantInvite(accountantId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.all });
        },
    });
};

// ==================== Billing Queries ====================

export const useBillingStats = () => {
    return useQuery({
        queryKey: adminKeys.billingStats(),
        queryFn: () => adminApi.getBillingStats(),
    });
};

export const useAdminSubscriptions = (params: BillingSubscriptionsParams = {}) => {
    return useQuery({
        queryKey: adminKeys.subscriptions(params),
        queryFn: () => adminApi.getSubscriptions(params),
    });
};

export const useAdminTransactions = (params: BillingTransactionsParams = {}) => {
    return useQuery({
        queryKey: adminKeys.transactions(params),
        queryFn: () => adminApi.getTransactions(params),
    });
};

export const useAdminSystemInvoices = (params: SystemInvoicesParams = {}) => {
    return useQuery({
        queryKey: adminKeys.systemInvoices(params),
        queryFn: () => adminApi.getSystemInvoices(params),
    });
};

// ==================== Subscription Mutations ====================

export interface ActivateSubscriptionParams {
    userId: string;
    plan: SubscriptionPlan;
    durationMonths?: number;
}

export const useActivateSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, plan, durationMonths = 1 }: ActivateSubscriptionParams) =>
            adminApi.activateSubscription(userId, plan, durationMonths),
        onSuccess: () => {
            // Invalidate subscriptions to refresh the list
            queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'billing', 'subscriptions'] });
            queryClient.invalidateQueries({ queryKey: adminKeys.billingStats() });
        },
    });
};
