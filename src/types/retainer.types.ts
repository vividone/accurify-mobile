// Retainer subscription types for MVP 2.0

export type RetainerStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
export type DeliverableStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED' | 'REJECTED';
export type PayoutStatus = 'LOCKED' | 'RELEASED' | 'PAID' | 'REFUNDED';

export interface ServiceTier {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  features: {
    monthly_calls?: boolean;
    max_calls_per_month?: number;
    chat_support?: boolean;
    chat_allowed?: boolean;
    calls_allowed?: boolean;
    vat_filing?: boolean;
    income_tax?: boolean;
    tax_filing?: boolean;
    payroll?: boolean;
    monthly_report?: boolean;
    quarterly_report?: boolean;
    annual_report?: boolean;
    quarterly_review?: boolean;
    annual_review?: boolean;
  };
  sortOrder: number;
}

export interface AccountantSubscription {
  id: string;
  businessId: string;
  businessName: string;
  accountantId: string;
  accountantName: string;
  accountantEmail?: string;
  tier: ServiceTier;
  tierName?: string; // Convenience field from tier.name
  status: RetainerStatus;
  startDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  nextBillingDate?: string;
  monthlyPrice?: number; // Price in kobo
  lockedPrice: number;
  cancelAtPeriodEnd?: boolean;
  createdAt: string;
}

export interface MonthlyDeliverable {
  id: string;
  subscriptionId: string;
  businessId: string;
  businessName: string;
  tierName: string;
  monthYear: string;
  periodLabel: string; // e.g., "January 2026"
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  status: DeliverableStatus;
  payoutStatus: PayoutStatus;
  reportUrl?: string;
  reportType?: string;
  reportGeneratedAt?: string;
  startedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  amountCharged: number;
  commissionAmount: number;
  accountantPayout: number;
  transactionsReviewed?: number;
  transactionsAutoCategorized?: number;
  timeSpentMinutes?: number;
  clientNotes?: string;
  revisionNotes?: string;
  createdAt: string;
}

export interface AccountantStats {
  activeClients: number;
  totalClients: number;
  pendingDeliverables: number;
  inProgressDeliverables: number;
  submittedDeliverables: number;
  completedDeliverables: number;
  totalEarnings: number; // In kobo
  pendingPayouts: number; // In kobo
  completionRate?: number; // Percentage
  avgTimeSpentMinutes?: number;
  avgAutoCategorizedRate?: number;
}

export interface PracticeDashboard {
  stats: AccountantStats;
  currentMonthDeliverables: MonthlyDeliverable[];
  currentMonthYear: string;
}

export interface CreateSubscriptionRequest {
  businessId: string;
  accountantId: string;
  tierId: string;
}

export interface SubmitDeliverableRequest {
  reportUrl: string;
  reportType: string;
  transactionsReviewed?: number;
  transactionsAutoCategorized?: number;
  timeSpentMinutes?: number;
  accountantNotes?: string;
}
