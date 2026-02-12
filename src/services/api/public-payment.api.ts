/**
 * Public Payment API (no authentication required)
 * Used for customer-facing invoice payment pages
 */

import axios from 'axios';
import type {
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  PaymentVerificationResponse,
  PublicInvoice,
} from '@/types/payment.types';

// Create a separate axios instance without auth interceptors
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Public Payment API endpoints (no authentication)
 */
export const publicPaymentApi = {
  /**
   * Get invoice details by payment token
   */
  getInvoice: async (token: string): Promise<PublicInvoice> => {
    const { data } = await publicApi.get(`/public/pay/${token}`);
    return data;
  },

  /**
   * Initiate payment for an invoice
   */
  initiatePayment: async (
    token: string,
    request: InitiatePaymentRequest
  ): Promise<InitiatePaymentResponse> => {
    const { data } = await publicApi.post(`/public/pay/${token}/initiate`, request);
    return data;
  },

  /**
   * Verify payment status after callback
   */
  verifyPayment: async (reference: string): Promise<PaymentVerificationResponse> => {
    const { data } = await publicApi.get(`/public/pay/verify/${reference}`);
    return data;
  },
};
