import type { CreditNoteStatus } from './enums';

export interface CreditNote {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  creditNoteNumber: string;
  status: CreditNoteStatus;
  clientName: string;
  clientId?: string;
  issueDate: string;
  reason?: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes?: string;
  items: CreditNoteItem[];
  issuedAt?: string;
  voidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditNoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface CreditNoteRequest {
  invoiceId: string;
  issueDate: string;
  reason?: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  notes?: string;
}