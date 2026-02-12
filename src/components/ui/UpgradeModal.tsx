import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '@/store/ui.store';

const messages: Record<string, { title: string; description: string }> = {
  invoiceLimitReached: {
    title: 'Invoice Limit Reached',
    description: 'Upgrade to Premium to create unlimited invoices.',
  },
  clientLimitReached: {
    title: 'Client Limit Reached',
    description: 'Upgrade to Premium to add unlimited clients.',
  },
  bankSyncLocked: {
    title: 'Bank Sync is a Premium Feature',
    description: 'Upgrade to connect your bank accounts automatically.',
  },
  generic: {
    title: 'Upgrade to Premium',
    description: 'Unlock all features and grow your business with Accurify Premium.',
  },
};

export function UpgradeModal() {
  const open = useUIStore((s) => s.upgradeModalOpen);
  const promptType = useUIStore((s) => s.upgradePromptType);
  const setOpen = useUIStore((s) => s.setUpgradeModalOpen);

  const { title, description } = messages[promptType] ?? messages.generic;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={() => setOpen(false)} className="relative z-[70]">
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

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm bg-white rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary-50 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-primary" />
              </div>
              <Dialog.Title className="text-heading-03 text-gray-100 mb-2">
                {title}
              </Dialog.Title>
              <p className="text-body-01 text-gray-60 mb-6">{description}</p>

              <div className="space-y-3">
                <a
                  href={`${import.meta.env.VITE_WEB_APP_URL || 'https://app.accurify.co'}/app/settings/subscription`}
                  className="block w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  Upgrade Now
                </a>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full h-10 text-body-01 text-gray-60 hover:text-gray-100 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
