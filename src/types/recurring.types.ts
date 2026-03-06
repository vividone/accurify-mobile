import type { RecurrenceFrequency, RecurringTemplateStatus } from './enums';

export interface RecurringTemplate {
  id: string;
  templateName: string;
  status: RecurringTemplateStatus;
  frequency: RecurrenceFrequency;
  clientName?: string;
  clientId?: string;
  subtotal: number;
  vatApplicable: boolean;
  vatRate?: number;
  vatAmount: number;
  whtApplicable?: boolean;
  whtRate?: number;
  whtAmount?: number;
  total: number;
  notes?: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  paymentTerms: number;
  nextRunDate: string;
  lastRunDate?: string;
  endDate?: string;
  maxOccurrences?: number;
  occurrencesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RecurringTemplateRequest {
  clientId?: string;
  templateName: string;
  frequency: RecurrenceFrequency;
  items: { description: string; quantity: number; unitPrice: number }[];
  vatApplicable?: boolean;
  vatRate?: number;
  whtApplicable?: boolean;
  whtRate?: number;
  notes?: string;
  startDate: string;
  endDate?: string;
  maxOccurrences?: number;
  paymentTerms?: number;
}
