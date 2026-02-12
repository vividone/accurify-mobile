// ============================================================================
// Subscription Plan Types
// ============================================================================

export interface SubscriptionPlanResponse {
  id: string;
  planKey: string;
  name: string;
  description: string | null;
  priceInKobo: number;
  priceInNaira: number;
  formattedPrice: string;
  currency: string;
  billingInterval: BillingInterval;
  features: string[];
  isPopular: boolean;
  savingsText: string | null;
  tagline: string | null;
  ctaText: string;
  paystackPlanCode: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface SubscriptionPlanRequest {
  planKey: string;
  name: string;
  description?: string;
  priceInKobo: number;
  billingInterval: BillingInterval;
  features?: string[];
  isPopular?: boolean;
  savingsText?: string;
  tagline?: string;
  ctaText?: string;
  paystackPlanCode?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type BillingInterval = 'FOREVER' | 'MONTHLY' | 'YEARLY';

// ============================================================================
// Discount Code Types
// ============================================================================

export interface DiscountCodeResponse {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  displayText: string;
  applicablePlans: string[] | null;
  maxUses: number | null;
  maxUsesPerUser: number;
  currentUses: number;
  remainingUses: number | null;
  validFrom: string;
  validUntil: string | null;
  durationType: DiscountDuration;
  durationMonths: number | null;
  firstSubscriptionOnly: boolean;
  minimumAmountKobo: number;
  isActive: boolean;
  isValid: boolean;
  createdAt: string;
}

export interface DiscountCodeRequest {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  applicablePlans?: string[];
  maxUses?: number;
  maxUsesPerUser?: number;
  validFrom?: string;
  validUntil?: string;
  durationType?: DiscountDuration;
  durationMonths?: number;
  firstSubscriptionOnly?: boolean;
  minimumAmountKobo?: number;
  isActive?: boolean;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type DiscountDuration = 'ONCE' | 'FOREVER' | 'REPEATING';

// ============================================================================
// Apply Discount Types
// ============================================================================

export interface ApplyDiscountRequest {
  code: string;
  planKey: string;
}

export interface ApplyDiscountResponse {
  valid: boolean;
  code: string;
  discountText?: string;
  originalAmountKobo: number;
  discountAmountKobo: number;
  finalAmountKobo: number;
  formattedOriginalAmount: string;
  formattedDiscountAmount: string;
  formattedFinalAmount: string;
  message: string;
}

// ============================================================================
// API Params
// ============================================================================

export interface DiscountCodesParams {
  page?: number;
  size?: number;
  search?: string;
}
