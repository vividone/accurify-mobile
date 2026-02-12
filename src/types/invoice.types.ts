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
  total: number; // subtotal + vatAmount - whtAmount (net receivable)
  notes?: string;
  items: InvoiceItem[];
  sentAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
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
}

export interface MarkPaidRequest {
  paidAt: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  type?: InvoiceType;
  startDate?: string;
  endDate?: string;
  search?: string;
}
