import apiClient from './client';
import type {
  StatementUploadResponse,
  StatementUploadDetailResponse,
  StatementLineResponse,
  UpdateStatementLineRequest,
  BulkUpdateLinesRequest,
  ImportStatementRequest,
  ImportStatementResponse,
  OverlapCheckResponse,
} from '@/types';
import type { PageResponse } from '@/types/api.types';

const BASE_URL = '/statements';

export const statementApi = {
  /**
   * Upload and parse a PDF bank statement
   */
  uploadStatement: async (
    file: File,
    bankAccountId?: string,
    bankName?: string
  ): Promise<StatementUploadDetailResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (bankAccountId) {
      formData.append('bankAccountId', bankAccountId);
    }
    if (bankName) {
      formData.append('bankName', bankName);
    }

    const response = await apiClient.post<StatementUploadDetailResponse>(
      `${BASE_URL}/upload`,
      formData
    );
    return response.data;
  },

  /**
   * Get all statement uploads for the business
   */
  getUploads: async (
    page = 0,
    size = 10
  ): Promise<PageResponse<StatementUploadResponse>> => {
    const response = await apiClient.get<PageResponse<StatementUploadResponse>>(BASE_URL, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get statement upload details with all parsed lines
   */
  getUploadDetail: async (uploadId: string): Promise<StatementUploadDetailResponse> => {
    const response = await apiClient.get<StatementUploadDetailResponse>(
      `${BASE_URL}/${uploadId}`
    );
    return response.data;
  },

  /**
   * Update a statement line (approve, skip, change category)
   */
  updateLine: async (
    lineId: string,
    data: UpdateStatementLineRequest
  ): Promise<StatementLineResponse> => {
    const response = await apiClient.patch<StatementLineResponse>(
      `${BASE_URL}/lines/${lineId}`,
      data
    );
    return response.data;
  },

  /**
   * Bulk update multiple statement lines
   */
  bulkUpdateLines: async (
    data: BulkUpdateLinesRequest
  ): Promise<StatementLineResponse[]> => {
    const response = await apiClient.post<StatementLineResponse[]>(
      `${BASE_URL}/lines/bulk-update`,
      data
    );
    return response.data;
  },

  /**
   * Import approved lines as transactions and journal entries
   */
  importLines: async (data: ImportStatementRequest): Promise<ImportStatementResponse> => {
    const response = await apiClient.post<ImportStatementResponse>(
      `${BASE_URL}/import`,
      data
    );
    return response.data;
  },

  /**
   * Cancel/delete a statement upload
   */
  cancelUpload: async (uploadId: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${uploadId}`);
  },

  /**
   * Get list of supported bank statement formats
   */
  getSupportedBanks: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>(`${BASE_URL}/supported-banks`);
    return response.data;
  },

  /**
   * Check for overlapping statement uploads before uploading
   */
  checkOverlap: async (
    startDate: string,
    endDate: string,
    accountNumber?: string
  ): Promise<OverlapCheckResponse> => {
    const params: Record<string, string> = { startDate, endDate };
    if (accountNumber) {
      params.accountNumber = accountNumber;
    }
    const response = await apiClient.get<OverlapCheckResponse>(
      `${BASE_URL}/check-overlap`,
      { params }
    );
    return response.data;
  },
};
