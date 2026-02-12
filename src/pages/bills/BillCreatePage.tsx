import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBill } from '@/queries';
import { useActiveSuppliers } from '@/queries/supplier.queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/currency';
import { getTodayString, getDefaultDueDate } from '@/utils/date';
import { BillCategory, BillCategoryLabels } from '@/types/bill.types';
import { useUIStore } from '@/store/ui.store';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const DEFAULT_VAT_RATE = 0.075; // 7.5% Nigerian VAT

const lineItemSchema = z.object({
  description: z.string().min(1, 'Required'),
  quantity: z.number().min(1, 'Min 1'),
  unitPrice: z.number().min(0, 'Min 0'),
  category: z.nativeEnum(BillCategory).optional(),
});

const billSchema = z.object({
  supplierId: z.string().optional(),
  supplierName: z.string().min(1, 'Supplier name is required'),
  supplierEmail: z.string().email().optional().or(z.literal('')),
  billDate: z.string().min(1, 'Required'),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'At least one item required'),
});

type BillFormData = z.infer<typeof billSchema>;

export function BillCreatePage() {
  const navigate = useNavigate();
  const createBill = useCreateBill();
  const { data: suppliers } = useActiveSuppliers();
  const showNotification = useUIStore((s) => s.showNotification);
  const [applyVat, setApplyVat] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      supplierId: '',
      supplierName: '',
      supplierEmail: '',
      billDate: getTodayString(),
      dueDate: getDefaultDueDate(),
      description: '',
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, category: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');
  const subtotal = watchedItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const vatAmount = applyVat ? subtotal * DEFAULT_VAT_RATE : 0;
  const total = subtotal + vatAmount;

  const handleSupplierSelect = (supplierId: string) => {
    const supplier = suppliers?.find((s) => s.id === supplierId);
    if (supplier) {
      setValue('supplierId', supplier.id);
      setValue('supplierName', supplier.name);
      setValue('supplierEmail', supplier.email || '');
    }
  };

  const onSubmit = async (data: BillFormData) => {
    try {
      await createBill.mutateAsync({
        supplierId: data.supplierId || undefined,
        supplierName: data.supplierName,
        supplierEmail: data.supplierEmail || undefined,
        billDate: data.billDate,
        dueDate: data.dueDate || undefined,
        description: data.description || undefined,
        notes: data.notes || undefined,
        vatRate: applyVat ? DEFAULT_VAT_RATE : 0,
        items: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          category: item.category,
        })),
      });
      showNotification('Success', 'Bill created successfully', 'success');
      navigate('/app/bills');
    } catch {
      showNotification('Error', 'Failed to create bill', 'error');
    }
  };

  return (
    <>
      <PageHeader title="New Bill" backTo="/app/bills" />
      <div className="page-content">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Supplier */}
          <Card>
            <label className="block text-label-01 text-gray-70 mb-1.5">
              Supplier
            </label>
            {suppliers && suppliers.length > 0 && (
              <select
                className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                onChange={(e) => handleSupplierSelect(e.target.value)}
                defaultValue=""
              >
                <option value="">Select existing or type below</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
            <input
              placeholder="Supplier name"
              className={`w-full h-12 px-4 bg-gray-10 border text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.supplierName ? 'border-danger' : 'border-gray-30'
              }`}
              {...register('supplierName')}
            />
            {errors.supplierName && (
              <p className="mt-1 text-helper-01 text-danger">
                {errors.supplierName.message}
              </p>
            )}
          </Card>

          {/* Dates */}
          <Card>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">
                  Bill Date
                </label>
                <input
                  type="date"
                  className="w-full h-12 px-3 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('billDate')}
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full h-12 px-3 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('dueDate')}
                />
              </div>
            </div>
          </Card>

          {/* Line items */}
          <Card>
            <p className="text-label-01 text-gray-70 mb-3">Line Items</p>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-3 bg-gray-10 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-label-01 text-gray-50">
                      Item {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1 text-danger"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    placeholder="Description"
                    className="w-full h-10 px-3 bg-white border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register(`items.${index}.description`)}
                  />
                  <Controller
                    name={`items.${index}.category`}
                    control={control}
                    render={({ field: catField }) => (
                      <select
                        className="w-full h-10 px-3 bg-white border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={catField.value || ''}
                        onChange={(e) =>
                          catField.onChange(
                            e.target.value ? (e.target.value as BillCategory) : undefined
                          )
                        }
                      >
                        <option value="">Category (optional)</option>
                        {Object.entries(BillCategoryLabels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-helper-01 text-gray-50 mb-1">
                        Qty
                      </label>
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        render={({ field: qtyField }) => (
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            className="w-full h-10 px-3 bg-white border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            value={qtyField.value}
                            onChange={(e) =>
                              qtyField.onChange(Number(e.target.value) || 0)
                            }
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-helper-01 text-gray-50 mb-1">
                        Unit Price
                      </label>
                      <Controller
                        name={`items.${index}.unitPrice`}
                        control={control}
                        render={({ field: priceField }) => (
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step={0.01}
                            className="w-full h-10 px-3 bg-white border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            value={priceField.value}
                            onChange={(e) =>
                              priceField.onChange(Number(e.target.value) || 0)
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-right text-body-01 font-medium tabular-nums text-gray-100">
                    {formatCurrency(
                      (watchedItems[index]?.quantity || 0) *
                        (watchedItems[index]?.unitPrice || 0)
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                append({ description: '', quantity: 1, unitPrice: 0, category: undefined })
              }
              className="flex items-center gap-2 mt-3 text-body-01 text-primary font-medium"
            >
              <PlusIcon className="w-4 h-4" /> Add Item
            </button>

            <div className="border-t border-gray-20 mt-4 pt-3 space-y-2">
              <div className="flex justify-between text-body-01">
                <span className="text-gray-50">Subtotal</span>
                <span className="tabular-nums text-gray-100">{formatCurrency(subtotal)}</span>
              </div>
              {applyVat && (
                <div className="flex justify-between text-body-01">
                  <span className="text-gray-50">VAT (7.5%)</span>
                  <span className="tabular-nums text-gray-100">{formatCurrency(vatAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-heading-02 pt-1 border-t border-gray-20">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
            </div>
          </Card>

          {/* Tax settings */}
          <Card>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-body-01 text-gray-100">Apply VAT (Input VAT)</p>
                <p className="text-helper-01 text-gray-40">7.5% VAT on this bill</p>
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
          </Card>

          {/* Notes */}
          <Card>
            <label className="block text-label-01 text-gray-70 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              {...register('notes')}
            />
          </Card>

          {/* Actions */}
          <div className="pt-2 pb-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Bill'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
