import apiClient from './client';
import type {
    ApiResponse,
    PageResponse,
    UserListResponse,
    UserDetailResponse,
    SystemStatsResponse,
    UpdateUserRoleRequest,
    BusinessListResponse,
    BusinessListParams,
    AccountantListResponse,
    AccountantListParams,
    AssignAccountantRequest,
    CreateAccountantRequest,
    BillingStatsResponse,
    AdminSubscriptionResponse,
    AdminTransactionResponse,
    BillingSubscriptionsParams,
    BillingTransactionsParams,
    SystemInvoiceResponse,
    SystemInvoicesParams,
    SubscriptionResponse,
} from '@/types';
import { UserRole, SubscriptionPlan } from '@/types';

const ADMIN_BASE = '/admin';

export interface GetUsersParams {
    page?: number;
    size?: number;
    search?: string;
    role?: UserRole;
}

export const adminApi = {
    // Get all users (paginated)
    getUsers: async (params: GetUsersParams = {}): Promise<PageResponse<UserListResponse>> => {
        const response = await apiClient.get<ApiResponse<PageResponse<UserListResponse>>>(
            `${ADMIN_BASE}/users`,
            { params }
        );
        return response.data.data!;
    },

    // Get user details
    getUser: async (userId: string): Promise<UserDetailResponse> => {
        const response = await apiClient.get<ApiResponse<UserDetailResponse>>(
            `${ADMIN_BASE}/users/${userId}`
        );
        return response.data.data!;
    },

    // Update user role
    updateUserRole: async (userId: string, data: UpdateUserRoleRequest): Promise<UserDetailResponse> => {
        const response = await apiClient.put<ApiResponse<UserDetailResponse>>(
            `${ADMIN_BASE}/users/${userId}/role`,
            data
        );
        return response.data.data!;
    },

    // Get system stats
    getSystemStats: async (): Promise<SystemStatsResponse> => {
        const response = await apiClient.get<ApiResponse<SystemStatsResponse>>(
            `${ADMIN_BASE}/stats`
        );
        return response.data.data!;
    },

    // Get all businesses (paginated)
    getBusinesses: async (params: BusinessListParams = {}): Promise<PageResponse<BusinessListResponse>> => {
        const response = await apiClient.get<ApiResponse<PageResponse<BusinessListResponse>>>(
            `${ADMIN_BASE}/businesses`,
            { params }
        );
        return response.data.data!;
    },

    // Get business details
    getBusiness: async (businessId: string): Promise<BusinessListResponse> => {
        const response = await apiClient.get<ApiResponse<BusinessListResponse>>(
            `${ADMIN_BASE}/businesses/${businessId}`
        );
        return response.data.data!;
    },

    // Get all accountants (paginated)
    getAccountants: async (params: AccountantListParams = {}): Promise<PageResponse<AccountantListResponse>> => {
        const response = await apiClient.get<ApiResponse<PageResponse<AccountantListResponse>>>(
            `${ADMIN_BASE}/accountants`,
            { params }
        );
        return response.data.data!;
    },

    // Get accountant details
    getAccountant: async (accountantId: string): Promise<AccountantListResponse> => {
        const response = await apiClient.get<ApiResponse<AccountantListResponse>>(
            `${ADMIN_BASE}/accountants/${accountantId}`
        );
        return response.data.data!;
    },

    // Assign accountant to business
    assignAccountant: async (data: AssignAccountantRequest): Promise<void> => {
        await apiClient.post<ApiResponse<void>>(
            `${ADMIN_BASE}/accountants/assign`,
            data
        );
    },

    // Unassign accountant from business
    unassignAccountant: async (businessId: string): Promise<void> => {
        await apiClient.delete<ApiResponse<void>>(
            `${ADMIN_BASE}/accountants/assign/${businessId}`
        );
    },

    // Create a new accountant
    createAccountant: async (data: CreateAccountantRequest): Promise<AccountantListResponse> => {
        const response = await apiClient.post<ApiResponse<AccountantListResponse>>(
            `${ADMIN_BASE}/accountants`,
            data
        );
        return response.data.data!;
    },

    // Send invite to accountant
    sendAccountantInvite: async (accountantId: string): Promise<void> => {
        await apiClient.post<ApiResponse<void>>(
            `${ADMIN_BASE}/accountants/${accountantId}/invite`
        );
    },

    // ==================== Billing ====================

    // Get billing statistics
    getBillingStats: async (): Promise<BillingStatsResponse> => {
        const response = await apiClient.get<ApiResponse<BillingStatsResponse>>(
            `${ADMIN_BASE}/billing/stats`
        );
        return response.data.data!;
    },

    // Get all subscriptions (paginated)
    getSubscriptions: async (params: BillingSubscriptionsParams = {}): Promise<PageResponse<AdminSubscriptionResponse>> => {
        const response = await apiClient.get<ApiResponse<PageResponse<AdminSubscriptionResponse>>>(
            `${ADMIN_BASE}/billing/subscriptions`,
            { params }
        );
        return response.data.data!;
    },

    // Get all transactions (paginated)
    getTransactions: async (params: BillingTransactionsParams = {}): Promise<PageResponse<AdminTransactionResponse>> => {
        const response = await apiClient.get<ApiResponse<PageResponse<AdminTransactionResponse>>>(
            `${ADMIN_BASE}/billing/transactions`,
            { params }
        );
        return response.data.data!;
    },

    // Get all system invoices (paginated)
    getSystemInvoices: async (params: SystemInvoicesParams = {}): Promise<PageResponse<SystemInvoiceResponse>> => {
        const response = await apiClient.get<ApiResponse<PageResponse<SystemInvoiceResponse>>>(
            `${ADMIN_BASE}/billing/invoices`,
            { params }
        );
        return response.data.data!;
    },

    // Manually activate a subscription (for fixing stuck subscriptions)
    activateSubscription: async (
        userId: string,
        plan: SubscriptionPlan,
        durationMonths: number = 1
    ): Promise<SubscriptionResponse> => {
        const response = await apiClient.post<ApiResponse<SubscriptionResponse>>(
            `${ADMIN_BASE}/billing/subscriptions/${userId}/activate`,
            null,
            { params: { plan, durationMonths } }
        );
        return response.data.data!;
    },

    // Email Templates
    getEmailTemplates: async (): Promise<EmailTemplateInfo[]> => {
        const response = await apiClient.get<ApiResponse<EmailTemplateInfo[]>>(
            `${ADMIN_BASE}/email-templates`
        );
        return response.data.data!;
    },

    getEmailTemplatePreview: async (templateId: string): Promise<EmailPreview> => {
        const response = await apiClient.get<ApiResponse<EmailPreview>>(
            `${ADMIN_BASE}/email-templates/${templateId}/preview`
        );
        return response.data.data!;
    },

    sendTestEmail: async (templateId: string, recipientEmail: string): Promise<void> => {
        await apiClient.post<ApiResponse<void>>(
            `${ADMIN_BASE}/email-templates/send-test`,
            null,
            { params: { templateId, recipientEmail } }
        );
    },
};

// Email Template Types
export interface EmailTemplateInfo {
    id: string;
    name: string;
    subject: string;
    description: string;
    type: string;
    category: string;
    active: boolean;
}

export interface EmailPreview {
    id: string;
    name: string;
    subject: string;
    htmlContent: string;
    plainTextContent: string;
}
