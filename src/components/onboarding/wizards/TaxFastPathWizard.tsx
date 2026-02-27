import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { useBusinessStore } from '@/store/business.store';
import { markFastPathCompleted } from '@/utils/fast-path.utils';

const TOTAL_STEPS = 2;

const TAX_INFO_CARDS = [
  {
    title: 'VAT — 7.5%',
    description: 'Applies above ₦25,000,000 annual revenue. You must register with FIRS and charge VAT on invoices.',
    highlight: '₦25M threshold',
  },
  {
    title: 'WHT — 5% / 10%',
    description:
      '5% on services and contracts. 10% on professional fees. Deducted at source by the payer.',
    highlight: 'Deducted by payer',
  },
  {
    title: 'CIT — Corporate Income Tax',
    description: 'Applies above ₦50,000,000 annual revenue. Computed on taxable profit.',
    highlight: '₦50M threshold',
  },
];

interface TaxFastPathWizardProps {
  open: boolean;
  onClose: () => void;
}

export function TaxFastPathWizard({ open, onClose }: TaxFastPathWizardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const business = useBusinessStore((s) => s.business);
  const [currentStep, setCurrentStep] = useState(0);

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const handleNext = () => {
    // Mark fast path completed when moving to step 1
    if (business?.id) {
      markFastPathCompleted(business.id, 'tax');
    }
    queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    setCurrentStep(1);
  };

  const handleOpenTaxOverview = () => {
    handleClose();
    navigate('/app/tax-overview');
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
              <div className="flex items-start justify-between px-5 py-4 border-b border-gray-20 flex-shrink-0">
                <div>
                  <Dialog.Title className="text-heading-02 text-gray-100">
                    {currentStep === 0 ? 'Your tax obligations' : 'Tax tracking is active'}
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
                {/* STEP 0: Tax obligations overview */}
                {currentStep === 0 && (
                  <>
                    <p className="text-body-01 text-gray-50">
                      As a Nigerian business, here are the key taxes that may apply to you:
                    </p>

                    <div className="space-y-3">
                      {TAX_INFO_CARDS.map((card) => (
                        <div key={card.title} className="bg-blue-50 rounded-lg px-3 py-2.5">
                          <div className="flex items-start gap-2">
                            <InformationCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-body-01 font-semibold text-blue-900">
                                {card.title}
                              </p>
                              <p className="text-helper-01 text-blue-700 mt-0.5">
                                {card.description}
                              </p>
                              <span className="inline-block mt-1.5 text-[0.65rem] font-semibold text-blue-600 bg-blue-100 rounded-full px-2 py-0.5">
                                {card.highlight}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-yellow-50 rounded-lg px-3 py-2.5">
                      <p className="text-helper-01 text-yellow-800">
                        <strong>Note:</strong> Accurify automatically calculates your tax position
                        based on your revenue and transactions. We'll alert you when you're
                        approaching any threshold.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg mt-2"
                    >
                      I understand — Continue
                    </button>
                  </>
                )}

                {/* STEP 1: Tax tracking active */}
                {currentStep === 1 && (
                  <div className="flex flex-col items-center py-8 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
                    <h2 className="text-heading-02 text-gray-100 mb-2">Tax tracking is active!</h2>
                    <p className="text-body-01 text-gray-50 mb-6">
                      Accurify is now monitoring your revenue and expenses against Nigerian tax
                      thresholds. You'll be notified when action is needed.
                    </p>

                    <div className="w-full space-y-3">
                      <div className="bg-green-50 rounded-xl p-4 text-left space-y-2">
                        <p className="text-body-01 font-medium text-green-800">
                          What Accurify tracks for you:
                        </p>
                        <ul className="space-y-1">
                          <li className="text-helper-01 text-green-700">
                            • VAT collected vs threshold
                          </li>
                          <li className="text-helper-01 text-green-700">
                            • WHT deducted on invoices
                          </li>
                          <li className="text-helper-01 text-green-700">
                            • CIT liability estimation
                          </li>
                          <li className="text-helper-01 text-green-700">
                            • Monthly tax summary reports
                          </li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenTaxOverview}
                        className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg"
                      >
                        Open Tax Overview
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
