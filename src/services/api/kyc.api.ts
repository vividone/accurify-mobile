import apiClient from './client';
import type {
  ApiResponse,
  KycStatusResponse,
  AdminKycReviewResponse,
  BusinessKycRequest,
  TinVerificationRequest,
  CacVerificationRequest,
  AccountantKycRequest,
  AdminKycActionRequest,
  PageResponse,
} from '@/types';

const KYC_BASE = '/kyc';

export const kycApi = {
  // ==================== User Operations ====================

  /**
   * Get KYC status for the authenticated user
   */
  getStatus: async (): Promise<KycStatusResponse> => {
    const response = await apiClient.get<ApiResponse<KycStatusResponse>>(KYC_BASE);
    return response.data.data!;
  },

  /**
   * Submit business KYC details (TIN and optional CAC) - legacy endpoint
   * Backend verifies via Mono Lookup API
   */
  submitBusinessDetails: async (data: BusinessKycRequest): Promise<KycStatusResponse> => {
    const response = await apiClient.post<ApiResponse<KycStatusResponse>>(
      `${KYC_BASE}/business`,
      data
    );
    return response.data.data!;
  },

  /**
   * Verify TIN only
   * Backend verifies via Mono TIN Lookup API
   */
  verifyTin: async (data: TinVerificationRequest): Promise<KycStatusResponse> => {
    const response = await apiClient.post<ApiResponse<KycStatusResponse>>(
      `${KYC_BASE}/business/tin`,
      data
    );
    return response.data.data!;
  },

  /**
   * Verify CAC only (TIN must be verified first)
   * Backend verifies via Mono CAC Lookup API
   */
  verifyCac: async (data: CacVerificationRequest): Promise<KycStatusResponse> => {
    const response = await apiClient.post<ApiResponse<KycStatusResponse>>(
      `${KYC_BASE}/business/cac`,
      data
    );
    return response.data.data!;
  },

  /**
   * Upload CAC certificate document
   */
  uploadCacDocument: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<string>>(
      `${KYC_BASE}/business/document`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  /**
   * Submit accountant KYC details (NIN)
   * Backend verifies via Mono Lookup API
   */
  submitAccountantDetails: async (data: AccountantKycRequest): Promise<KycStatusResponse> => {
    const response = await apiClient.post<ApiResponse<KycStatusResponse>>(
      `${KYC_BASE}/accountant`,
      data
    );
    return response.data.data!;
  },

  // ==================== Admin Operations ====================

  /**
   * Get list of KYC verifications pending admin review
   */
  getPendingReviews: async (page = 0, size = 20): Promise<PageResponse<AdminKycReviewResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<AdminKycReviewResponse>>>(
      `${KYC_BASE}/admin/pending`,
      { params: { page, size } }
    );
    return response.data.data!;
  },

  /**
   * Get KYC verification details for admin review
   */
  getKycForReview: async (kycId: string): Promise<AdminKycReviewResponse> => {
    const response = await apiClient.get<ApiResponse<AdminKycReviewResponse>>(
      `${KYC_BASE}/admin/${kycId}`
    );
    return response.data.data!;
  },

  /**
   * Approve a KYC verification
   */
  approve: async (kycId: string): Promise<void> => {
    await apiClient.post(`${KYC_BASE}/admin/${kycId}/approve`);
  },

  /**
   * Reject a KYC verification with reason
   */
  reject: async (kycId: string, reason: string): Promise<void> => {
    await apiClient.post(`${KYC_BASE}/admin/${kycId}/reject`, {
      rejectionReason: reason,
    } as AdminKycActionRequest);
  },
};
