import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { transactionsApi } from '@/services/api/transactions.api';
import { useUIStore } from '@/store/ui.store';
import { useQueryClient } from '@tanstack/react-query';
import { useBusinessStore } from '@/store/business.store';
import { markFastPathCompleted } from '@/utils/fast-path.utils';
import { TransactionType, TransactionCategory, CATEGORY_META } from '@/types/enums';

const TOTAL_STEPS = 2;

// Outflow expense categories only (most common for first expense)
const EXPENSE_CATEGORIES = Object.entries(CATEGORY_META)
  .filter(([, meta]) => meta.type === TransactionType.OUTFLOW)
  .map(([key, meta]) => ({ value: key as TransactionCategory, label: meta.displayName }))
  .sort((a, b) => a.label.localeCompare(b.label));

interface ExpenseForm {
  amount: string;
  description: string;
  date: string;
  category: TransactionCategory;
}

interface BookkeepingFastPathWizardProps {
  open: boolean;
  onClose: () => void;
}

export function BookkeepingFastPathWizard({ open, onClose }: BookkeepingFastPathWizardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);
  const business = useBusinessStore((s) => s.business);

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<ExpenseForm>({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: TransactionCategory.OPERATING_EXPENSE,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseForm, string>>>({});

  const handleClose = () => {
    setCurrentStep(0);
    setForm({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: TransactionCategory.OPERATING_EXPENSE,
    });
    setErrors({});
    onClose();
  };

  const handleRecordExpense = async () => {
    const newErrors: Partial<Record<keyof ExpenseForm, string>> = {};
    if (!form.amount || parseFloat(form.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!form.date) {
      newErrors.date = 'Date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const amountKobo = Math.round(parseFloat(form.amount) * 100);

      await transactionsApi.create({
        type: TransactionType.OUTFLOW,
        amount: amountKobo,
        date: form.date,
        description: form.description.trim(),
        category: form.category,
      });

      // Mark fast path completed
      if (business?.id) {
        markFastPathCompleted(business.id, 'bookkeeping');
      }

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['onboarding'] });

      showNotification('Success', 'Expense recorded successfully', 'success');
      setCurrentStep(1);
    } catch {
      showNotification('Error', 'Failed to record expense. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTransactions = () => {
    handleClose();
    navigate('/app/transactions');
  };

  const inputClass =
    'w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary bg-white';
  const labelClass = 'block text-label-01 text-gray-60 mb-1';
  const errorClass = 'text-helper-01 text-danger mt-1';

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
              <div className="flex items-start justify-between px-5 py-4 border-b border-gray-20 flex-shrink-0">
                <div>
                  <Dialog.Title className="text-heading-02 text-gray-100">
                    {currentStep === 0 ? 'Record an expense' : 'Your books are started'}
                  </Dialog.Title>
                  {/* Step dots */}
                  <div className="flex gap-1.5 mt-1">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i === currentStep ? 'bg-primary' : 'bg-gray-30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1 text-gray-50 active:bg-gray-10 rounded-full mt-0.5"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">
                {/* STEP 0: Record expense */}
                {currentStep === 0 && (
                  <>
                    <div>
                      <label className={labelClass}>
                        Amount (₦) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                        className={inputClass}
                        autoFocus
                      />
                      {errors.amount && <p className={errorClass}>{errors.amount}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>
                        Description <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Office rent payment"
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        className={inputClass}
                      />
                      {errors.description && <p className={errorClass}>{errors.description}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>
                        Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                        className={inputClass}
                      />
                      {errors.date && <p className={errorClass}>{errors.date}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>Category</label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value as TransactionCategory }))
                        }
                        className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 bg-white focus:outline-none focus:border-primary"
                      >
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleRecordExpense}
                      disabled={isLoading}
                      className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50 mt-2"
                    >
                      {isLoading ? 'Recording...' : 'Record Expense'}
                    </button>
                  </>
                )}

                {/* STEP 1: Success */}
                {currentStep === 1 && (
                  <div className="flex flex-col items-center py-8 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
                    <h2 className="text-heading-02 text-gray-100 mb-2">Your books are started!</h2>
                    <p className="text-body-01 text-gray-50 mb-6">
                      Great job! You've recorded your first expense. Keep adding transactions to
                      get a full picture of your cash flow.
                    </p>

                    <div className="w-full space-y-3">
                      <div className="bg-blue-50 rounded-xl p-4 text-left">
                        <p className="text-body-01 font-medium text-blue-800">What's next?</p>
                        <ul className="mt-2 space-y-1">
                          <li className="text-helper-01 text-blue-700">
                            • Record more expenses as they happen
                          </li>
                          <li className="text-helper-01 text-blue-700">
                            • Connect your bank account for automatic import
                          </li>
                          <li className="text-helper-01 text-blue-700">
                            • View your income statement anytime
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={handleViewTransactions}
                        className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg"
                      >
                        View Transactions
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="w-full text-center text-body-01 text-gray-50 py-2"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
