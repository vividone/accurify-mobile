/**
 * Accurify Pay - Invoice Payment API
 */

import apiClient from './client';
import type {
  Bank,
  BankAccountResolution,
  BusinessPaymentSetupRequest,
  BusinessPaymentSetupResponse,
  CreatePaymentLinkRequest,
  InvoicePayment,
  PaymentLinkResponse,
} from '@/types/payment.types';
import type { PageResponse } from '@/types';

/**
 * Invoice Payment API endpoints (authenticated)
 */
export const invoicePaymentApi = {
  // ===== Payment Setup =====

  /**
   * Get payment account setup status
   */
  getPaymentSetup: async (): Promise<BusinessPaymentSetupResponse> => {
    const { data } = await apiClient.get('/invoice-payments/setup');
    return data;
  },

  /**
   * Setup or update payment account
   */
  setupPaymentAccount: async (
    request: BusinessPaymentSetupRequest
  ): Promise<BusinessPaymentSetupResponse> => {
    const { data } = await apiClient.post('/invoice-payments/setup', request);
    return data;
  },

  // ===== Banks =====

  /**
   * Get list of Nigerian banks
   */
  getBanks: async (): Promise<Bank[]> => {
    const { data } = await apiClient.get('/invoice-payments/banks');
    return data;
  },

  /**
   * Resolve bank account name
   */
  resolveBankAccount: async (
    accountNumber: string,
    bankCode: string
  ): Promise<BankAccountResolution> => {
    const { data } = await apiClient.get('/invoice-payments/resolve-account', {
      params: { accountNumber, bankCode },
    });
    return data;
  },

  // ===== Payment Links =====

  /**
   * Create payment link for an invoice
   */
  createPaymentLink: async (
    request: CreatePaymentLinkRequest
  ): Promise<PaymentLinkResponse> => {
    const { data } = await apiClient.post('/invoice-payments/link', request);
    return data;
  },

  /**
   * Get payment link status for an invoice
   */
  getPaymentLink: async (invoiceId: string): Promise<PaymentLinkResponse> => {
    const { data } = await apiClient.get(`/invoice-payments/link/${invoiceId}`);
    return data;
  },

  /**
   * Disable payment link for an invoice
   */
  disablePaymentLink: async (invoiceId: string): Promise<void> => {
    await apiClient.delete(`/invoice-payments/link/${invoiceId}`);
  },

  // ===== Payment History =====

  /**
   * Get payment history for the business
   */
  getPaymentHistory: async (
    page = 0,
    size = 20
  ): Promise<PageResponse<InvoicePayment>> => {
    const { data } = await apiClient.get('/invoice-payments/history', {
      params: { page, size },
    });
    return data;
  },

  /**
   * Get payments for a specific invoice
   */
  getPaymentsForInvoice: async (invoiceId: string): Promise<InvoicePayment[]> => {
    const { data } = await apiClient.get(`/invoice-payments/invoice/${invoiceId}`);
    return data;
  },
};
