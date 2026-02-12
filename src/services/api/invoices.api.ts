import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  Invoice,
  InvoiceRequest,
  InvoiceFilters,
  MarkPaidRequest,
} from '@/types';

const INVOICES_BASE = '/invoices';

export const invoicesApi = {
  // List invoices with pagination and filters
  list: async (
    page = 0,
    size = 20,
    filters?: InvoiceFilters
  ): Promise<PageResponse<Invoice>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<ApiResponse<PageResponse<Invoice>>>(
      `${INVOICES_BASE}?${params}`
    );
    return response.data.data!;
  },

  // Get single invoice
  getById: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get<ApiResponse<Invoice>>(
      `${INVOICES_BASE}/${id}`
    );
    return response.data.data!;
  },

  // Create invoice
  create: async (data: InvoiceRequest): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(
      INVOICES_BASE,
      data
    );
    return response.data.data!;
  },

  // Update invoice (draft only)
  update: async (id: string, data: InvoiceRequest): Promise<Invoice> => {
    const response = await apiClient.put<ApiResponse<Invoice>>(
      `${INVOICES_BASE}/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete invoice (draft only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${INVOICES_BASE}/${id}`);
  },

  // Get PDF (returns blob URL)
  getPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`${INVOICES_BASE}/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Send invoice via email
  send: async (id: string): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(
      `${INVOICES_BASE}/${id}/send`
    );
    return response.data.data!;
  },

  // Mark as paid
  markPaid: async (id: string, data: MarkPaidRequest): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(
      `${INVOICES_BASE}/${id}/mark-paid`,
      data
    );
    return response.data.data!;
  },

  // Cancel invoice
  cancel: async (id: string): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(
      `${INVOICES_BASE}/${id}/cancel`
    );
    return response.data.data!;
  },

  // Resend invoice email
  resend: async (id: string): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(
      `${INVOICES_BASE}/${id}/resend`
    );
    return response.data.data!;
  },

  // Send receipt email
  sendReceipt: async (id: string): Promise<void> => {
    await apiClient.post(`${INVOICES_BASE}/${id}/send-receipt`);
  },

  // Get receipt PDF
  getReceiptPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`${INVOICES_BASE}/${id}/receipt-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
