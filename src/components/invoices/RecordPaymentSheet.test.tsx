import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { RecordPaymentSheet } from './RecordPaymentSheet';
import type { Invoice } from '@/types';

const mockMutateAsync = vi.fn().mockResolvedValue({});
vi.mock('@/queries', () => ({
  useRecordInvoicePayment: () => ({ mutateAsync: mockMutateAsync }),
}));
vi.mock('@/store/ui.store', () => ({
  useUIStore: (selector: (s: { showNotification: () => void }) => unknown) => selector({ showNotification: vi.fn() }),
}));

// ₦100,000 + ₦7,500 VAT, 5% WHT
function buildInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0042',
    subtotal: 100_000,
    vatRate: 0.075,
    vatAmount: 7_500,
    whtApplicable: true,
    whtRate: 0.05,
    whtAmount: 5_000,
    total: 102_500,
    grossAmount: 107_500,
    amountPaid: 0,
    balanceDue: 107_500,
    items: [],
    ...overrides,
  } as Invoice;
}

const cash = () => screen.getByLabelText(/Cash Received/) as HTMLInputElement;
const wht = () => screen.getByLabelText(/WHT Deducted by Client/) as HTMLInputElement;
const vat = () => screen.getByLabelText(/VAT Withheld by Client/) as HTMLInputElement;

describe('RecordPaymentSheet', () => {
  beforeEach(() => mockMutateAsync.mockClear());

  it('pre-fills WHT and VAT withheld from the cash received', () => {
    render(<RecordPaymentSheet open onClose={() => {}} invoice={buildInvoice({ vatWithheldByClient: true, clientWithheldVat: 7_500 })} />);

    fireEvent.change(cash(), { target: { value: '47500' } });
    expect(wht().value).toBe('2500');
    expect(vat().value).toBe('3750');
    const summary = within(screen.getByTestId('payment-summary'));
    expect(summary.getByText('Settles').nextSibling).toHaveTextContent('53,750');
    expect(summary.getByText('Balance after').nextSibling).toHaveTextContent('53,750');
  });

  it('scenario A: pay full balance records ₦100,000 cash + ₦7,500 VAT and shows ₦5,000 WHT to remit', async () => {
    const invoice = buildInvoice({ total: 107_500, whtSelfRemitted: true, vatWithheldByClient: true, clientWithheldVat: 7_500 });
    render(<RecordPaymentSheet open onClose={() => {}} invoice={invoice} />);

    expect(screen.getByTestId('expected-split')).toHaveTextContent(/100,000.*cash.*7,500.*VAT withheld/);
    fireEvent.click(screen.getByText('Pay full balance'));
    expect(screen.getByTestId('wht-owed')).toHaveTextContent('5,000');
    expect(screen.getByText('Fully paid')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Record Payment' }));
    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ amountKobo: 10_000_000, whtAmountKobo: 0, vatWithheldKobo: 750_000 })
      )
    );
  });

  it('scenario B: 5% of subtotal withheld as VAT — ₦102,500 cash + ₦5,000 VAT', () => {
    const invoice = buildInvoice({
      total: 107_500, whtSelfRemitted: true, vatWithheldByClient: true, vatWithholdingRate: 0.05, clientWithheldVat: 5_000,
    });
    render(<RecordPaymentSheet open onClose={() => {}} invoice={invoice} />);

    fireEvent.change(cash(), { target: { value: '102500' } });
    expect(vat().value).toBe('5000');
    expect(wht().value).toBe('0');
    expect(screen.getByText(/keeps 5% of the subtotal as VAT/)).toBeInTheDocument();
  });

  it('hides the VAT withheld field for ordinary clients', () => {
    render(<RecordPaymentSheet open onClose={() => {}} invoice={buildInvoice()} />);
    expect(screen.queryByLabelText(/VAT Withheld by Client/)).not.toBeInTheDocument();
  });
});
