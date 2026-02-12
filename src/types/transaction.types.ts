import type {
  TransactionType,
  TransactionCategory,
  TransactionSource,
} from './enums';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
  category: TransactionCategory;
  categoryDisplayName: string;
  source: TransactionSource;
  sourceId?: string;
  bankAccountId?: string;
  bankName?: string;

  // GL Account information (from linked journal entry)
  journalEntryId?: string;
  journalEntryNumber?: string;
  glAccountCode?: string;
  glAccountName?: string;
  glAccountFlow?: string;

  createdAt: string;
  updatedAt: string;
}

export interface TransactionRequest {
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
  category: TransactionCategory;
  manualGlAccountId?: string; // Optional: Manual GL account override (advanced users)
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: TransactionCategory;
  source?: TransactionSource;
  startDate?: string;
  endDate?: string;
  search?: string;
}
