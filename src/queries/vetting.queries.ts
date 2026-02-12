import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vettingApi } from '@/services/api/vetting.api';
import type { VettingRequest, AdminVettingActionRequest } from '@/types';

export const vettingKeys = {
  all: ['vetting'] as const,
  status: () => [...vettingKeys.all, 'status'] as const,
  adminPending: (page?: number) => [...vettingKeys.all, 'admin', 'pending', page] as const,
  adminReview: (vettingId: string) => [...vettingKeys.all, 'admin', 'review', vettingId] as const,
};

// ==================== Accountant Operations ====================

/**
 * Get vetting status for the authenticated accountant
 */
export const useVettingStatus = () => {
  return useQuery({
    queryKey: vettingKeys.status(),
    queryFn: () => vettingApi.getStatus(),
  });
};

/**
 * Submit credentials for vetting
 */
export const useSubmitVettingCredentials = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VettingRequest) => vettingApi.submitCredentials(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vettingKeys.status() });
    },
  });
};

/**
 * Upload practicing license document
 */
export const useUploadPracticingLicenseDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => vettingApi.uploadPracticingLicenseDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vettingKeys.status() });
    },
  });
};

// ==================== Admin Operations ====================

/**
 * Get list of vettings pending admin review
 */
export const useAdminVettingPendingReviews = (page = 0, size = 20) => {
  return useQuery({
    queryKey: vettingKeys.adminPending(page),
    queryFn: () => vettingApi.getPendingReviews(page, size),
  });
};

/**
 * Get vetting details for admin review
 */
export const useAdminVettingReview = (vettingId: string) => {
  return useQuery({
    queryKey: vettingKeys.adminReview(vettingId),
    queryFn: () => vettingApi.getVettingForReview(vettingId),
    enabled: !!vettingId,
  });
};

/**
 * Approve a vetting submission
 */
export const useAdminApproveVetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vettingId, skills }: { vettingId: string; skills?: AdminVettingActionRequest }) =>
      vettingApi.approve(vettingId, skills),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vettingKeys.all });
    },
  });
};

/**
 * Reject a vetting submission with reason
 */
export const useAdminRejectVetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vettingId, reason }: { vettingId: string; reason: string }) =>
      vettingApi.reject(vettingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vettingKeys.all });
    },
  });
};
