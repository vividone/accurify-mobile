import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CheckCircleIcon,
  ShareIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { productsApi } from '@/services/api/products.api';
import { useUIStore } from '@/store/ui.store';
import { useQueryClient } from '@tanstack/react-query';
import { useBusinessStore } from '@/store/business.store';
import { markFastPathCompleted } from '@/utils/fast-path.utils';
import { ProductCategory } from '@/types/enums';
import { useMyStore } from '@/queries/store.queries';

const TOTAL_STEPS = 3;

interface ProductForm {
  name: string;
  price: string;
  sku: string;
}

interface QuickStoreFastPathWizardProps {
  open: boolean;
  onClose: () => void;
}

export function QuickStoreFastPathWizard({ open, onClose }: QuickStoreFastPathWizardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);
  const business = useBusinessStore((s) => s.business);

  const { data: store } = useMyStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState<ProductForm>({
    name: '',
    price: '',
    sku: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});

  const storeUrl = store?.publicUrl ?? '';

  const handleClose = () => {
    setCurrentStep(0);
    setForm({ name: '', price: '', sku: '' });
    setErrors({});
    setCopied(false);
    onClose();
  };

  const handleAddProduct = async () => {
    const newErrors: Partial<Record<keyof ProductForm, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.price || parseFloat(form.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const unitPriceKobo = Math.round(parseFloat(form.price) * 100);

      await productsApi.create({
        name: form.name.trim(),
        unitPrice: unitPriceKobo,
        sku: form.sku.trim() || undefined,
        category: ProductCategory.OTHER,
        isPublicVisible: true,
      });

      // Mark fast path completed
      if (business?.id) {
        markFastPathCompleted(business.id, 'quickstore');
      }

      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['onboarding'] });

      showNotification('Success', 'Product added to your store', 'success');
      setCurrentStep(1);
    } catch {
      showNotification('Error', 'Failed to add product. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!storeUrl) return;
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      showNotification('Copied!', 'Store link copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showNotification('Error', 'Failed to copy link', 'error');
    }
  };

  const handleShareWhatsApp = () => {
    if (!storeUrl) return;
    const message = encodeURIComponent(
      `Hi! Check out my online store: ${storeUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleViewStoreDashboard = () => {
    handleClose();
    navigate('/app/store');
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
                    {currentStep === 0
                      ? 'Add your first product'
                      : currentStep === 1
                      ? 'Your store is live!'
                      : 'Share your store'}
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
                {/* STEP 0: Add product */}
                {currentStep === 0 && (
                  <>
                    <p className="text-body-01 text-gray-50">
                      Add a product to your QuickStore and customers can order online immediately.
                    </p>

                    <div>
                      <label className={labelClass}>
                        Product Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Handmade Bag"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className={inputClass}
                        autoFocus
                      />
                      {errors.name && <p className={errorClass}>{errors.name}</p>}
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
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        className={inputClass}
                      />
                      {errors.price && <p className={errorClass}>{errors.price}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>SKU (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. BAG-001"
                        value={form.sku}
                        onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                        className={inputClass}
                      />
                      <p className="text-helper-01 text-gray-40 mt-1">
                        Stock Keeping Unit — helps you track inventory
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddProduct}
                      disabled={isLoading}
                      className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50 mt-2"
                    >
                      {isLoading ? 'Adding...' : 'Add to Store'}
                    </button>
                  </>
                )}

                {/* STEP 1: Store live + copy link */}
                {currentStep === 1 && (
                  <>
                    <div className="flex flex-col items-center py-4 text-center">
                      <CheckCircleIcon className="w-14 h-14 text-success mx-auto mb-3" />
                      <h2 className="text-heading-02 text-gray-100 mb-1">Your store is live!</h2>
                      <p className="text-body-01 text-gray-50">
                        <strong>{form.name}</strong> is now visible on your public storefront.
                        Share the link with customers.
                      </p>
                    </div>

                    {storeUrl && (
                      <div className="bg-gray-10 rounded-xl p-3">
                        <p className="text-label-01 text-gray-50 mb-1">Your store link</p>
                        <p className="text-body-01 text-primary font-medium break-all">
                          {storeUrl}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      disabled={!storeUrl}
                      className="w-full h-12 border-2 border-primary text-primary font-medium text-body-01 rounded-lg flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg"
                    >
                      Share Your Store
                    </button>

                    <button
                      type="button"
                      onClick={handleViewStoreDashboard}
                      className="w-full text-center text-body-01 text-gray-50 py-2"
                    >
                      View Store Dashboard
                    </button>
                  </>
                )}

                {/* STEP 2: Share */}
                {currentStep === 2 && (
                  <>
                    <p className="text-body-01 text-gray-50 text-center">
                      Let your customers know your store is open for business!
                    </p>

                    {storeUrl && (
                      <div className="bg-gray-10 rounded-xl p-3">
                        <p className="text-label-01 text-gray-50 mb-1">Your store link</p>
                        <p className="text-body-01 text-primary font-medium break-all">
                          {storeUrl}
                        </p>
                      </div>
                    )}

                    {/* WhatsApp share */}
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      disabled={!storeUrl}
                      className="w-full h-12 bg-[#25D366] text-white font-medium text-body-01 rounded-lg flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Share on WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      disabled={!storeUrl}
                      className="w-full h-12 border-2 border-gray-30 text-gray-100 font-medium text-body-01 rounded-lg flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>

                    {typeof navigator !== 'undefined' && navigator.share && storeUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          navigator.share({ title: 'My Store', url: storeUrl })
                        }
                        className="w-full h-12 border-2 border-gray-30 text-gray-100 font-medium text-body-01 rounded-lg flex items-center justify-center gap-2"
                      >
                        <ShareIcon className="w-4 h-4" />
                        Share via...
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleViewStoreDashboard}
                      className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg"
                    >
                      View Store Dashboard
                    </button>

                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full text-center text-body-01 text-gray-50 py-2"
                    >
                      Done
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
