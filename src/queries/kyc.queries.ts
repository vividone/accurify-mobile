import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kycApi } from '@/services/api/kyc.api';
import type {
  BusinessKycRequest,
  TinVerificationRequest,
  CacVerificationRequest,
  AccountantKycRequest,
} from '@/types';

export const kycKeys = {
  all: ['kyc'] as const,
  status: () => [...kycKeys.all, 'status'] as const,
  adminPending: (page?: number) => [...kycKeys.all, 'admin', 'pending', page] as const,
  adminReview: (kycId: string) => [...kycKeys.all, 'admin', 'review', kycId] as const,
};

// ==================== User Operations ====================

/**
 * Get KYC status for the authenticated user
 */
export const useKycStatus = () => {
  return useQuery({
    queryKey: kycKeys.status(),
    queryFn: () => kycApi.getStatus(),
  });
};

/**
 * Submit business KYC details (TIN and optional CAC) - legacy hook
 * TIN/CAC are verified via Mono Lookup API
 */
export const useSubmitBusinessKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BusinessKycRequest) => kycApi.submitBusinessDetails(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.status() });
    },
  });
};

/**
 * Verify TIN only
 * TIN is verified via Mono TIN Lookup API
 */
export const useVerifyTin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TinVerificationRequest) => kycApi.verifyTin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.status() });
    },
  });
};

/**
 * Verify CAC only (TIN must be verified first)
 * CAC is verified via Mono CAC Lookup API
 */
export const useVerifyCac = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CacVerificationRequest) => kycApi.verifyCac(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.status() });
    },
  });
};

/**
 * Upload CAC certificate document
 */
export const useUploadCacDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => kycApi.uploadCacDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.status() });
    },
  });
};

/**
 * Submit accountant KYC details (NIN)
 * NIN is verified via Mono Lookup API
 */
export const useSubmitAccountantKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AccountantKycRequest) => kycApi.submitAccountantDetails(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.status() });
    },
  });
};

// ==================== Admin Operations ====================

/**
 * Get list of KYC verifications pending admin review
 */
export const useAdminKycPendingReviews = (page = 0, size = 20) => {
  return useQuery({
    queryKey: kycKeys.adminPending(page),
    queryFn: () => kycApi.getPendingReviews(page, size),
  });
};

/**
 * Get KYC verification details for admin review
 */
export const useAdminKycReview = (kycId: string) => {
  return useQuery({
    queryKey: kycKeys.adminReview(kycId),
    queryFn: () => kycApi.getKycForReview(kycId),
    enabled: !!kycId,
  });
};

/**
 * Approve a KYC verification
 */
export const useAdminApproveKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (kycId: string) => kycApi.approve(kycId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.all });
    },
  });
};

/**
 * Reject a KYC verification with reason
 */
export const useAdminRejectKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kycId, reason }: { kycId: string; reason: string }) =>
      kycApi.reject(kycId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.all });
    },
  });
};
