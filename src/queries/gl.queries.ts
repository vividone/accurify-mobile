import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
// import { useSubscriptionStore } from '@/store/subscription.store'; // TODO: Restore when premium check is re-enabled

// ==================== Types ====================

export type GlAccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: GlAccountType;
  subtype?: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  balance: number;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
}

export interface CreateAccountRequest {
  code: string;
  name: string;
  type: GlAccountType;
  description?: string;
}

export interface UpdateAccountRequest {
  name: string;
  description?: string;
}

export interface CreateJournalRequest {
  date: string; // YYYY-MM-DD
  description: string;
  reference?: string;
  lines: JournalLineRequest[];
}

export interface JournalLineRequest {
  accountCode: string;
  debit?: number;
  credit?: number;
  memo?: string;
}

export interface TrialBalanceLine {
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceResponse {
  lines: TrialBalanceLine[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

export interface JournalLine {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  reference?: string;
  status: 'DRAFT' | 'POSTED' | 'VOIDED';
  sourceType?: string;
  sourceId?: string;
  createdByAgent: boolean;
  agentConfidence?: number;
  lines: JournalLine[];
  totalDebits: number;
  totalCredits: number;
  postedAt?: string;
  createdAt: string;
}

export interface TaxSummary {
  vatPayable: number;
  whtPayable: number;
  whtReceivable: number;
  citExpense: number;
  netVatPosition: number;
}

export interface GeneralLedgerLine {
  date: string;
  entryNumber: string;
  description: string;
  memo?: string;
  debit: number;
  credit: number;
  balance: number;
}

// Balance Sheet Types
export interface BalanceSheetLine {
  code: string;
  name: string;
  balance: number;
}

export interface BalanceSheetSection {
  sectionName: string;
  lines: BalanceSheetLine[];
  total: number;
}

export type AccountingBasis = 'ACCRUAL' | 'CASH';

export interface BalanceSheetReport {
  asOfDate: string;
  basis?: AccountingBasis;
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
}

// Cash Flow Types
export interface CashFlowLine {
  description: string;
  amount: number;
}

export interface CashFlowSection {
  sectionName: string;
  lines: CashFlowLine[];
  total: number;
}

export interface CashFlowReport {
  startDate: string;
  endDate: string;
  basis?: AccountingBasis;
  operatingActivities: CashFlowSection;
  investingActivities: CashFlowSection;
  financingActivities: CashFlowSection;
  netCashFlow: number;
  openingCashBalance: number;
  closingCashBalance: number;
}

// Income Statement Types
export interface IncomeStatementLine {
  code: string;
  name: string;
  amount: number;
}

export interface IncomeStatementSection {
  sectionName: string;
  lines: IncomeStatementLine[];
  total: number;
}

export interface IncomeStatementReport {
  startDate: string;
  endDate: string;
  basis?: AccountingBasis;
  revenue: IncomeStatementSection;
  costOfSales: IncomeStatementSection;
  grossProfit: number;
  operatingExpenses: IncomeStatementSection;
  operatingIncome: number;
  otherIncomeExpenses: IncomeStatementSection;
  netIncome: number;
}

// Aging Report Types
export interface AgingBucket {
  label: string;
  startDays: number;
  endDays: number;
  amount: number;
  count: number;
}

export interface AgingPartyTotal {
  partyId: string;
  partyName: string;
  totalAmount: number;
  count: number;
  currentAmount: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90: number;
}

export interface AgingReport {
  reportType: 'AR_AGING' | 'AP_AGING';
  asOfDate: string;
  totalOutstanding: number;
  totalCount: number;
  buckets: AgingBucket[];
  partyTotals: AgingPartyTotal[];
}

// Product Profitability Types
export interface ProductProfitabilityLine {
  productId: string;
  productName: string;
  sku: string | null;
  quantitySold: number;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMarginPercent: number;
  averageSellPrice: number;
  averageCostPrice: number;
}

export interface ProductProfitabilityReport {
  startDate: string;
  endDate: string;
  totalProducts: number;
  totalRevenue: number;
  totalCogs: number;
  totalGrossProfit: number;
  averageGrossMargin: number;
  products: ProductProfitabilityLine[];
}

// Cash Flow Forecast Types
export interface ForecastPeriod {
  label: string;
  days: number;
  expectedInflows: number;
  expectedOutflows: number;
  netCashFlow: number;
  projectedBalance: number;
}

export interface UpcomingPayable {
  billId: string;
  supplierName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
}

export interface UpcomingReceivable {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
}

export interface CashFlowForecast {
  asOfDate: string;
  currentCashBalance: number;
  periods: ForecastPeriod[];
  totalExpectedInflows: number;
  totalExpectedOutflows: number;
  upcomingPayables: UpcomingPayable[];
  upcomingReceivables: UpcomingReceivable[];
}

// Margin Trend Types
export interface MonthlyMargin {
  month: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marginPercent: number;
}

export interface MarginAlert {
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  period: string;
}

export interface MarginTrendReport {
  currentMonthMargin: number;
  previousMonthMargin: number;
  changePercent: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  monthlyData: MonthlyMargin[];
  alerts: MarginAlert[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ==================== Query Keys ====================

// Keys include optional businessId to support both regular users and accountants viewing client data
export const glKeys = {
  all: ['gl'] as const,
  // Business-scoped keys for accountants accessing client data
  forBusiness: (businessId?: string) => [...glKeys.all, 'business', businessId] as const,
  accounts: (businessId?: string) => [...glKeys.forBusiness(businessId), 'accounts'] as const,
  accountsByType: (type: string, businessId?: string) => [...glKeys.forBusiness(businessId), 'accounts', type] as const,
  account: (id: string, businessId?: string) => [...glKeys.forBusiness(businessId), 'account', id] as const,
  trialBalance: (businessId?: string) => [...glKeys.forBusiness(businessId), 'trial-balance'] as const,
  balanceSheet: (asOf?: string, basis?: AccountingBasis, businessId?: string) => [...glKeys.forBusiness(businessId), 'balance-sheet', asOf, basis] as const,
  cashFlow: (from?: string, to?: string, basis?: AccountingBasis, businessId?: string) => [...glKeys.forBusiness(businessId), 'cash-flow', { from, to, basis }] as const,
  incomeStatement: (from?: string, to?: string, basis?: AccountingBasis, businessId?: string) => [...glKeys.forBusiness(businessId), 'income-statement', { from, to, basis }] as const,
  arAging: (asOf?: string, businessId?: string) => [...glKeys.forBusiness(businessId), 'ar-aging', asOf] as const,
  apAging: (asOf?: string, businessId?: string) => [...glKeys.forBusiness(businessId), 'ap-aging', asOf] as const,
  journals: (page?: number, size?: number, status?: string, businessId?: string) => [...glKeys.forBusiness(businessId), 'journals', { page, size, status }] as const,
  journal: (id: string, businessId?: string) => [...glKeys.forBusiness(businessId), 'journal', id] as const,
  messyPile: (page?: number, size?: number, businessId?: string) => [...glKeys.forBusiness(businessId), 'messy-pile', { page, size }] as const,
  draftCount: (businessId?: string) => [...glKeys.forBusiness(businessId), 'draft-count'] as const,
  taxSummary: (businessId?: string) => [...glKeys.forBusiness(businessId), 'tax-summary'] as const,
  accountLedger: (accountId: string, page?: number, size?: number, from?: string, to?: string, businessId?: string) =>
    [...glKeys.forBusiness(businessId), 'account-ledger', accountId, { page, size, from, to }] as const,
  productProfitability: (from?: string, to?: string, businessId?: string) =>
    [...glKeys.forBusiness(businessId), 'product-profitability', { from, to }] as const,
  cashFlowForecast: (businessId?: string) =>
    [...glKeys.forBusiness(businessId), 'cash-flow-forecast'] as const,
  marginTrend: (months?: number, businessId?: string) =>
    [...glKeys.forBusiness(businessId), 'margin-trend', months] as const,
};

// ==================== API Functions ====================

// Helper to build headers with optional X-Business-Id for accountant access
const buildHeaders = (businessId?: string) => {
  if (businessId) {
    return { 'X-Business-Id': businessId };
  }
  return undefined;
};

const glApi = {
  getAccounts: async (type?: string, businessId?: string): Promise<Account[]> => {
    const params = type ? `?type=${type}` : '';
    const response = await apiClient.get<Account[]>(`/gl/accounts${params}`, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getAccount: async (id: string, businessId?: string): Promise<Account> => {
    const response = await apiClient.get<Account>(`/gl/accounts/${id}`, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getTrialBalance: async (businessId?: string): Promise<TrialBalanceResponse> => {
    const response = await apiClient.get<TrialBalanceResponse>('/gl/trial-balance', {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getJournals: async (page = 0, size = 20, status?: string, businessId?: string): Promise<PageResponse<JournalEntry>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.append('status', status);
    const response = await apiClient.get<PageResponse<JournalEntry>>(`/gl/journals?${params}`, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getJournal: async (id: string, businessId?: string): Promise<JournalEntry> => {
    const response = await apiClient.get<JournalEntry>(`/gl/journals/${id}`, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getMessyPile: async (page = 0, size = 20, businessId?: string): Promise<PageResponse<JournalEntry>> => {
    const response = await apiClient.get<PageResponse<JournalEntry>>(`/gl/journals/messy-pile?page=${page}&size=${size}`, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getDraftCount: async (businessId?: string): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/gl/journals/draft-count', {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  postJournal: async (entryId: string, businessId?: string): Promise<JournalEntry> => {
    const response = await apiClient.post<JournalEntry>(`/gl/journals/${entryId}/post`, null, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  bulkPostJournals: async (entryIds: string[], businessId?: string): Promise<JournalEntry[]> => {
    const response = await apiClient.post<JournalEntry[]>('/gl/journals/bulk-post', entryIds, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getTaxSummary: async (businessId?: string): Promise<TaxSummary> => {
    const response = await apiClient.get<TaxSummary>('/gl/tax-summary', {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getBalanceSheet: async (asOf?: string, basis?: AccountingBasis, businessId?: string): Promise<BalanceSheetReport> => {
    const params = new URLSearchParams();
    if (asOf) params.append('asOf', asOf);
    if (basis) params.append('basis', basis);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<BalanceSheetReport>(`/gl/balance-sheet${queryString}`, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getCashFlow: async (from?: string, to?: string, basis?: AccountingBasis, businessId?: string): Promise<CashFlowReport> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (basis) params.append('basis', basis);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<CashFlowReport>(`/gl/cash-flow${queryString}`, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getIncomeStatement: async (from?: string, to?: string, basis?: AccountingBasis, businessId?: string): Promise<IncomeStatementReport> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (basis) params.append('basis', basis);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<IncomeStatementReport>(`/gl/income-statement${queryString}`, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getArAging: async (asOf?: string, businessId?: string): Promise<AgingReport> => {
    const params = asOf ? `?asOf=${asOf}` : '';
    const response = await apiClient.get<AgingReport>(`/gl/ar-aging${params}`, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getApAging: async (asOf?: string, businessId?: string): Promise<AgingReport> => {
    const params = asOf ? `?asOf=${asOf}` : '';
    const response = await apiClient.get<AgingReport>(`/gl/ap-aging${params}`, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getAccountLedger: async (
    accountId: string,
    page = 0,
    size = 50,
    from?: string,
    to?: string,
    businessId?: string
  ): Promise<PageResponse<GeneralLedgerLine>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const response = await apiClient.get<PageResponse<GeneralLedgerLine>>(
      `/gl/accounts/${accountId}/ledger?${params}`,
      { headers: buildHeaders(businessId) }
    );
    return response.data;
  },

  getProductProfitability: async (from?: string, to?: string, businessId?: string): Promise<ProductProfitabilityReport> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<ProductProfitabilityReport>(`/gl/product-profitability${queryString}`, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getCashFlowForecast: async (businessId?: string): Promise<CashFlowForecast> => {
    const response = await apiClient.get<CashFlowForecast>('/gl/cash-flow-forecast', {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  getMarginTrend: async (months?: number, businessId?: string): Promise<MarginTrendReport> => {
    const params = months ? `?months=${months}` : '';
    const response = await apiClient.get<MarginTrendReport>(`/gl/margin-trend${params}`, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  // Account mutations
  createAccount: async (data: CreateAccountRequest, businessId?: string): Promise<Account> => {
    const response = await apiClient.post<Account>('/gl/accounts', data, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  updateAccount: async (id: string, data: UpdateAccountRequest, businessId?: string): Promise<Account> => {
    const response = await apiClient.put<Account>(`/gl/accounts/${id}`, data, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  deactivateAccount: async (id: string, businessId?: string): Promise<void> => {
    await apiClient.delete(`/gl/accounts/${id}`, {
      headers: buildHeaders(businessId),
    });
  },

  // Journal mutations
  createJournal: async (data: CreateJournalRequest, businessId?: string): Promise<JournalEntry> => {
    const response = await apiClient.post<JournalEntry>('/gl/journals', data, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },

  voidJournal: async (id: string, reason: string, businessId?: string): Promise<JournalEntry> => {
    const response = await apiClient.post<JournalEntry>(`/gl/journals/${id}/void`, { reason }, {
      headers: buildHeaders(businessId),
    });
    return response.data;
  },
};

// ==================== Query Hooks ====================

// Helper to check premium access
const usePremiumAccess = () => {
  // TODO: Restore premium check after testing
  // const { isPremium, isTrialing } = useSubscriptionStore();
  // return isPremium || isTrialing;
  return true; // Temporarily bypass premium check for testing
};

/**
 * Hook to get all accounts for a business
 * @param type - Optional account type filter
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useAccounts = (type?: string, businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: type ? glKeys.accountsByType(type, businessId) : glKeys.accounts(businessId),
    queryFn: () => glApi.getAccounts(type, businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get a single account
 * @param id - Account ID
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useAccount = (id: string, businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.account(id, businessId),
    queryFn: () => glApi.getAccount(id, businessId),
    enabled: !!id && hasPremiumAccess,
  });
};

/**
 * Hook to get trial balance
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useTrialBalance = (businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.trialBalance(businessId),
    queryFn: () => glApi.getTrialBalance(businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get paginated journal entries
 * @param page - Page number (0-indexed)
 * @param size - Page size
 * @param status - Optional status filter
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useJournals = (page = 0, size = 20, status?: string, businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.journals(page, size, status, businessId),
    queryFn: () => glApi.getJournals(page, size, status, businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get a single journal entry
 * @param id - Journal entry ID
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useJournal = (id: string, businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.journal(id, businessId),
    queryFn: () => glApi.getJournal(id, businessId),
    enabled: !!id && hasPremiumAccess,
  });
};

/**
 * Hook to get draft journal entries (messy pile)
 * @param page - Page number (0-indexed)
 * @param size - Page size
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useMessyPile = (page = 0, size = 20, businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.messyPile(page, size, businessId),
    queryFn: () => glApi.getMessyPile(page, size, businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get draft journal entry count
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useDraftCount = (businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.draftCount(businessId),
    queryFn: () => glApi.getDraftCount(businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get tax summary
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useTaxSummary = (businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.taxSummary(businessId),
    queryFn: () => glApi.getTaxSummary(businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get balance sheet report
 * @param asOf - As of date (YYYY-MM-DD format)
 * @param basis - Optional accounting basis (ACCRUAL or CASH)
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useBalanceSheet = (asOf?: string, basis?: AccountingBasis, businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.balanceSheet(asOf, basis, businessId),
    queryFn: () => glApi.getBalanceSheet(asOf, basis, businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get cash flow report
 * @param from - Start date (YYYY-MM-DD format)
 * @param to - End date (YYYY-MM-DD format)
 * @param basis - Optional accounting basis (ACCRUAL or CASH)
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useCashFlow = (from?: string, to?: string, basis?: AccountingBasis, businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.cashFlow(from, to, basis, businessId),
    queryFn: () => glApi.getCashFlow(from, to, basis, businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get income statement (profit & loss) report
 * @param from - Start date (YYYY-MM-DD format)
 * @param to - End date (YYYY-MM-DD format)
 * @param basis - Optional accounting basis (ACCRUAL or CASH)
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useIncomeStatement = (from?: string, to?: string, basis?: AccountingBasis, businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.incomeStatement(from, to, basis, businessId),
    queryFn: () => glApi.getIncomeStatement(from, to, basis, businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get AR aging report
 * @param asOf - As of date (YYYY-MM-DD format)
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useArAging = (asOf?: string, businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.arAging(asOf, businessId),
    queryFn: () => glApi.getArAging(asOf, businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get AP aging report
 * @param asOf - As of date (YYYY-MM-DD format)
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useApAging = (asOf?: string, businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.apAging(asOf, businessId),
    queryFn: () => glApi.getApAging(asOf, businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get general ledger (account transaction history)
 * @param accountId - The GL account ID
 * @param page - Page number (0-indexed)
 * @param size - Page size
 * @param from - Start date filter (YYYY-MM-DD format)
 * @param to - End date filter (YYYY-MM-DD format)
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useAccountLedger = (
  accountId: string,
  page = 0,
  size = 50,
  from?: string,
  to?: string,
  businessId?: string
) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.accountLedger(accountId, page, size, from, to, businessId),
    queryFn: () => glApi.getAccountLedger(accountId, page, size, from, to, businessId),
    enabled: hasPremiumAccess && !!accountId,
  });
};

/**
 * Hook to get product profitability report
 * @param from - Start date (YYYY-MM-DD format)
 * @param to - End date (YYYY-MM-DD format)
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useProductProfitability = (from?: string, to?: string, businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.productProfitability(from, to, businessId),
    queryFn: () => glApi.getProductProfitability(from, to, businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get cash flow forecast
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useCashFlowForecast = (businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.cashFlowForecast(businessId),
    queryFn: () => glApi.getCashFlowForecast(businessId),
    enabled: hasPremiumAccess,
  });
};

/**
 * Hook to get margin trend report
 * @param months - Number of months to include (default 6)
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useMarginTrend = (months?: number, businessId?: string) => {
  const hasPremiumAccess = usePremiumAccess();

  return useQuery({
    queryKey: glKeys.marginTrend(months, businessId),
    queryFn: () => glApi.getMarginTrend(months, businessId),
    enabled: hasPremiumAccess,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Hook to post a journal entry
 * @param businessId - Optional businessId for accountant access to client data
 */
export const usePostJournal = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => glApi.postJournal(entryId, businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: glKeys.forBusiness(businessId) });
    },
  });
};

/**
 * Hook to bulk post journal entries
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useBulkPostJournals = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryIds: string[]) => glApi.bulkPostJournals(entryIds, businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: glKeys.forBusiness(businessId) });
    },
  });
};

// ==================== Account Mutations ====================

/**
 * Hook to create a new account
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useCreateAccount = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccountRequest) => glApi.createAccount(data, businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: glKeys.accounts(businessId) });
    },
  });
};

/**
 * Hook to update an account
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useUpdateAccount = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountRequest }) =>
      glApi.updateAccount(id, data, businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: glKeys.accounts(businessId) });
    },
  });
};

/**
 * Hook to deactivate an account
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useDeactivateAccount = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => glApi.deactivateAccount(id, businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: glKeys.accounts(businessId) });
    },
  });
};

// ==================== Journal Mutations ====================

/**
 * Hook to create a journal entry
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useCreateJournal = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJournalRequest) => glApi.createJournal(data, businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: glKeys.forBusiness(businessId) });
    },
  });
};

/**
 * Hook to void a journal entry
 * @param businessId - Optional businessId for accountant access to client data
 */
export const useVoidJournal = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      glApi.voidJournal(id, reason, businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: glKeys.forBusiness(businessId) });
    },
  });
};
