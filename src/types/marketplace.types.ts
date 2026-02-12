// Marketplace types for Hire an Expert feature

import { Industry, INDUSTRY_META } from './enums';

export interface AccountantProfile {
  id: string;
  userId: string;
  name: string;
  professionalTitle: string;
  bio: string;
  certifications: string[];
  industries: Industry[];
  yearsExperience: number;
  avatarUrl: string | null;
  rating: number;
  reviewCount: number;
  activeClientCount: number;
  totalClientCount: number;
  isAcceptingClients: boolean;
  hasCapacity: boolean;
  createdAt: string;
}

export interface UpdateAccountantProfileRequest {
  professionalTitle?: string;
  bio?: string;
  certifications?: string[];
  industries?: Industry[];
  yearsExperience?: number;
  avatarUrl?: string;
  maxClients?: number;
  isAcceptingClients?: boolean;
}

// Payout Settings Types
export interface PayoutSettingsResponse {
  bankName: string | null;
  accountNumberMasked: string | null;
  accountName: string | null;
  bankCode: string | null;
  isVerified: boolean;
  isConfigured: boolean;
}

export interface UpdatePayoutSettingsRequest {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

// Industry display names for UI - use INDUSTRY_META from enums
export const INDUSTRY_DISPLAY_NAMES: Record<Industry, string> = {
  [Industry.GENERAL]: INDUSTRY_META[Industry.GENERAL].displayName,
  [Industry.RETAIL]: INDUSTRY_META[Industry.RETAIL].displayName,
  [Industry.PHARMACY]: INDUSTRY_META[Industry.PHARMACY].displayName,
  [Industry.LOGISTICS]: INDUSTRY_META[Industry.LOGISTICS].displayName,
  [Industry.SERVICE]: INDUSTRY_META[Industry.SERVICE].displayName,
  [Industry.HOSPITALITY]: INDUSTRY_META[Industry.HOSPITALITY].displayName,
};
