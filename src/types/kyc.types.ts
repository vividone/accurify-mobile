/**
 * KYC (Know Your Customer) verification types.
 * Business users: TIN and CAC verification via Mono Lookup API
 * Accountant users: NIN verification via Mono Lookup API
 *
 * Note: Bank account connection is NOT required for KYC.
 * Verification is done directly via Mono Lookup Product.
 */

// KYC Status enum
export enum KycStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  IDENTITY_VERIFIED = 'IDENTITY_VERIFIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export const KYC_STATUS_META: Record<KycStatus, { label: string; color: string; description: string }> = {
  [KycStatus.NOT_STARTED]: {
    label: 'Not Started',
    color: '#6B7280', // gray
    description: 'Begin your identity verification',
  },
  [KycStatus.PENDING]: {
    label: 'Pending',
    color: '#F59E0B', // amber
    description: 'Waiting for action',
  },
  [KycStatus.IDENTITY_VERIFIED]: {
    label: 'Identity Verified',
    color: '#3B82F6', // blue
    description: 'Identity confirmed, submit documents',
  },
  [KycStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    color: '#F59E0B', // amber
    description: 'Your documents are being reviewed',
  },
  [KycStatus.VERIFIED]: {
    label: 'Verified',
    color: '#22C55E', // green
    description: 'KYC verification complete',
  },
  [KycStatus.REJECTED]: {
    label: 'Rejected',
    color: '#EF4444', // red
    description: 'Verification rejected',
  },
  [KycStatus.EXPIRED]: {
    label: 'Expired',
    color: '#6B7280', // gray
    description: 'Verification expired, please re-verify',
  },
};

// KYC Verification Type
export enum KycVerificationType {
  BUSINESS = 'BUSINESS',
  ACCOUNTANT = 'ACCOUNTANT',
}

// Vetting Status enum (for accountant credential verification)
export enum VettingStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export const VETTING_STATUS_META: Record<VettingStatus, { label: string; color: string; description: string }> = {
  [VettingStatus.NOT_STARTED]: {
    label: 'Not Started',
    color: '#6B7280', // gray
    description: 'Submit credentials for verification',
  },
  [VettingStatus.PENDING]: {
    label: 'Pending Review',
    color: '#F59E0B', // amber
    description: 'Credentials submitted, awaiting review',
  },
  [VettingStatus.VERIFIED]: {
    label: 'Verified',
    color: '#22C55E', // green
    description: 'Credentials verified - Verified badge active',
  },
  [VettingStatus.REJECTED]: {
    label: 'Rejected',
    color: '#EF4444', // red
    description: 'Credentials could not be verified',
  },
  [VettingStatus.EXPIRED]: {
    label: 'Expired',
    color: '#6B7280', // gray
    description: 'Verification expired, please re-submit',
  },
};

// ==================== KYC Response Types ====================

/**
 * KYC status response for the authenticated user
 */
export interface KycStatusResponse {
  status: KycStatus;
  verificationType: KycVerificationType;
  identityVerified: boolean;
  verifiedName?: string;
  identityVerifiedAt?: string;
  // Business fields
  tinMasked?: string;
  cacNumber?: string;
  cacDocumentUrl?: string;
  // Accountant fields
  ninMasked?: string;
  // Completion
  verifiedAt?: string;
  rejectionReason?: string;
  pendingItems: string[];
}

/**
 * Admin KYC review response with full details
 */
export interface AdminKycReviewResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  verificationType: KycVerificationType;
  status: KycStatus;
  identityVerified: boolean;
  verifiedName?: string;
  // Full (unmasked) data for admin
  tin?: string;
  cacNumber?: string;
  cacDocumentUrl?: string;
  nin?: string;
  // Timestamps
  submittedAt: string;
  identityVerifiedAt?: string;
  previousRejectionReason?: string;
}

// ==================== KYC Request Types ====================

/**
 * Request for submitting business KYC details (legacy - submits both TIN and CAC together)
 * TIN is verified via Mono TIN Lookup API
 * CAC is verified via Mono CAC Lookup API (optional)
 */
export interface BusinessKycRequest {
  tin: string;
  cacNumber?: string;
}

/**
 * Request for verifying TIN only
 */
export interface TinVerificationRequest {
  tin: string;
}

/**
 * Request for verifying CAC only (TIN must be verified first)
 */
export interface CacVerificationRequest {
  cacNumber: string;
}

/**
 * Request for submitting accountant KYC details
 * NIN is verified via Mono NIN Lookup API
 */
export interface AccountantKycRequest {
  nin: string;
}

/**
 * Admin action request (for rejection)
 */
export interface AdminKycActionRequest {
  rejectionReason?: string;
}

// ==================== Vetting Response Types ====================

/**
 * Vetting status response for the authenticated accountant
 */
export interface VettingStatusResponse {
  status: VettingStatus;
  icanMembershipNumber?: string;
  acaMembershipNumber?: string;
  practicingLicenseNumber?: string;
  practicingLicenseDocUrl?: string;
  taxComplianceVerified: boolean;
  auditSkillVerified: boolean;
  bookkeepingVerified: boolean;
  verifiedAt?: string;
  rejectionReason?: string;
  pendingItems: string[];
}

/**
 * Admin vetting review response with full details
 */
export interface AdminVettingReviewResponse {
  id: string;
  accountantProfileId: string;
  userId: string;
  accountantName: string;
  accountantEmail: string;
  professionalTitle?: string;
  status: VettingStatus;
  // Credentials
  icanMembershipNumber?: string;
  acaMembershipNumber?: string;
  practicingLicenseNumber?: string;
  practicingLicenseDocUrl?: string;
  // Skills
  taxComplianceVerified: boolean;
  auditSkillVerified: boolean;
  bookkeepingVerified: boolean;
  // Profile info
  certifications?: string[];
  yearsExperience?: number;
  // Timestamps
  submittedAt: string;
  previousRejectionReason?: string;
}

// ==================== Vetting Request Types ====================

/**
 * Request for submitting credentials for vetting
 */
export interface VettingRequest {
  icanMembershipNumber?: string;
  acaMembershipNumber?: string;
  practicingLicenseNumber?: string;
}

/**
 * Admin vetting action request (for approval/rejection)
 */
export interface AdminVettingActionRequest {
  rejectionReason?: string;
  taxComplianceVerified?: boolean;
  auditSkillVerified?: boolean;
  bookkeepingVerified?: boolean;
}
