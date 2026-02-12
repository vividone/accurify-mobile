import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTransaction } from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { useUIStore } from '@/store/ui.store';
import { getTodayString } from '@/utils/date';
import {
  TransactionType,
  TransactionCategory,
  CATEGORY_META,
  getInflowCategories,
  getOutflowCategories,
} from '@/types/enums';
import clsx from 'clsx';

export function TransactionCreatePage() {
  const navigate = useNavigate();
  const showNotification = useUIStore((s) => s.showNotification);
  const createTransaction = useCreateTransaction();

  const [type, setType] = useState<TransactionType>(TransactionType.INFLOW);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.SALES);

  const categories = type === TransactionType.INFLOW
    ? getInflowCategories()
    : getOutflowCategories();

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;
    if (!description.trim()) return;

    try {
      await createTransaction.mutateAsync({
        type,
        amount: parsedAmount,
        date,
        description: description.trim(),
        category,
      });
      showNotification('Success', 'Transaction recorded', 'success');
      navigate('/app/transactions', { replace: true });
    } catch {
      showNotification('Error', 'Failed to record transaction', 'error');
    }
  };

  return (
    <>
      <PageHeader title="New Transaction" backTo="/app/transactions" />
      <div className="page-content space-y-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setType(TransactionType.INFLOW);
              setCategory(TransactionCategory.SALES);
            }}
            className={clsx(
              'h-11 rounded-lg font-medium text-body-01 transition-colors',
              type === TransactionType.INFLOW
                ? 'bg-success text-white'
                : 'bg-gray-10 text-gray-60 border border-gray-20'
            )}
          >
            Income
          </button>
          <button
            onClick={() => {
              setType(TransactionType.OUTFLOW);
              setCategory(TransactionCategory.OPERATING_EXPENSE);
            }}
            className={clsx(
              'h-11 rounded-lg font-medium text-body-01 transition-colors',
              type === TransactionType.OUTFLOW
                ? 'bg-danger text-white'
                : 'bg-gray-10 text-gray-60 border border-gray-20'
            )}
          >
            Expense
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-label-01 text-gray-70 mb-1.5">Amount</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-label-01 text-gray-70 mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-label-01 text-gray-70 mb-1.5">Description</label>
          <input
            type="text"
            placeholder="What is this transaction for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-label-01 text-gray-70 mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_META[cat]?.displayName ?? cat}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || !description.trim() || createTransaction.isPending}
            className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
          >
            {createTransaction.isPending ? 'Recording...' : 'Record Transaction'}
          </button>
        </div>
      </div>
    </>
  );
}
