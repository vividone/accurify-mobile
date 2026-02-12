import type { SubscriptionPlan, SubscriptionStatus } from './enums';

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  isPremium: boolean;
  isTrialing: boolean;
  trialEndsAt?: string;
  currentPeriodEndsAt?: string;
  trialDaysRemaining?: number;
}

export interface InitializePaymentResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

import type { PaymentStatus } from './payment.types';
export type PaymentType = 'SUBSCRIPTION' | 'TRIAL_START' | 'RENEWAL' | 'UPGRADE';

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  paymentType: PaymentType;
  plan: SubscriptionPlan;
  status: PaymentStatus;
  description?: string;
  periodStart?: string;
  periodEnd?: string;
  createdAt: string;
}

export interface SubscriptionResponse {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  isPremium: boolean;
  isTrialing: boolean;
  trialEndsAt?: string;
  currentPeriodStartsAt?: string;
  currentPeriodEndsAt?: string;
  trialDaysRemaining?: number;
  createdAt?: string;
  updatedAt?: string;
}
