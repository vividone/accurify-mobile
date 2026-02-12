import apiClient from './client';
import type {
  ApiResponse,
  VettingStatusResponse,
  AdminVettingReviewResponse,
  VettingRequest,
  AdminVettingActionRequest,
  PageResponse,
} from '@/types';

const VETTING_BASE = '/vetting';

export const vettingApi = {
  // ==================== Accountant Operations ====================

  /**
   * Get vetting status for the authenticated accountant
   */
  getStatus: async (): Promise<VettingStatusResponse> => {
    const response = await apiClient.get<ApiResponse<VettingStatusResponse>>(VETTING_BASE);
    return response.data.data!;
  },

  /**
   * Submit credentials for vetting
   */
  submitCredentials: async (data: VettingRequest): Promise<VettingStatusResponse> => {
    const response = await apiClient.post<ApiResponse<VettingStatusResponse>>(
      `${VETTING_BASE}/credentials`,
      data
    );
    return response.data.data!;
  },

  /**
   * Upload practicing license document
   */
  uploadPracticingLicenseDocument: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<string>>(
      `${VETTING_BASE}/document`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  // ==================== Admin Operations ====================

  /**
   * Get list of vettings pending admin review
   */
  getPendingReviews: async (page = 0, size = 20): Promise<PageResponse<AdminVettingReviewResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<AdminVettingReviewResponse>>>(
      `${VETTING_BASE}/admin/pending`,
      { params: { page, size } }
    );
    return response.data.data!;
  },

  /**
   * Get vetting details for admin review
   */
  getVettingForReview: async (vettingId: string): Promise<AdminVettingReviewResponse> => {
    const response = await apiClient.get<ApiResponse<AdminVettingReviewResponse>>(
      `${VETTING_BASE}/admin/${vettingId}`
    );
    return response.data.data!;
  },

  /**
   * Approve a vetting submission
   */
  approve: async (vettingId: string, skills?: AdminVettingActionRequest): Promise<void> => {
    await apiClient.post(`${VETTING_BASE}/admin/${vettingId}/approve`, skills || {});
  },

  /**
   * Reject a vetting submission with reason
   */
  reject: async (vettingId: string, reason: string): Promise<void> => {
    await apiClient.post(`${VETTING_BASE}/admin/${vettingId}/reject`, {
      rejectionReason: reason,
    } as AdminVettingActionRequest);
  },
};
