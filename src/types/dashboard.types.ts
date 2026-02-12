import type { TaxZone, ThresholdStatus } from './enums';

export interface RevenueResult {
  totalInflows: number;
  revenue: number;
  vatThreshold: number;
  citThreshold: number;
  vatStatus: ThresholdStatus;
  citStatus: ThresholdStatus;
  zone: TaxZone;
  revenuePercentOfCit: number;
  remainingToCit: number;
}

export interface RecentActivity {
  id: string;
  type: 'invoice_paid' | 'invoice_sent' | 'transaction_created';
  description: string;
  amount?: number;
  timestamp: string;
}

export interface DashboardData {
  revenue: RevenueResult;
  unpaidInvoicesTotal: number;
  unpaidInvoicesCount: number;
  uncategorizedTransactionsCount: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueChangePercent: number;
  recentActivity: RecentActivity[];
}
