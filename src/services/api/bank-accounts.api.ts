import apiClient from './client';
import type {
  ApiResponse,
  BankAccount,
  ConnectBankRequest,
} from '@/types';

const BANK_ACCOUNTS_BASE = '/bank-accounts';

export const bankAccountsApi = {
  // List all connected bank accounts
  list: async (): Promise<BankAccount[]> => {
    const response = await apiClient.get<ApiResponse<BankAccount[]>>(
      BANK_ACCOUNTS_BASE
    );
    return response.data.data!;
  },

  // Get single bank account
  getById: async (id: string): Promise<BankAccount> => {
    const response = await apiClient.get<ApiResponse<BankAccount>>(
      `${BANK_ACCOUNTS_BASE}/${id}`
    );
    return response.data.data!;
  },

  // Connect bank account (with Mono code)
  connect: async (data: ConnectBankRequest): Promise<BankAccount> => {
    const response = await apiClient.post<ApiResponse<BankAccount>>(
      `${BANK_ACCOUNTS_BASE}/connect`,
      data
    );
    return response.data.data!;
  },

  // Sync bank account manually
  sync: async (id: string): Promise<void> => {
    await apiClient.post(`${BANK_ACCOUNTS_BASE}/${id}/sync`);
  },

  // Disconnect bank account
  disconnect: async (id: string): Promise<void> => {
    await apiClient.delete(`${BANK_ACCOUNTS_BASE}/${id}`);
  },
};
