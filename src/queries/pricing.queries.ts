import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingApi } from '@/services/api/pricing.api';
import type {
  SubscriptionPlanRequest,
  DiscountCodeRequest,
  DiscountCodesParams,
  ApplyDiscountRequest,
} from '@/types';

// ============================================================================
// Query Keys
// ============================================================================

export const pricingKeys = {
  all: ['pricing'] as const,
  // Plans
  plans: () => [...pricingKeys.all, 'plans'] as const,
  activePlans: () => [...pricingKeys.plans(), 'active'] as const,
  allPlans: () => [...pricingKeys.plans(), 'all'] as const,
  plan: (id: string) => [...pricingKeys.plans(), id] as const,
  // Discount codes
  discounts: () => [...pricingKeys.all, 'discounts'] as const,
  discountList: (params: DiscountCodesParams) => [...pricingKeys.discounts(), 'list', params] as const,
  discount: (id: string) => [...pricingKeys.discounts(), id] as const,
};

// ============================================================================
// Public Hooks (for user-facing pages)
// ============================================================================

/**
 * Get all active subscription plans (for pricing page)
 */
export const useActivePlans = () => {
  return useQuery({
    queryKey: pricingKeys.activePlans(),
    queryFn: () => pricingApi.getActivePlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes - plans don't change often
  });
};

/**
 * Apply a discount code to a plan
 */
export const useApplyDiscount = () => {
  return useMutation({
    mutationFn: (data: ApplyDiscountRequest) => pricingApi.applyDiscount(data),
  });
};

// ============================================================================
// Admin Plan Hooks
// ============================================================================

/**
 * Get all subscription plans (including inactive) - admin only
 */
export const useAllPlans = () => {
  return useQuery({
    queryKey: pricingKeys.allPlans(),
    queryFn: () => pricingApi.getAllPlans(),
  });
};

/**
 * Get a single plan by ID - admin only
 */
export const usePlan = (planId: string) => {
  return useQuery({
    queryKey: pricingKeys.plan(planId),
    queryFn: () => pricingApi.getPlan(planId),
    enabled: !!planId,
  });
};

/**
 * Create a new subscription plan - admin only
 */
export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubscriptionPlanRequest) => pricingApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.plans() });
    },
  });
};

/**
 * Update a subscription plan - admin only
 */
export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: SubscriptionPlanRequest }) =>
      pricingApi.updatePlan(planId, data),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.plan(planId) });
      queryClient.invalidateQueries({ queryKey: pricingKeys.plans() });
    },
  });
};

/**
 * Activate a subscription plan - admin only
 */
export const useActivatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => pricingApi.activatePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.plans() });
    },
  });
};

/**
 * Deactivate a subscription plan - admin only
 */
export const useDeactivatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => pricingApi.deactivatePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.plans() });
    },
  });
};

// ============================================================================
// Admin Discount Code Hooks
// ============================================================================

/**
 * Get all discount codes - admin only
 */
export const useDiscountCodes = (params: DiscountCodesParams = {}) => {
  return useQuery({
    queryKey: pricingKeys.discountList(params),
    queryFn: () => pricingApi.getDiscountCodes(params),
  });
};

/**
 * Get a single discount code by ID - admin only
 */
export const useDiscountCode = (codeId: string) => {
  return useQuery({
    queryKey: pricingKeys.discount(codeId),
    queryFn: () => pricingApi.getDiscountCode(codeId),
    enabled: !!codeId,
  });
};

/**
 * Create a new discount code - admin only
 */
export const useCreateDiscountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DiscountCodeRequest) => pricingApi.createDiscountCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.discounts() });
    },
  });
};

/**
 * Update a discount code - admin only
 */
export const useUpdateDiscountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codeId, data }: { codeId: string; data: DiscountCodeRequest }) =>
      pricingApi.updateDiscountCode(codeId, data),
    onSuccess: (_, { codeId }) => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.discount(codeId) });
      queryClient.invalidateQueries({ queryKey: pricingKeys.discounts() });
    },
  });
};

/**
 * Activate a discount code - admin only
 */
export const useActivateDiscountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (codeId: string) => pricingApi.activateDiscountCode(codeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.discounts() });
    },
  });
};

/**
 * Deactivate a discount code - admin only
 */
export const useDeactivateDiscountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (codeId: string) => pricingApi.deactivateDiscountCode(codeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.discounts() });
    },
  });
};

/**
 * Delete a discount code - admin only
 */
export const useDeleteDiscountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (codeId: string) => pricingApi.deleteDiscountCode(codeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.discounts() });
    },
  });
};
