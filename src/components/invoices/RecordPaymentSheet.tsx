import { Fragment, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRecordInvoicePayment } from '@/queries';
import { useUIStore } from '@/store/ui.store';
import { formatCurrency } from '@/utils/currency';
import {
  formatRate,
  invoiceDeductions,
  selfRemittedWht,
  splitOutstanding,
  suggestDeductions,
} from '@/utils/invoice-totals';
import type { Invoice } from '@/types';

interface RecordPaymentSheetProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
}

const schema = z.object({
  amountNaira: z.number().min(0, 'Amount cannot be negative'),
  whtAmountNaira: z.number().min(0).optional(),
  vatWithheldNaira: z.number().min(0).optional(),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Cash',
  'Cheque',
  'POS',
  'Mobile Money',
  'Online Payment',
];

export function RecordPaymentSheet({
  open,
  onClose,
  invoice,
}: RecordPaymentSheetProps) {
  const showNotification = useUIStore((s) => s.showNotification);
  const recordPayment = useRecordInvoicePayment(invoice.id);

  // What the client deducts: WHT (unless we remit it ourselves) and any VAT it withholds
  const deductions = invoiceDeductions(invoice);
  const withholdsVat = deductions.vat > 0;
  const whtWeRemit = selfRemittedWht(invoice);
  const invoiceTotal = deductions.gross;
  const balanceDue = invoice.balanceDue
    ?? (invoice.balanceDueKobo !== undefined ? invoice.balanceDueKobo / 100 : invoiceTotal);
  const expected = splitOutstanding(balanceDue, deductions);
  // Once the user types a deduction, stop overwriting it from the cash amount
  const whtEdited = useRef(false);
  const vatEdited = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amountNaira: 0,
      whtAmountNaira: 0,
      vatWithheldNaira: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      reference: '',
      notes: '',
    },
  });

  const amountNaira = watch('amountNaira') || 0;
  const whtNaira = watch('whtAmountNaira') || 0;
  const vatNaira = watch('vatWithheldNaira') || 0;
  const totalApplied = Math.round((amountNaira + whtNaira + vatNaira) * 100) / 100;
  const exceedsBalance = Math.round(totalApplied * 100) > Math.round(balanceDue * 100);
  const balanceAfter = Math.max(0, Math.round((balanceDue - totalApplied) * 100) / 100);
  // Client didn't deduct WHT: our share to remit on this payment (less any it deducted anyway)
  const whtOwed = whtWeRemit > 0 && invoiceTotal > 0
    ? Math.max(0, Math.round(((whtWeRemit * totalApplied) / invoiceTotal - whtNaira) * 100) / 100)
    : 0;

  const applySuggestion = (cash: number) => {
    const suggestion = suggestDeductions(cash, deductions, balanceDue);
    if (!whtEdited.current) setValue('whtAmountNaira', suggestion.wht);
    if (!vatEdited.current) setValue('vatWithheldNaira', suggestion.vat);
  };

  const fillFullBalance = () => {
    whtEdited.current = false;
    vatEdited.current = false;
    setValue('amountNaira', expected.cash);
    setValue('whtAmountNaira', expected.wht);
    setValue('vatWithheldNaira', expected.vat);
  };

  const onSubmit = async (values: FormValues) => {
    if (exceedsBalance || totalApplied <= 0) return;
    try {
      await recordPayment.mutateAsync({
        amountKobo: Math.round(values.amountNaira * 100),
        whtAmountKobo: Math.round((values.whtAmountNaira || 0) * 100),
        vatWithheldKobo: Math.round((values.vatWithheldNaira || 0) * 100),
        paymentDate: values.paymentDate,
        paymentMethod: values.paymentMethod || undefined,
        reference: values.reference || undefined,
        notes: values.notes || undefined,
      });
      showNotification('Success', 'Payment recorded successfully', 'success');
      reset();
      onClose();
    } catch {
      showNotification('Error', 'Failed to record payment', 'error');
    }
  };

  const handleClose = () => {
    whtEdited.current = false;
    vatEdited.current = false;
    reset();
    onClose();
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-[60]">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-x-0 bottom-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel
              className="bg-white rounded-t-2xl max-h-[90vh] flex flex-col"
              style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1rem)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-20 flex-shrink-0">
                <Dialog.Title className="text-heading-02 text-gray-100">
                  Record Payment
                </Dialog.Title>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1 text-gray-50 active:bg-gray-10 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Balance info */}
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
                <div className="flex justify-between text-body-01">
                  <span className="text-gray-60">Invoice Total</span>
                  <span className="tabular-nums font-medium">{formatCurrency(invoiceTotal)}</span>
                </div>
                <div className="flex justify-between text-body-01 mt-1">
                  <span className="text-gray-60">Balance Due</span>
                  <span className="tabular-nums font-semibold text-primary">{formatCurrency(balanceDue)}</span>
                </div>
                {(expected.wht > 0 || expected.vat > 0) && (
                  <p className="text-helper-01 text-gray-60 mt-1" data-testid="expected-split">
                    {formatCurrency(expected.cash)} cash
                    {expected.wht > 0 && ` + ${formatCurrency(expected.wht)} WHT`}
                    {expected.vat > 0 && ` + ${formatCurrency(expected.vat)} VAT withheld`}
                  </p>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                {/* Amount received */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="payment-amount" className="block text-label-01 text-gray-60">
                      Cash Received (₦) <span className="text-danger">*</span>
                    </label>
                    <button type="button" onClick={fillFullBalance} className="text-label-01 font-medium text-primary">
                      Pay full balance
                    </button>
                  </div>
                  <input
                    id="payment-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register('amountNaira', {
                      valueAsNumber: true,
                      onChange: (e) => applySuggestion(parseFloat(e.target.value) || 0),
                    })}
                    className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary"
                  />
                  {errors.amountNaira && (
                    <p className="text-helper-01 text-danger mt-1">{errors.amountNaira.message}</p>
                  )}
                </div>

                {/* WHT deducted */}
                <div>
                  <label htmlFor="payment-wht" className="block text-label-01 text-gray-60 mb-1">
                    WHT Deducted by Client (₦)
                  </label>
                  <input
                    id="payment-wht"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register('whtAmountNaira', {
                      valueAsNumber: true,
                      onChange: () => { whtEdited.current = true; },
                    })}
                    className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary"
                  />
                  <p className="text-helper-01 text-gray-40 mt-1">
                    {whtWeRemit > 0
                      ? 'This client doesn’t deduct WHT — you remit it yourself. Leave at 0 unless they deducted some.'
                      : 'Pre-filled from the cash received. Change it to match the client’s WHT credit note.'}
                  </p>
                </div>

                {/* VAT withheld */}
                {withholdsVat && (
                  <div>
                    <label htmlFor="payment-vat-withheld" className="block text-label-01 text-gray-60 mb-1">
                      VAT Withheld by Client (₦)
                    </label>
                    <input
                      id="payment-vat-withheld"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...register('vatWithheldNaira', {
                        valueAsNumber: true,
                        onChange: () => { vatEdited.current = true; },
                      })}
                      className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary"
                    />
                    <p className="text-helper-01 text-gray-40 mt-1">
                      This client keeps {invoice.vatWithholdingRate != null
                        ? `${formatRate(invoice.vatWithholdingRate)} of the subtotal as VAT`
                        : 'the VAT'} and pays it to FIRS. Recording it takes it off your VAT payable.
                    </p>
                  </div>
                )}

                {/* Total applied */}
                {totalApplied > 0 && (
                  <div
                    className={`rounded-lg px-3 py-2.5 ${exceedsBalance ? 'bg-red-50' : 'bg-green-50'}`}
                    data-testid="payment-summary"
                  >
                    <div className="flex justify-between text-body-01">
                      <span className={exceedsBalance ? 'text-danger' : 'text-success'}>Settles</span>
                      <span className={`tabular-nums font-semibold ${exceedsBalance ? 'text-danger' : 'text-success'}`}>
                        {formatCurrency(totalApplied)}
                      </span>
                    </div>
                    {!exceedsBalance && (
                      <div className="flex justify-between text-body-01 mt-1">
                        <span className="text-gray-60">Balance after</span>
                        <span className="tabular-nums font-medium">
                          {balanceAfter === 0 ? 'Fully paid' : formatCurrency(balanceAfter)}
                        </span>
                      </div>
                    )}
                    {whtOwed > 0 && (
                      <div className="flex justify-between text-body-01 mt-1 text-warning" data-testid="wht-owed">
                        <span>WHT you remit to FIRS</span>
                        <span className="tabular-nums font-medium">{formatCurrency(whtOwed)}</span>
                      </div>
                    )}
                    {exceedsBalance && (
                      <p className="text-helper-01 text-danger mt-1">
                        Total applied exceeds the balance due of {formatCurrency(balanceDue)}
                      </p>
                    )}
                  </div>
                )}

                {/* Payment date */}
                <div>
                  <label className="block text-label-01 text-gray-60 mb-1">
                    Payment Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('paymentDate')}
                    className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary"
                  />
                  {errors.paymentDate && (
                    <p className="text-helper-01 text-danger mt-1">{errors.paymentDate.message}</p>
                  )}
                </div>

                {/* Payment method */}
                <div>
                  <label className="block text-label-01 text-gray-60 mb-1">
                    Payment Method
                  </label>
                  <select
                    {...register('paymentMethod')}
                    className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="">Select method</option>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Reference */}
                <div>
                  <label className="block text-label-01 text-gray-60 mb-1">
                    Reference / Transaction ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TRF20240115"
                    {...register('reference')}
                    className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-label-01 text-gray-60 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Optional notes..."
                    {...register('notes')}
                    className="w-full px-3 py-2 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || exceedsBalance || totalApplied <= 0}
                  className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
                </button>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
