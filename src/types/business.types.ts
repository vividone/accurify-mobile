import type { BusinessType, Industry } from './enums';

export interface ActiveSubscriptionInfo {
  subscriptionId: string;
  accountantName: string;
  accountantEmail: string;
  tierName: string;
  status: string;
}

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  rcNumber?: string;
  address: string;
  phone: string;
  email?: string;
  logoUrl?: string;
  fiscalYearStartMonth: number;
  // Invoice display fields
  tin?: string;
  invoiceBankName?: string;
  invoiceAccountNumber?: string;
  invoiceAccountName?: string;
  activeSubscription?: ActiveSubscriptionInfo;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRequest {
  name: string;
  type: BusinessType;
  rcNumber?: string;
  address: string;
  phone: string;
  email?: string;
  fiscalYearStartMonth?: number;
  industry?: Industry;
  // Invoice display fields
  tin?: string;
  invoiceBankName?: string;
  invoiceAccountNumber?: string;
  invoiceAccountName?: string;
}
