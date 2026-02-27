export type ReconciliationStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type MatchMethod = 'AUTO' | 'SUGGESTED' | 'MANUAL';
export type MatchStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface ReconciliationSession {
  id: string;
  bankAccountId: string;
  bankAccountName: string;
  bankName: string;
  periodStart: string;
  periodEnd: string;
  bankStatementBalance: number;
  glBalance?: number;
  difference?: number;
  status: ReconciliationStatus;
  matchedCount: number;
  unmatchedBankCount: number;
  completedAt?: string;
  createdAt: string;
  notes?: string;
}

export interface ReconciliationSuggestion {
  bankTransactionId: string;
  bankAmount: number;
  bankDate: string;
  bankDescription?: string;
  matchedEntityId: string;
  matchedEntityType: string;
  matchType: string;
  matchedAmount: number;
  matchedDate: string;
  matchedDescription?: string;
  confidenceScore: number;
  matchMethod: MatchMethod;
}

export interface ReconciliationMatch {
  id: string;
  bankTransactionId: string;
  bankAmount: number;
  bankDate: string;
  bankDescription?: string;
  matchType: string;
  matchedEntityType: string;
  matchedEntityId: string;
  matchMethod: MatchMethod;
  confidenceScore: number;
  status: MatchStatus;
}

export interface StartReconciliationRequest {
  bankAccountId: string;
  periodStart: string;
  periodEnd: string;
  bankStatementBalance: number;
  notes?: string;
}

export interface ConfirmMatchRequest {
  bankTransactionId: string;
  matchedEntityId: string;
  matchedEntityType: string;
  matchType: string;
}
