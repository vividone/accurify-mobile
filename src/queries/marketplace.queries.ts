import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceApi } from '@/services/api/marketplace.api';
import type { Industry } from '@/types';
import type { UpdateAccountantProfileRequest, UpdatePayoutSettingsRequest } from '@/types/marketplace.types';

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  accountants: () => [...marketplaceKeys.all, 'accountants'] as const,
  accountant: (id: string) => [...marketplaceKeys.all, 'accountant', id] as const,
  search: (query?: string) => [...marketplaceKeys.all, 'search', query] as const,
  byIndustry: (industry: Industry) => [...marketplaceKeys.all, 'industry', industry] as const,
  myProfile: () => [...marketplaceKeys.all, 'my-profile'] as const,
  myPayoutSettings: () => [...marketplaceKeys.all, 'my-payout-settings'] as const,
};

// ==================== Public Marketplace Queries ====================

/**
 * Get all available accountants for hire
 */
export const useAvailableAccountants = () => {
  return useQuery({
    queryKey: marketplaceKeys.accountants(),
    queryFn: () => marketplaceApi.getAvailableAccountants(),
  });
};

/**
 * Get a specific accountant's profile
 */
export const useAccountantProfile = (accountantId: string) => {
  return useQuery({
    queryKey: marketplaceKeys.accountant(accountantId),
    queryFn: () => marketplaceApi.getAccountantProfile(accountantId),
    enabled: !!accountantId,
  });
};

/**
 * Search accountants by name or title
 */
export const useSearchAccountants = (query?: string) => {
  return useQuery({
    queryKey: marketplaceKeys.search(query),
    queryFn: () => marketplaceApi.searchAccountants(query),
    enabled: query !== undefined, // Allow empty string to fetch all
  });
};

/**
 * Get accountants by industry
 */
export const useAccountantsByIndustry = (industry: Industry) => {
  return useQuery({
    queryKey: marketplaceKeys.byIndustry(industry),
    queryFn: () => marketplaceApi.getAccountantsByIndustry(industry),
    enabled: !!industry,
  });
};

// ==================== Accountant Profile Management ====================

/**
 * Get the current accountant's marketplace profile
 */
export const useMyAccountantProfile = () => {
  return useQuery({
    queryKey: marketplaceKeys.myProfile(),
    queryFn: () => marketplaceApi.getMyProfile(),
  });
};

/**
 * Update the current accountant's profile
 */
export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAccountantProfileRequest) => marketplaceApi.updateMyProfile(data),
    onSuccess: () => {
      // Invalidate the profile query to refetch
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.myProfile() });
      // Also invalidate the public accountants list since the profile changed
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.accountants() });
    },
  });
};

// ==================== Payout Settings ====================

/**
 * Get the current accountant's payout settings
 */
export const useMyPayoutSettings = () => {
  return useQuery({
    queryKey: marketplaceKeys.myPayoutSettings(),
    queryFn: () => marketplaceApi.getMyPayoutSettings(),
  });
};

/**
 * Update the current accountant's payout settings
 */
export const useUpdateMyPayoutSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePayoutSettingsRequest) => marketplaceApi.updateMyPayoutSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.myPayoutSettings() });
    },
  });
};
