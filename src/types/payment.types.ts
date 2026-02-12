/**
 * Accurify Pay - Invoice Payment Types
 */

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

// Business Payment Setup
export interface BusinessPaymentSetupResponse {
  isSetup: boolean;
  isVerified: boolean;
  subaccountCode: string | null;
  bankCode: string | null;
  accountNumber: string | null;
  accountName: string | null;
  businessName: string | null;
  platformFeePercent: number;
  verifiedAt: string | null;
  message: string;
}

export interface BusinessPaymentSetupRequest {
  bankCode: string;
  accountNumber: string;
  businessName: string;
}

// Bank Types
export interface Bank {
  code: string;
  name: string;
}

export interface BankAccountResolution {
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

// Payment Link
export interface PaymentLinkResponse {
  invoiceId: string;
  invoiceNumber: string;
  paymentToken: string | null;
  paymentLink: string | null;
  enabled: boolean;
  createdAt: string | null;
  expiresAt: string | null;
  amountKobo: number;
  currency: string;
}

export interface CreatePaymentLinkRequest {
  invoiceId: string;
  expiresAt?: string;
}

// Public Invoice (for payment page)
export interface PublicInvoiceItem {
  description: string;
  quantity: number;
  unitPriceKobo: number;
  amountKobo: number;
}

export interface PublicInvoice {
  invoiceNumber: string;
  businessName: string;
  businessLogoUrl: string | null;
  clientName: string;
  invoiceDate: string;
  dueDate: string;
  subtotalKobo: number;
  vatAmountKobo: number;
  vatRate: number;
  totalKobo: number;
  currency: string;
  status: string;
  isPaid: boolean;
  canPay: boolean;
  items: PublicInvoiceItem[];
  notes: string | null;
}

// Payment Initiation
export interface InitiatePaymentRequest {
  payerEmail: string;
  payerName?: string;
}

export interface InitiatePaymentResponse {
  paymentReference: string;
  authorizationUrl: string;
  accessCode: string;
  amountKobo: number;
  platformFeeKobo: number;
  merchantAmountKobo: number;
  message: string;
}

// Payment Verification
export interface PaymentVerificationResponse {
  paymentReference: string;
  status: PaymentStatus;
  successful: boolean;
  amountKobo: number;
  invoiceNumber: string | null;
  businessName: string | null;
  completedAt: string | null;
  message: string;
}

// Payment History
export interface InvoicePayment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  paymentReference: string;
  amountKobo: number;
  platformFeeKobo: number;
  merchantAmountKobo: number;
  feePercentApplied: number;
  status: PaymentStatus;
  paymentMethod: string | null;
  cardType: string | null;
  cardLast4: string | null;
  bankName: string | null;
  payerEmail: string | null;
  payerName: string | null;
  initiatedAt: string;
  completedAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
}

// Platform Settings (Admin)
export interface PlatformSettings {
  invoicePaymentFeePercent: number;
  storePaymentFeePercent: number;
  minPayoutAmountKobo: number;
  payoutSchedule: string;
  invoicePaymentsEnabled: boolean;
  storePaymentsEnabled: boolean;
}

export interface UpdatePlatformSettingsRequest {
  invoicePaymentFeePercent?: number;
  storePaymentFeePercent?: number;
  minPayoutAmountKobo?: number;
  payoutSchedule?: string;
  invoicePaymentsEnabled?: boolean;
  storePaymentsEnabled?: boolean;
  changeReason?: string;
}

export interface PlatformSettingsAudit {
  id: string;
  settingName: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: { email: string };
  changedAt: string;
  changeReason: string | null;
}
