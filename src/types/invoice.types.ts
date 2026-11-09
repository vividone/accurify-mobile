import type { InvoiceStatus, InvoiceType } from './enums';
import type { Client } from './client.types';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  client: Client;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  whtApplicable?: boolean;
  whtRate?: number;
  whtAmount?: number;
  total: number; // subtotal + vatAmount - WHT the client deducts
  /** Client keeps (some of) the VAT and remits it to FIRS (oil & gas, government) */
  vatWithheldByClient?: boolean;
  vatWithholdingRate?: number | null; // Share of subtotal withheld as VAT; null = full VAT
  clientWithheldVat?: number;
  /** Client doesn't deduct WHT; the business remits it (total then excludes no WHT) */
  whtSelfRemitted?: boolean;
  netCashPayable?: number; // What the client pays in cash
  notes?: string;
  items: InvoiceItem[];
  sentAt?: string;
  paidAt?: string;
  // Partial payment tracking. Payments settle against the gross (subtotal + VAT):
  // cash + WHT + VAT withheld by the client.
  grossAmount?: number;
  amountPaid?: number;
  balanceDue?: number;
  amountPaidKobo?: number;
  balanceDueKobo?: number;
  createdAt: string;
  updatedAt: string;
  // Project association
  projectId?: string;
  projectName?: string;
  // Proforma conversion tracking
  convertedFromId?: string;
  // Payment link fields (Accurify Pay)
  paymentToken?: string;
  paymentLinkEnabled?: boolean;
  paymentLink?: string;          // Full payment URL if enabled
  paymentLinkCreatedAt?: string;
  paymentLinkExpiresAt?: string;
}

export interface InvoiceItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceRequest {
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItemRequest[];
  notes?: string;
  // Tax settings
  applyVat?: boolean;
  vatRate?: number; // Defaults to 7.5% if applyVat is true
  whtApplicable?: boolean;
  whtRate?: number; // Common rates: 5% (contracts), 10% (professional services)
  // Accurify Pay - enable online payment for this invoice
  enableAccurifyPay?: boolean;
  // Invoice type
  type?: InvoiceType;
  // Optional project association
  projectId?: string;
}

export interface MarkPaidRequest {
  paidAt: string;
}

export interface RecordPaymentRequest {
  amountKobo: number;
  whtAmountKobo?: number;
  vatWithheldKobo?: number;
  paymentDate: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}

export interface InvoicePaymentRecord {
  id: string;
  invoiceId: string;
  amountKobo: number;
  whtAmountKobo: number;
  paymentDate: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  type?: InvoiceType;
  startDate?: string;
  endDate?: string;
  search?: string;
}
