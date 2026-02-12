import { Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ShoppingCartIcon,
  UserPlusIcon,
  BanknotesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useUIStore } from '@/store/ui.store';
import { useBusinessStore } from '@/store/business.store';
import { BusinessType } from '@/types/enums';

export function CreateActionSheet() {
  const navigate = useNavigate();
  const open = useUIStore((s) => s.createSheetOpen);
  const setOpen = useUIStore((s) => s.setCreateSheetOpen);
  const business = useBusinessStore((s) => s.business);
  const isGoodsBusiness = business?.type === BusinessType.GOODS;

  const actions = useMemo(() => {
    const items = [
      {
        label: 'New Invoice',
        description: 'Create and send an invoice to a client',
        icon: DocumentTextIcon,
        onClick: () => {
          setOpen(false);
          navigate('/app/invoices/new');
        },
      },
      {
        label: 'New Bill',
        description: 'Record a bill from a supplier',
        icon: ClipboardDocumentListIcon,
        onClick: () => {
          setOpen(false);
          navigate('/app/bills/new');
        },
      },
      {
        label: 'New Client',
        description: 'Add a new client to your business',
        icon: UserPlusIcon,
        onClick: () => {
          setOpen(false);
          navigate('/app/clients/new');
        },
      },
      {
        label: 'New Transaction',
        description: 'Record an income or expense',
        icon: BanknotesIcon,
        onClick: () => {
          setOpen(false);
          navigate('/app/transactions/new');
        },
      },
    ];

    if (isGoodsBusiness) {
      items.push(
        {
          label: 'New Product',
          description: 'Add a product to your inventory',
          icon: CubeIcon,
          onClick: () => {
            setOpen(false);
            navigate('/app/products/new');
          },
        },
        {
          label: 'New POS Sale',
          description: 'Quick sale from point of sale',
          icon: ShoppingCartIcon,
          onClick: () => {
            setOpen(false);
            navigate('/app/pos');
          },
        },
      );
    }

    return items;
  }, [isGoodsBusiness, navigate, setOpen]);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={() => setOpen(false)} className="relative z-[60]">
        {/* Backdrop */}
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

        {/* Panel */}
        <div className="fixed inset-x-0 bottom-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel
              className="bg-white rounded-t-2xl"
              style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1rem)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-20">
                <Dialog.Title className="text-heading-02 text-gray-100">
                  Create New
                </Dialog.Title>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-gray-50 active:bg-gray-10 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                {actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="flex items-center gap-4 w-full p-4 rounded-lg active:bg-gray-10 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="block text-body-01 font-medium text-gray-100">
                        {action.label}
                      </span>
                      <span className="block text-helper-01 text-gray-50">
                        {action.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
