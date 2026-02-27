import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRecordInvoicePayment } from '@/queries';
import { useUIStore } from '@/store/ui.store';
import { formatCurrency } from '@/utils/currency';

interface RecordPaymentSheetProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceTotal: number;
  balanceDue: number;
}

const schema = z.object({
  amountKobo: z.number().min(1, 'Amount must be greater than 0'),
  whtAmountKobo: z.number().min(0).optional(),
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
  invoiceId,
  invoiceTotal,
  balanceDue,
}: RecordPaymentSheetProps) {
  const showNotification = useUIStore((s) => s.showNotification);
  const recordPayment = useRecordInvoicePayment(invoiceId);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amountKobo: 0,
      whtAmountKobo: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      reference: '',
      notes: '',
    },
  });

  const amountKobo = watch('amountKobo') || 0;
  const whtKobo = watch('whtAmountKobo') || 0;
  const totalApplied = amountKobo + whtKobo;
  const exceedsBalance = totalApplied > balanceDue;

  const onSubmit = async (values: FormValues) => {
    if (exceedsBalance) return;
    try {
      await recordPayment.mutateAsync({
        amountKobo: values.amountKobo,
        whtAmountKobo: values.whtAmountKobo || 0,
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
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                {/* Amount received */}
                <div>
                  <label className="block text-label-01 text-gray-60 mb-1">
                    Amount Received (₦) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register('amountKobo', { valueAsNumber: true })}
                    className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary"
                  />
                  {errors.amountKobo && (
                    <p className="text-helper-01 text-danger mt-1">{errors.amountKobo.message}</p>
                  )}
                </div>

                {/* WHT deducted */}
                <div>
                  <label className="block text-label-01 text-gray-60 mb-1">
                    WHT Deducted (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register('whtAmountKobo', { valueAsNumber: true })}
                    className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary"
                  />
                  <p className="text-helper-01 text-gray-40 mt-1">
                    Enter the WHT amount deducted by the client at source
                  </p>
                </div>

                {/* Total applied */}
                {(amountKobo > 0 || whtKobo > 0) && (
                  <div className={`rounded-lg px-3 py-2.5 ${exceedsBalance ? 'bg-red-50' : 'bg-green-50'}`}>
                    <div className="flex justify-between text-body-01">
                      <span className={exceedsBalance ? 'text-danger' : 'text-success'}>Total Applied</span>
                      <span className={`tabular-nums font-semibold ${exceedsBalance ? 'text-danger' : 'text-success'}`}>
                        {formatCurrency(totalApplied)}
                      </span>
                    </div>
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
                  disabled={isSubmitting || exceedsBalance}
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
