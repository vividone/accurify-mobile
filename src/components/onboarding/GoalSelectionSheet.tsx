import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useSetOnboardingGoal } from '@/queries/onboarding.queries';
import { useUIStore } from '@/store/ui.store';
import type { OnboardingGoal } from '@/types/onboarding.types';

interface GoalOption {
  goal: OnboardingGoal;
  icon: typeof DocumentTextIcon;
  title: string;
  description: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    goal: 'SEND_INVOICES',
    icon: DocumentTextIcon,
    title: 'Send invoices & get paid',
    description: 'Create professional invoices and track payments from clients',
  },
  {
    goal: 'TRACK_EXPENSES',
    icon: BanknotesIcon,
    title: 'Track expenses & cash flow',
    description: 'Record and categorize your business income and spending',
  },
  {
    goal: 'MANAGE_TAXES',
    icon: ReceiptPercentIcon,
    title: 'Stay tax-compliant',
    description: 'Monitor VAT, WHT and CIT obligations automatically',
  },
  {
    goal: 'FULL_ACCOUNTING',
    icon: ChartBarIcon,
    title: 'Full accounting & reporting',
    description: 'Complete double-entry bookkeeping with financial statements',
  },
];

interface GoalSelectionSheetProps {
  open: boolean;
  onClose: () => void;
  onGoalSelected: (goal: OnboardingGoal) => void;
}

export function GoalSelectionSheet({ open, onClose, onGoalSelected }: GoalSelectionSheetProps) {
  const [selected, setSelected] = useState<OnboardingGoal | null>(null);
  const setGoal = useSetOnboardingGoal();
  const showNotification = useUIStore((s) => s.showNotification);

  const handleGetStarted = async () => {
    if (!selected) return;
    try {
      await setGoal.mutateAsync(selected);
      onGoalSelected(selected);
    } catch (err: unknown) {
      console.error('Failed to save goal:', err);
      let message = 'Failed to save your goal. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        const status = axiosErr.response?.status;
        const apiMsg = axiosErr.response?.data?.message;
        if (status === 403) {
          message = 'You do not have permission to set a goal. Only account owners can do this.';
        } else if (status === 401) {
          message = 'Your session has expired. Please log in again.';
        } else if (apiMsg) {
          message = apiMsg;
        }
      }
      showNotification('Error', message, 'error');
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[60]">
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
                <div>
                  <Dialog.Title className="text-heading-02 text-gray-100">
                    What's your main goal?
                  </Dialog.Title>
                  <p className="text-helper-01 text-gray-50 mt-0.5">
                    We'll personalise your experience
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-gray-50 active:bg-gray-10 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Goal options */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
                {GOAL_OPTIONS.map((option) => {
                  const isSelected = selected === option.goal;
                  return (
                    <button
                      key={option.goal}
                      type="button"
                      onClick={() => setSelected(option.goal)}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary-50'
                          : 'border-gray-20 bg-white active:bg-gray-10'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-primary' : 'bg-gray-10'
                        }`}
                      >
                        <option.icon
                          className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-60'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-body-01 font-medium ${
                            isSelected ? 'text-primary' : 'text-gray-100'
                          }`}
                        >
                          {option.title}
                        </p>
                        <p className="text-helper-01 text-gray-50 mt-0.5">{option.description}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer actions */}
              <div className="px-5 pb-2 space-y-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleGetStarted}
                  disabled={!selected || setGoal.isPending}
                  className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-40 transition-opacity"
                >
                  {setGoal.isPending ? 'Saving...' : 'Get Started'}
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full text-center text-body-01 text-gray-50 py-2"
                >
                  Skip for now
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
