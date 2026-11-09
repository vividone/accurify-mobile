import type { Invoice } from '@/types';

/**
 * Payment helpers for invoices. Amounts are in naira, matching the invoice response.
 *
 * Payments settle against the gross (subtotal + VAT): cash + WHT the client deducts +
 * VAT the client withholds (oil & gas, government). When the business remits WHT
 * itself, the client deducts none and the business owes FIRS a share on each payment.
 * Mirrors accurify-web's utils/invoice-totals.ts.
 */

/** What a payment is expected to consist of: gross = cash + wht + vat */
export interface InvoiceDeductions {
  gross: number;
  /** WHT the client deducts */
  wht: number;
  /** VAT the client withholds */
  vat: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function invoiceDeductions(invoice: Invoice): InvoiceDeductions {
  const whtTotal = invoice.whtApplicable ? invoice.whtAmount ?? 0 : 0;
  const wht = invoice.whtSelfRemitted ? 0 : whtTotal;
  const vat = invoice.clientWithheldVat ?? (invoice.vatWithheldByClient ? invoice.vatAmount : 0);
  return { gross: invoice.grossAmount ?? invoice.total + wht, wht, vat };
}

/** WHT the business remits itself because the client doesn't deduct it */
export function selfRemittedWht(invoice: Invoice): number {
  return invoice.whtSelfRemitted && invoice.whtApplicable ? invoice.whtAmount ?? 0 : 0;
}

/** WHT and VAT the client would have withheld on a cash payment, pro rata, capped at the balance */
export function suggestDeductions(
  cashReceived: number,
  d: InvoiceDeductions,
  outstanding: number
): { wht: number; vat: number } {
  const cashTotal = d.gross - d.wht - d.vat;
  if (cashReceived <= 0 || cashTotal <= 0) return { wht: 0, vat: 0 };
  let room = Math.max(0, round2(outstanding - cashReceived));
  const wht = Math.min(round2((cashReceived * d.wht) / cashTotal), room);
  room = round2(room - wht);
  const vat = Math.min(round2((cashReceived * d.vat) / cashTotal), room);
  return { wht: Math.max(0, wht), vat: Math.max(0, vat) };
}

/** Splits an outstanding gross balance into the cash, WHT and VAT still expected */
export function splitOutstanding(
  outstanding: number,
  d: InvoiceDeductions
): { cash: number; wht: number; vat: number } {
  if (d.gross <= 0 || (d.wht <= 0 && d.vat <= 0)) return { cash: outstanding, wht: 0, vat: 0 };
  const cash = round2((outstanding * (d.gross - d.wht - d.vat)) / d.gross);
  const wht = round2((outstanding * d.wht) / d.gross);
  return { cash, wht, vat: round2(outstanding - cash - wht) };
}

/** 0.075 → "7.5%", 0.05 → "5%" */
export function formatRate(rate: number): string {
  return `${parseFloat((rate * 100).toFixed(2))}%`;
}

/** Common choices for how much VAT a withholding client keeps; null = the full VAT. Any other % can be entered. */
export const VAT_WITHHOLDING_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Full VAT (7.5%)' },
  { value: 0.05, label: '5% of subtotal' },
];
