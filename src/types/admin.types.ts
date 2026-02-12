import { UserRole, BusinessType, SubscriptionStatus, SubscriptionPlan } from './enums';
import type { User } from './auth.types';
import type { PaymentType } from './subscription.types';
import type { PaymentStatus } from './payment.types';

export { UserRole, SubscriptionStatus, SubscriptionPlan };
export type { User };

export interface UserListResponse {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    emailVerified: boolean;
    createdAt: string;
    businessName?: string;
    subscriptionPlan?: string;
}

export interface UserDetailResponse {
    user: User;
    business?: {
        id: string;
        name: string;
        subscriptionPlan: string;
    };
}

export interface SystemStatsResponse {
    totalUsers: number;
    totalBusinesses: number;
    totalAccountants: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    activeSubscriptions: number;
    pendingKycReviews: number;
    pendingVettingReviews: number;
    revenueMTD: number;
    usersByRole: Record<string, number>;
    subscriptionsByPlan: Record<string, number>;
    subscriptionsByStatus: Record<string, number>;
}

export interface UpdateUserRoleRequest {
    role: UserRole;
}

export interface BusinessListResponse {
    id: string;
    name: string;
    type: BusinessType;
    rcNumber?: string;
    address?: string;
    phone?: string;
    email?: string;
    ownerId?: string;
    ownerName?: string;
    ownerEmail?: string;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    accountantName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BusinessListParams {
    page?: number;
    size?: number;
    search?: string;
    type?: BusinessType;
}

export interface AccountantListResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    qualifications: string;
    yearsOfExperience?: number;
    specializations?: string;
    isAvailable: boolean;
    maxClients?: number;
    assignedBusinessesCount: number;
    hasUserAccount: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AccountantListParams {
    page?: number;
    size?: number;
    search?: string;
    isAvailable?: boolean;
}

export interface AssignAccountantRequest {
    accountantId: string;
    businessId: string;
}

export interface CreateAccountantRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    qualifications: string;
    yearsOfExperience?: number;
    specializations?: string;
    bio?: string;
    isAvailable?: boolean;
    maxClients?: number;
}

// ==================== Billing Types ====================

export interface BillingStatsResponse {
    revenueMTD: number;
    revenueYTD: number;
    totalRevenue: number;
    activeSubscriptions: number;
    totalTransactions: number;
    successfulTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    subscriptionsByPlan: Record<string, number>;
    revenueByPlan: Record<string, number>;
}

export interface AdminSubscriptionResponse {
    id: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    businessName?: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    amount?: number;
    currentPeriodStartsAt?: string;
    currentPeriodEndsAt?: string;
    trialEndsAt?: string;
    cancelledAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AdminTransactionResponse {
    id: string;
    paystackReference?: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    businessName?: string;
    amount: number;
    currency: string;
    paymentType: PaymentType;
    plan: SubscriptionPlan;
    status: PaymentStatus;
    description?: string;
    failureReason?: string;
    periodStart?: string;
    periodEnd?: string;
    createdAt: string;
}

export interface BillingSubscriptionsParams {
    page?: number;
    size?: number;
    status?: SubscriptionStatus;
}

export interface BillingTransactionsParams {
    page?: number;
    size?: number;
    status?: PaymentStatus;
}

// ==================== System Invoice Types ====================

export type SystemInvoiceType = 'RETAINER_SUBSCRIPTION' | 'PLATFORM_SUBSCRIPTION';
export type SystemInvoiceStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface SystemInvoiceResponse {
    id: string;
    invoiceNumber: string;
    invoiceType: SystemInvoiceType;
    status: SystemInvoiceStatus;
    businessId?: string;
    businessName?: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    invoiceDate: string;
    dueDate: string;
    periodStart: string;
    periodEnd: string;
    description: string;
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    total: number;
    paymentReference?: string;
    paidAt?: string;
    paystackReference?: string;
    accountingRecorded: boolean;
    accountantId?: string;
    accountantName?: string;
    tierName?: string;
    planName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SystemInvoicesParams {
    page?: number;
    size?: number;
    type?: SystemInvoiceType;
    status?: SystemInvoiceStatus;
}
