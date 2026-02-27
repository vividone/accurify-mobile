import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { clientsApi } from '@/services/api/clients.api';
import { invoicesApi } from '@/services/api/invoices.api';
import { useUIStore } from '@/store/ui.store';
import { useQueryClient } from '@tanstack/react-query';
import { useBusinessStore } from '@/store/business.store';
import { markFastPathCompleted } from '@/utils/fast-path.utils';
import type { InvoiceType } from '@/types/enums';

const TOTAL_STEPS = 3;

interface ClientStep {
  name: string;
  email: string;
}

interface InvoiceStep {
  description: string;
  price: string;
  applyVat: boolean;
}

interface InvoiceFastPathWizardProps {
  open: boolean;
  onClose: () => void;
}

export function InvoiceFastPathWizard({ open, onClose }: InvoiceFastPathWizardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);
  const business = useBusinessStore((s) => s.business);

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);

  const [clientData, setClientData] = useState<ClientStep>({ name: '', email: '' });
  const [clientError, setClientError] = useState('');
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);

  const [invoiceData, setInvoiceData] = useState<InvoiceStep>({
    description: '',
    price: '',
    applyVat: false,
  });
  const [invoiceErrors, setInvoiceErrors] = useState<{ description?: string; price?: string }>({});

  const VAT_RATE = 7.5;

  const priceNum = parseFloat(invoiceData.price) || 0;
  const vatAmount = invoiceData.applyVat ? priceNum * (VAT_RATE / 100) : 0;
  const total = priceNum + vatAmount;

  const handleClose = () => {
    setCurrentStep(0);
    setShowSuccess(false);
    setCreatedInvoiceId(null);
    setClientData({ name: '', email: '' });
    setClientError('');
    setCreatedClientId(null);
    setInvoiceData({ description: '', price: '', applyVat: false });
    setInvoiceErrors({});
    onClose();
  };

  // Step 0: Add client — validate and create
  const handleClientNext = async () => {
    if (!clientData.name.trim()) {
      setClientError('Client name is required');
      return;
    }
    setClientError('');
    setIsLoading(true);
    try {
      const client = await clientsApi.create({
        name: clientData.name.trim(),
        email: clientData.email.trim() || undefined,
      });
      setCreatedClientId(client.id);
      setCurrentStep(1);
    } catch {
      showNotification('Error', 'Failed to create client. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Invoice details — validate
  const handleInvoiceNext = () => {
    const errors: { description?: string; price?: string } = {};
    if (!invoiceData.description.trim()) errors.description = 'Description is required';
    if (!invoiceData.price || parseFloat(invoiceData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (Object.keys(errors).length > 0) {
      setInvoiceErrors(errors);
      return;
    }
    setInvoiceErrors({});
    setCurrentStep(2);
  };

  // Step 2: Create and send invoice
  const handleSendInvoice = async () => {
    await createInvoice(false);
  };

  const handleSaveDraft = async () => {
    await createInvoice(true);
  };

  const createInvoice = async (draft: boolean) => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const unitPriceKobo = Math.round(priceNum * 100);

      const invoice = await invoicesApi.create({
        clientId: createdClientId || undefined,
        clientName: clientData.name.trim(),
        clientEmail: clientData.email.trim() || undefined,
        invoiceDate: today,
        dueDate,
        items: [
          {
            description: invoiceData.description.trim(),
            quantity: 1,
            unitPrice: unitPriceKobo,
          },
        ],
        applyVat: invoiceData.applyVat,
        vatRate: invoiceData.applyVat ? VAT_RATE : undefined,
        type: 'STANDARD' as InvoiceType,
      });

      if (!draft) {
        await invoicesApi.send(invoice.id);
      }

      setCreatedInvoiceId(invoice.id);

      // Mark fast path completed
      if (business?.id) {
        markFastPathCompleted(business.id, 'invoice');
      }

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      await queryClient.invalidateQueries({ queryKey: ['onboarding'] });

      setShowSuccess(true);
      showNotification(
        'Success',
        draft ? 'Invoice saved as draft' : 'Invoice sent successfully',
        'success'
      );
    } catch {
      showNotification('Error', 'Failed to create invoice. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInvoice = () => {
    handleClose();
    if (createdInvoiceId) {
      navigate(`/app/invoices/${createdInvoiceId}`);
    } else {
      navigate('/app/invoices');
    }
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
                    {showSuccess
                      ? 'Invoice Ready'
                      : currentStep === 0
                      ? 'Add your client'
                      : currentStep === 1
                      ? 'Set up your invoice'
                      : 'Review & send'}
                  </Dialog.Title>
                  {/* Step dots */}
                  {!showSuccess && (
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
                  )}
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
                {/* SUCCESS SCREEN */}
                {showSuccess && (
                  <div className="flex flex-col items-center py-8 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
                    <h2 className="text-heading-02 text-gray-100 mb-2">Invoice sent!</h2>
                    <p className="text-body-01 text-gray-50">
                      Your invoice to <strong>{clientData.name}</strong> has been sent.
                    </p>
                    <button
                      type="button"
                      onClick={handleViewInvoice}
                      className="mt-6 w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg"
                    >
                      View Invoice
                    </button>
                  </div>
                )}

                {/* STEP 0: Add client */}
                {!showSuccess && currentStep === 0 && (
                  <>
                    <div>
                      <label className={labelClass}>
                        Client Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Ltd"
                        value={clientData.name}
                        onChange={(e) => setClientData((d) => ({ ...d, name: e.target.value }))}
                        className={inputClass}
                        autoFocus
                      />
                      {clientError && <p className={errorClass}>{clientError}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Client Email (optional)</label>
                      <input
                        type="email"
                        placeholder="e.g. accounts@acme.com"
                        value={clientData.email}
                        onChange={(e) => setClientData((d) => ({ ...d, email: e.target.value }))}
                        className={inputClass}
                      />
                      <p className="text-helper-01 text-gray-40 mt-1">
                        We'll use this to send the invoice
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClientNext}
                      disabled={isLoading}
                      className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50 mt-2"
                    >
                      {isLoading ? 'Saving...' : 'Next'}
                    </button>
                  </>
                )}

                {/* STEP 1: Invoice details */}
                {!showSuccess && currentStep === 1 && (
                  <>
                    <div>
                      <label className={labelClass}>
                        Description <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Website design services"
                        value={invoiceData.description}
                        onChange={(e) =>
                          setInvoiceData((d) => ({ ...d, description: e.target.value }))
                        }
                        className={inputClass}
                        autoFocus
                      />
                      {invoiceErrors.description && (
                        <p className={errorClass}>{invoiceErrors.description}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        Price (₦) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={invoiceData.price}
                        onChange={(e) =>
                          setInvoiceData((d) => ({ ...d, price: e.target.value }))
                        }
                        className={inputClass}
                      />
                      {invoiceErrors.price && (
                        <p className={errorClass}>{invoiceErrors.price}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 py-1">
                      <input
                        type="checkbox"
                        id="applyVat"
                        checked={invoiceData.applyVat}
                        onChange={(e) =>
                          setInvoiceData((d) => ({ ...d, applyVat: e.target.checked }))
                        }
                        className="w-4 h-4 text-primary border-gray-30 rounded"
                      />
                      <label htmlFor="applyVat" className="text-body-01 text-gray-100">
                        Apply VAT (7.5%)
                      </label>
                    </div>
                    {invoiceData.applyVat && priceNum > 0 && (
                      <div className="bg-blue-50 rounded-lg px-3 py-2.5">
                        <div className="flex justify-between text-body-01">
                          <span className="text-gray-60">Subtotal</span>
                          <span className="tabular-nums">₦{priceNum.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-body-01 mt-1">
                          <span className="text-gray-60">VAT (7.5%)</span>
                          <span className="tabular-nums">₦{vatAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleInvoiceNext}
                      className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg mt-2"
                    >
                      Next
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(0)}
                      className="w-full text-center text-body-01 text-gray-50 py-2"
                    >
                      Back
                    </button>
                  </>
                )}

                {/* STEP 2: Review & send */}
                {!showSuccess && currentStep === 2 && (
                  <>
                    <div className="bg-gray-10 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-body-01">
                        <span className="text-gray-50">Client</span>
                        <span className="font-medium text-gray-100">{clientData.name}</span>
                      </div>
                      <div className="flex justify-between text-body-01">
                        <span className="text-gray-50">Description</span>
                        <span className="font-medium text-gray-100 text-right max-w-[55%]">
                          {invoiceData.description}
                        </span>
                      </div>
                      <div className="flex justify-between text-body-01">
                        <span className="text-gray-50">Amount</span>
                        <span className="tabular-nums font-medium text-gray-100">
                          ₦{priceNum.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {invoiceData.applyVat && (
                        <div className="flex justify-between text-body-01">
                          <span className="text-gray-50">VAT (7.5%)</span>
                          <span className="tabular-nums font-medium text-gray-100">
                            ₦{vatAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-gray-20 pt-2 flex justify-between text-body-01">
                        <span className="text-gray-100 font-semibold">Total</span>
                        <span className="tabular-nums font-semibold text-primary">
                          ₦{total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendInvoice}
                      disabled={isLoading}
                      className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : 'Send Invoice'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={isLoading}
                      className="w-full h-12 border-2 border-gray-30 text-gray-100 font-medium text-body-01 rounded-lg disabled:opacity-50"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="w-full text-center text-body-01 text-gray-50 py-2"
                    >
                      Back
                    </button>
                  </>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
