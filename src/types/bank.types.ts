import type { BankAccountStatus } from './enums';

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumberMasked: string;
  accountName: string;
  balance: number;
  currency: string;
  status: BankAccountStatus;
  lastSyncedAt?: string;
  createdAt: string;
}

export interface ConnectBankRequest {
  code: string;
}
