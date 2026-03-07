import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRecurring, useClients } from '@/queries';
import { useUIStore } from '@/store/ui.store';
import { RecurrenceFrequency } from '@/types';
import type { RecurringTemplateRequest } from '@/types';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const DEFAULT_VAT_RATE = 0.075;
const WHT_RATES = [
  { value: 0.05, label: '5% — Contracts, Supplies' },
  { value: 0.10, label: '10% — Professional Services' },
];

export function RecurringCreatePage() {
  const navigate = useNavigate();
  const showNotification = useUIStore((s) => s.showNotification);
  const createMutation = useCreateRecurring();
  const { data: clientsData } = useClients(0, 100);
  const clients = clientsData?.content ?? [];

  const [applyVat, setApplyVat] = useState(false);
  const [whtApplicable, setWhtApplicable] = useState(false);
  const [whtRate, setWhtRate] = useState(0.05);

  const [form, setForm] = useState<RecurringTemplateRequest>({
    templateName: '',
    frequency: RecurrenceFrequency.MONTHLY,
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    startDate: new Date().toISOString().split('T')[0],
  });

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...form,
        vatApplicable: applyVat,
        vatRate: applyVat ? DEFAULT_VAT_RATE : undefined,
        whtApplicable,
        whtRate: whtApplicable ? whtRate : undefined,
      });
      showNotification('Template created', '', 'success');
      navigate('/app/recurring');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create template';
      showNotification('Error', message, 'error');
    }
  };

  return (
    <div className="page-content">
      {/* Back */}
      <button
        onClick={() => navigate('/app/recurring')}
        className="flex items-center gap-2 text-body-01 text-primary mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Recurring Invoices
      </button>

      <h1 className="text-heading-02 text-gray-100 mb-4">Create Recurring Invoice</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Template name */}
        <div className="bg-white rounded-xl p-4 border border-gray-20 space-y-3">
          <div>
            <label className="text-label-01 text-gray-50 mb-1 block">Template Name</label>
            <input
              type="text"
              value={form.templateName}
              onChange={(e) => setForm((p) => ({ ...p, templateName: e.target.value }))}
              placeholder="e.g., Monthly Retainer"
              required
              className="w-full h-10 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-label-01 text-gray-50 mb-1 block">Client</label>
            <select
              value={form.clientId || ''}
              onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value || undefined }))}
              className="w-full h-10 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label-01 text-gray-50 mb-1 block">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value as RecurrenceFrequency }))}
                className="w-full h-10 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUALLY">Annually</option>
              </select>
            </div>
            <div>
              <label className="text-label-01 text-gray-50 mb-1 block">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                required
                className="w-full h-10 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label-01 text-gray-50 mb-1 block">End Date</label>
              <input
                type="date"
                value={form.endDate || ''}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value || undefined }))}
                className="w-full h-10 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-label-01 text-gray-50 mb-1 block">Max Runs</label>
              <input
                type="number"
                min="1"
                value={form.maxOccurrences || ''}
                onChange={(e) => setForm((p) => ({ ...p, maxOccurrences: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full h-10 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl p-4 border border-gray-20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label-01 font-medium text-gray-100">Items</span>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-label-01 text-primary"
            >
              <PlusIcon className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="space-y-3">
            {form.items.map((item, index) => (
              <div key={index} className="space-y-2 pb-3 border-b border-gray-10 last:border-0 last:pb-0">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Description"
                  required
                  className="w-full h-10 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                    placeholder="Qty"
                    required
                    className="w-20 h-10 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                    placeholder="Unit Price"
                    required
                    className="flex-1 h-10 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={form.items.length <= 1}
                    className="p-2 text-gray-40 active:text-danger disabled:opacity-30"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax settings */}
        <div className="bg-white rounded-xl p-4 border border-gray-20 space-y-3">
          <span className="text-label-01 font-medium text-gray-100">Tax Settings</span>

          {/* VAT toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-body-01 text-gray-100">Apply VAT</p>
              <p className="text-helper-01 text-gray-40">7.5% Nigerian VAT rate</p>
            </div>
            <button
              type="button"
              onClick={() => setApplyVat(!applyVat)}
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors',
                applyVat ? 'bg-primary' : 'bg-gray-30'
              )}
            >
              <span
                className={clsx(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  applyVat && 'translate-x-5'
                )}
              />
            </button>
          </div>

          <div className="border-t border-gray-10" />

          {/* WHT toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-body-01 text-gray-100">WHT Applicable</p>
              <p className="text-helper-01 text-gray-40">Withheld by client on payment</p>
            </div>
            <button
              type="button"
              onClick={() => setWhtApplicable(!whtApplicable)}
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors',
                whtApplicable ? 'bg-primary' : 'bg-gray-30'
              )}
            >
              <span
                className={clsx(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  whtApplicable && 'translate-x-5'
                )}
              />
            </button>
          </div>

          {whtApplicable && (
            <div>
              <label className="block text-helper-01 text-gray-50 mb-1.5">WHT Rate</label>
              <select
                value={whtRate}
                onChange={(e) => setWhtRate(Number(e.target.value))}
                className="w-full h-10 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {WHT_RATES.map((rate) => (
                  <option key={rate.value} value={rate.value}>
                    {rate.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl p-4 border border-gray-20">
          <label className="text-label-01 text-gray-50 mb-1 block">Notes (optional)</label>
          <textarea
            rows={2}
            value={form.notes || ''}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value || undefined }))}
            placeholder="Additional notes..."
            className="w-full px-3 py-2 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full py-3 bg-primary text-white text-body-01 font-medium rounded-lg disabled:opacity-50"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Template'}
        </button>
      </form>
    </div>
  );
}
