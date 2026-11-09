import { describe, it, expect } from 'vitest';
import { invoiceDeductions, selfRemittedWht, suggestDeductions, splitOutstanding, formatRate } from './invoice-totals';
import type { Invoice } from '@/types';

// ₦100,000 subtotal, ₦7,500 VAT, 5% WHT
const base = { total: 102_500, grossAmount: 107_500, whtApplicable: true, whtAmount: 5_000, vatAmount: 7_500 };

describe('invoiceDeductions', () => {
  it('client deducts WHT and withholds full VAT: ₦95,000 cash', () => {
    const d = invoiceDeductions({ ...base, vatWithheldByClient: true, clientWithheldVat: 7_500 } as Invoice);
    expect(d).toEqual({ gross: 107_500, wht: 5_000, vat: 7_500 });
    expect(splitOutstanding(107_500, d)).toEqual({ cash: 95_000, wht: 5_000, vat: 7_500 });
  });

  it('scenario A — full VAT withheld, we remit WHT: ₦100,000 cash', () => {
    const invoice = { ...base, total: 107_500, whtSelfRemitted: true, vatWithheldByClient: true, clientWithheldVat: 7_500 } as Invoice;
    const d = invoiceDeductions(invoice);
    expect(splitOutstanding(107_500, d)).toEqual({ cash: 100_000, wht: 0, vat: 7_500 });
    expect(selfRemittedWht(invoice)).toBe(5_000);
  });

  it('scenario B — 5% withheld as VAT, we remit WHT: ₦102,500 cash', () => {
    const invoice = {
      ...base, total: 107_500, whtSelfRemitted: true, vatWithheldByClient: true, vatWithholdingRate: 0.05, clientWithheldVat: 5_000,
    } as Invoice;
    expect(splitOutstanding(107_500, invoiceDeductions(invoice))).toEqual({ cash: 102_500, wht: 0, vat: 5_000 });
  });
});

describe('suggestDeductions', () => {
  it('pro-rates WHT and VAT on the cash received', () => {
    expect(suggestDeductions(47_500, { gross: 107_500, wht: 5_000, vat: 7_500 }, 107_500)).toEqual({ wht: 2_500, vat: 3_750 });
  });

  it('never exceeds the outstanding balance', () => {
    expect(suggestDeductions(107_000, { gross: 107_500, wht: 5_000, vat: 0 }, 107_500)).toEqual({ wht: 500, vat: 0 });
  });
});

describe('formatRate', () => {
  it('formats decimals as percentages', () => {
    expect(formatRate(0.075)).toBe('7.5%');
    expect(formatRate(0.05)).toBe('5%');
  });
});
