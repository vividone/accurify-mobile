import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInvoice, useUpdateInvoice, useSendInvoice, useClients, useProducts } from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/currency';
import { useUIStore } from '@/store/ui.store';
import { useBusinessStore } from '@/store/business.store';
import { InvoiceType, InvoiceStatus, BusinessType } from '@/types/enums';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const DEFAULT_VAT_RATE = 0.075; // 7.5% Nigerian VAT
const WHT_RATES = [
  { value: 0.05, label: '5% — Contracts, Supplies' },
  { value: 0.10, label: '10% — Professional Services' },
];

const lineItemSchema = z.object({
  description: z.string().min(1, 'Required'),
  quantity: z.number().min(1, 'Min 1'),
  unitPrice: z.number().min(0, 'Min 0'),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  invoiceDate: z.string().min(1, 'Required'),
  dueDate: z.string().min(1, 'Required'),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'At least one item required'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export function InvoiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id!);
  const updateInvoice = useUpdateInvoice();
  const sendInvoice = useSendInvoice();
  const { data: clientsData } = useClients(0, 100);
  const clients = clientsData?.content ?? [];
  const showNotification = useUIStore((s) => s.showNotification);
  const business = useBusinessStore((s) => s.business);
  const isGoodsBusiness = business?.type === BusinessType.GOODS;
  const { data: productsData } = useProducts(0, 200, { active: true });
  const products = productsData?.content ?? [];
  const [sending, setSending] = useState(false);
  const [applyVat, setApplyVat] = useState(false);
  const [whtApplicable, setWhtApplicable] = useState(false);
  const [whtRate, setWhtRate] = useState(0.05);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: '',
      invoiceDate: '',
      dueDate: '',
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  // Pre-populate form when invoice data loads
  useEffect(() => {
    if (invoice) {
      reset({
        clientId: invoice.client.id ?? '',
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        notes: invoice.notes ?? '',
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      setApplyVat(invoice.vatAmount > 0);
      setWhtApplicable(!!invoice.whtApplicable);
      if (invoice.whtRate) setWhtRate(invoice.whtRate);
    }
  }, [invoice, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');
  const subtotal = watchedItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const vatAmount = applyVat ? subtotal * DEFAULT_VAT_RATE : 0;
  const whtAmount = whtApplicable ? subtotal * whtRate : 0;
  const total = subtotal + vatAmount - whtAmount;

  const selectedClient = clients.find((c) => c.id === watch('clientId'));
  const isProforma = invoice?.type === InvoiceType.PROFORMA;
  const isDraft = invoice?.status === InvoiceStatus.DRAFT;

  const onSubmit = async (data: InvoiceFormData, shouldSend = false) => {
    if (!invoice) return;
    try {
      const client = clients.find((c) => c.id === data.clientId);
      if (!client) return;

      await updateInvoice.mutateAsync({
        id: invoice.id,
        data: {
          clientId: data.clientId,
          clientName: client.name,
          clientEmail: client.email,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          items: data.items,
          notes: data.notes,
          type: invoice.type,
          applyVat,
          vatRate: applyVat ? DEFAULT_VAT_RATE : undefined,
          whtApplicable,
          whtRate: whtApplicable ? whtRate : undefined,
        },
      });

      if (shouldSend && isDraft) {
        setSending(true);
        await sendInvoice.mutateAsync(invoice.id);
        showNotification('Success', 'Invoice updated and sent', 'success');
      } else {
        showNotification('Success', 'Invoice updated', 'success');
      }
      navigate(`/app/invoices/${invoice.id}`);
    } catch {
      showNotification('Error', 'Failed to update invoice', 'error');
    } finally {
      setSending(false);
    }
  };

  if (isLoading || !invoice) {
    return <DashboardSkeleton />;
  }

  const title = isProforma ? 'Edit Proforma Invoice' : 'Edit Invoice';

  return (
    <>
      <PageHeader title={title} backTo={`/app/invoices/${invoice.id}`} />
      <div className="page-content">
        <form className="space-y-4" onSubmit={handleSubmit((d) => onSubmit(d, false))}>
          {/* Invoice type (read-only) */}
          <Card>
            <p className="text-label-01 text-gray-70 mb-2">Invoice Type</p>
            <div className="flex gap-2">
              <div
                className={`flex-1 py-2 rounded-lg text-body-01 font-medium text-center ${
                  !isProforma
                    ? 'bg-primary text-white'
                    : 'bg-gray-10 text-gray-40 border border-gray-20'
                }`}
              >
                Standard
              </div>
              <div
                className={`flex-1 py-2 rounded-lg text-body-01 font-medium text-center ${
                  isProforma
                    ? 'bg-primary text-white'
                    : 'bg-gray-10 text-gray-40 border border-gray-20'
                }`}
              >
                Proforma
              </div>
            </div>
          </Card>

          {/* Client selector */}
          <Card>
            <label className="block text-label-01 text-gray-70 mb-1.5">
              Client
            </label>
            <select
              className={`w-full h-12 px-4 bg-gray-10 border text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.clientId ? 'border-danger' : 'border-gray-30'
              }`}
              {...register('clientId')}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="mt-1 text-helper-01 text-danger">
                {errors.clientId.message}
              </p>
            )}
            {selectedClient && (
              <p className="mt-2 text-helper-01 text-gray-50">
                {selectedClient.email}
              </p>
            )}
          </Card>

          {/* Dates */}
          <Card>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">
                  Invoice Date
                </label>
                <input
                  type="date"
                  className={`w-full h-12 px-3 bg-gray-10 border text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.invoiceDate ? 'border-danger' : 'border-gray-30'
                  }`}
                  {...register('invoiceDate')}
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  className={`w-full h-12 px-3 bg-gray-10 border text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.dueDate ? 'border-danger' : 'border-gray-30'
                  }`}
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
                  {isGoodsBusiness && (
                    <select
                      className="w-full h-10 px-3 bg-white border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                      defaultValue=""
                      onChange={(e) => {
                        const product = products.find((p) => p.id === e.target.value);
                        if (product) {
                          setValue(`items.${index}.description`, product.name, { shouldValidate: true });
                          setValue(`items.${index}.unitPrice`, product.unitPrice, { shouldValidate: true });
                        }
                      }}
                    >
                      <option value="">Select a product...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} — {formatCurrency(product.unitPrice)}
                          {product.stockQuantity > 0 ? ` (${product.stockQuantity} in stock)` : ' (Out of stock)'}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    placeholder="Description"
                    className="w-full h-10 px-3 bg-white border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register(`items.${index}.description`)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-helper-01 text-gray-50 mb-1">
                        Qty
                      </label>
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        render={({ field }) => (
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            className="w-full h-10 px-3 bg-white border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
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
                        render={({ field }) => (
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step={0.01}
                            className="w-full h-10 px-3 bg-white border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
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
                append({ description: '', quantity: 1, unitPrice: 0 })
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
              {whtApplicable && (
                <div className="flex justify-between text-body-01">
                  <span className="text-gray-50">WHT ({(whtRate * 100).toFixed(0)}%)</span>
                  <span className="tabular-nums text-danger">-{formatCurrency(whtAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-heading-02 pt-1 border-t border-gray-20">
                <span>{whtApplicable ? 'Net Receivable' : 'Total'}</span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
            </div>
          </Card>

          {/* Tax settings */}
          <Card>
            <p className="text-label-01 text-gray-70 mb-3">Tax Settings</p>

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

            <div className="border-t border-gray-10 my-2" />

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
              <div className="mt-2">
                <label className="block text-helper-01 text-gray-50 mb-1.5">WHT Rate</label>
                <select
                  value={whtRate}
                  onChange={(e) => setWhtRate(Number(e.target.value))}
                  className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {WHT_RATES.map((rate) => (
                    <option key={rate.value} value={rate.value}>
                      {rate.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Card>

          {/* Notes */}
          <Card>
            <label className="block text-label-01 text-gray-70 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Additional notes for the client..."
              className="w-full px-3 py-2 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              {...register('notes')}
            />
          </Card>

          {/* Action buttons */}
          <div className="space-y-2 pt-2 pb-4">
            {isDraft && (
              <button
                type="button"
                onClick={handleSubmit((d) => onSubmit(d, true))}
                disabled={isSubmitting || sending}
                className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Save & Send'}
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || sending}
              className={`w-full h-12 font-medium text-body-01 rounded-lg disabled:opacity-50 ${
                isDraft
                  ? 'border border-gray-30 text-gray-70'
                  : 'bg-primary text-white'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
