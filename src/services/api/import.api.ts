/**
 * Universal Importer API service for CSV imports and opening balances.
 */
import apiClient from './client';
import type {
  ImportType,
  ImportJob,
  ImportError,
  ImportTemplate,
  ImportValidationResult,
  OpeningBalance,
} from '@/types/import.types';
import type { ApiResponse } from '@/types/api.types';

const IMPORT_BASE = '/import';

export const importApi = {
  // ==================== Templates ====================

  /**
   * Get all available import templates
   */
  getAllTemplates: async (): Promise<ApiResponse<ImportTemplate[]>> => {
    const response = await apiClient.get<ApiResponse<ImportTemplate[]>>(`${IMPORT_BASE}/templates`);
    return response.data;
  },

  /**
   * Get template for a specific import type
   */
  getTemplate: async (type: ImportType): Promise<ApiResponse<ImportTemplate>> => {
    const response = await apiClient.get<ApiResponse<ImportTemplate>>(`${IMPORT_BASE}/templates/${type}`);
    return response.data;
  },

  /**
   * Download sample CSV for import type
   */
  downloadSampleCsv: async (type: ImportType): Promise<string> => {
    const response = await apiClient.get<string>(`${IMPORT_BASE}/templates/${type}/sample`, {
      responseType: 'text',
    });
    return response.data;
  },

  // ==================== Validation & Import ====================

  /**
   * Validate a CSV file before importing
   */
  validateCsv: async (type: ImportType, file: File): Promise<ApiResponse<ImportValidationResult>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<ImportValidationResult>>(
      `${IMPORT_BASE}/validate`,
      formData,
      {
        params: { type },
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Start import job
   */
  startImport: async (type: ImportType, file: File): Promise<ApiResponse<ImportJob>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<ImportJob>>(
      `${IMPORT_BASE}/start`,
      formData,
      {
        params: { type },
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  // ==================== Import Jobs ====================

  /**
   * List import jobs
   */
  listJobs: async (
    page: number = 0,
    size: number = 20,
    type?: ImportType
  ): Promise<ApiResponse<{ content: ImportJob[]; totalElements: number; totalPages: number }>> => {
    const response = await apiClient.get<ApiResponse<{ content: ImportJob[]; totalElements: number; totalPages: number }>>(
      `${IMPORT_BASE}/jobs`,
      {
        params: { page, size, type },
      }
    );
    return response.data;
  },

  /**
   * Get import job details
   */
  getJob: async (jobId: string): Promise<ApiResponse<ImportJob>> => {
    const response = await apiClient.get<ApiResponse<ImportJob>>(`${IMPORT_BASE}/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Get errors for an import job
   */
  getJobErrors: async (jobId: string): Promise<ApiResponse<ImportError[]>> => {
    const response = await apiClient.get<ApiResponse<ImportError[]>>(`${IMPORT_BASE}/jobs/${jobId}/errors`);
    return response.data;
  },

  // ==================== Opening Balances ====================

  /**
   * Get opening balances
   */
  getOpeningBalances: async (balanceDate?: string): Promise<ApiResponse<OpeningBalance[]>> => {
    const response = await apiClient.get<ApiResponse<OpeningBalance[]>>(`${IMPORT_BASE}/opening-balances`, {
      params: { balanceDate },
    });
    return response.data;
  },

  /**
   * Check if trial balance is balanced
   */
  checkTrialBalance: async (balanceDate: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.get<ApiResponse<boolean>>(`${IMPORT_BASE}/opening-balances/check`, {
      params: { balanceDate },
    });
    return response.data;
  },

  /**
   * Post opening balances to the general ledger
   */
  postOpeningBalances: async (balanceDate: string): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>(`${IMPORT_BASE}/opening-balances/post`, null, {
      params: { balanceDate },
    });
    return response.data;
  },
};

export default importApi;
