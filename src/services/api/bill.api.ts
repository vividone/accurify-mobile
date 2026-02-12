import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  Bill,
  BillRequest,
  MarkBillPaidRequest,
  AccountsPayableSummary,
  BillStatus,
  ParsedBillData,
} from '@/types';

const BILLS_BASE = '/bills';

export const billsApi = {
  // Parse bill PDF and extract data
  parse: async (file: File): Promise<ParsedBillData> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<ParsedBillData>>(
      `${BILLS_BASE}/parse`,
      formData
    );
    return response.data.data!;
  },

  // Create bill
  create: async (data: BillRequest): Promise<Bill> => {
    const response = await apiClient.post<ApiResponse<Bill>>(BILLS_BASE, data);
    return response.data.data!;
  },

  // Upload bill document (PDF/image)
  uploadDocument: async (billId: string, file: File): Promise<Bill> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<Bill>>(
      `${BILLS_BASE}/${billId}/document`,
      formData
    );
    return response.data.data!;
  },

  // Update draft bill
  update: async (billId: string, data: BillRequest): Promise<Bill> => {
    const response = await apiClient.put<ApiResponse<Bill>>(
      `${BILLS_BASE}/${billId}`,
      data
    );
    return response.data.data!;
  },

  // Get bill by ID
  getById: async (billId: string): Promise<Bill> => {
    const response = await apiClient.get<ApiResponse<Bill>>(
      `${BILLS_BASE}/${billId}`
    );
    return response.data.data!;
  },

  // List bills (paginated)
  list: async (
    page = 0,
    size = 20,
    status?: BillStatus
  ): Promise<PageResponse<Bill>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await apiClient.get<ApiResponse<PageResponse<Bill>>>(
      `${BILLS_BASE}?${params}`
    );
    return response.data.data!;
  },

  // Search bills
  search: async (query: string, page = 0, size = 20): Promise<PageResponse<Bill>> => {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      size: size.toString(),
    });
    const response = await apiClient.get<ApiResponse<PageResponse<Bill>>>(
      `${BILLS_BASE}/search?${params}`
    );
    return response.data.data!;
  },

  // Approve bill
  approve: async (billId: string): Promise<Bill> => {
    const response = await apiClient.post<ApiResponse<Bill>>(
      `${BILLS_BASE}/${billId}/approve`
    );
    return response.data.data!;
  },

  // Mark bill as paid
  markAsPaid: async (billId: string, data: MarkBillPaidRequest): Promise<Bill> => {
    const response = await apiClient.post<ApiResponse<Bill>>(
      `${BILLS_BASE}/${billId}/pay`,
      data
    );
    return response.data.data!;
  },

  // Cancel bill
  cancel: async (billId: string, reason?: string): Promise<Bill> => {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    const response = await apiClient.post<ApiResponse<Bill>>(
      `${BILLS_BASE}/${billId}/cancel${params}`
    );
    return response.data.data!;
  },

  // Delete draft bill
  delete: async (billId: string): Promise<void> => {
    await apiClient.delete(`${BILLS_BASE}/${billId}`);
  },

  // Get accounts payable summary
  getSummary: async (): Promise<AccountsPayableSummary> => {
    const response = await apiClient.get<ApiResponse<AccountsPayableSummary>>(
      `${BILLS_BASE}/summary`
    );
    return response.data.data!;
  },
};
