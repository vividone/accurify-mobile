/**
 * Addon subscription types for QuickStore and Accurify Pay.
 */

export type AddonType = 'QUICKSTORE' | 'ACCURIFY_PAY';

export type AddonStatus = 'ACTIVE' | 'TRIALING' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

/**
 * Information about an available addon.
 */
export interface AddonInfo {
  type: AddonType;
  displayName: string;
  description: string;
  monthlyPriceKobo: number;
  hasMonthlyFee: boolean;
  transactionFeePercent: number;
  requiresPremium: boolean;
}

/**
 * An addon subscription for a business.
 */
export interface AddonSubscription {
  id: string;
  addonType: AddonType;
  displayName: string;
  description: string;
  status: AddonStatus;
  lockedPriceKobo: number;
  hasMonthlyFee: boolean;
  transactionFeePercent: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  nextBillingDate?: string;
  trialEndDate?: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  activatedAt?: string;
  isActive: boolean;
}

/**
 * Response showing all addon statuses for a business.
 */
export interface AddonStatusResponse {
  hasPremium: boolean;
  availableAddons: AddonInfo[];
  activeSubscriptions: AddonSubscription[];
  addonAccess: Record<AddonType, boolean>;
}

/**
 * Request to subscribe to an addon.
 */
export interface AddonSubscribeRequest {
  addonType: AddonType;
  callbackUrl?: string;
}

/**
 * Response when initiating addon payment.
 */
export interface AddonPaymentInitResponse {
  addonType: AddonType;
  reference?: string;
  authorizationUrl?: string;
  accessCode?: string;
  amountKobo: number;
  message: string;
}

/**
 * Request to cancel an addon subscription.
 */
export interface AddonCancelRequest {
  addonType: AddonType;
  reason?: string;
}
