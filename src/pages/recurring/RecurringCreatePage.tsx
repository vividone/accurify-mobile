import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRecurring } from '@/queries';
import { useUIStore } from '@/store/ui.store';
import { RecurrenceFrequency } from '@/types';
import type { RecurringTemplateRequest } from '@/types';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export function RecurringCreatePage() {
  const navigate = useNavigate();
  const showNotification = useUIStore((s) => s.showNotification);
  const createMutation = useCreateRecurring();

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
      await createMutation.mutateAsync(form);
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
