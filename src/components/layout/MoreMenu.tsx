import { Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ComputerDesktopIcon,
  QuestionMarkCircleIcon,
  CubeIcon,
  ShoppingBagIcon,
  ArchiveBoxIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  ReceiptPercentIcon,
  CreditCardIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useBusinessStore } from '@/store/business.store';
import { BusinessType } from '@/types/enums';

export function MoreMenu() {
  const navigate = useNavigate();
  const open = useUIStore((s) => s.moreMenuOpen);
  const setOpen = useUIStore((s) => s.setMoreMenuOpen);
  const logoutAsync = useAuthStore((s) => s.logoutAsync);
  const business = useBusinessStore((s) => s.business);
  const isGoodsBusiness = business?.type === BusinessType.GOODS;

  const menuItems = useMemo(() => {
    const items: { label: string; icon: typeof UserGroupIcon; onClick: () => void }[] = [
      {
        label: 'Clients',
        icon: UserGroupIcon,
        onClick: () => {
          setOpen(false);
          navigate('/app/clients');
        },
      },
    ];

    items.push(
      {
        label: 'Transactions',
        icon: BanknotesIcon,
        onClick: () => {
          setOpen(false);
          navigate('/app/transactions');
        },
      },
      {
        label: 'Income Statement',
        icon: DocumentChartBarIcon,
        onClick: () => {
          setOpen(false);
          navigate('/app/income-statement');
        },
      },
      {
        label: 'Tax Overview',
        icon: ReceiptPercentIcon,
        onClick: () => {
          setOpen(false);
          navigate('/app/tax-overview');
        },
      },
    );

    if (isGoodsBusiness) {
      items.push(
        {
          label: 'Products',
          icon: CubeIcon,
          onClick: () => {
            setOpen(false);
            navigate('/app/products');
          },
        },
        {
          label: 'Point of Sale',
          icon: ShoppingCartIcon,
          onClick: () => {
            setOpen(false);
            navigate('/app/pos');
          },
        },
        {
          label: 'Orders',
          icon: ShoppingBagIcon,
          onClick: () => {
            setOpen(false);
            navigate('/app/orders');
          },
        },
        {
          label: 'Inventory',
          icon: ArchiveBoxIcon,
          onClick: () => {
            setOpen(false);
            navigate('/app/stock');
          },
        },
      );
    }

    items.push(
      {
        label: 'Payment Settings',
        icon: CreditCardIcon,
        onClick: () => {
          setOpen(false);
          navigate('/app/payment-settings');
        },
      },
      {
        label: 'Billing & Subscription',
        icon: SparklesIcon,
        onClick: () => {
          setOpen(false);
          navigate('/app/billing');
        },
      },
      {
        label: 'Settings',
        icon: Cog6ToothIcon,
        onClick: () => {
          setOpen(false);
          navigate('/app/settings');
        },
      },
      {
        label: 'Help Center',
        icon: QuestionMarkCircleIcon,
        onClick: () => {
          setOpen(false);
          navigate('/app/help');
        },
      },
      {
        label: 'Desktop Version',
        icon: ComputerDesktopIcon,
        onClick: () => {
          setOpen(false);
          const webUrl = import.meta.env.VITE_WEB_APP_URL || 'https://app.accurify.co';
          window.location.href = webUrl;
        },
      },
    );

    return items;
  }, [isGoodsBusiness, navigate, setOpen]);

  const handleLogout = async () => {
    setOpen(false);
    await logoutAsync();
    navigate('/login', { replace: true });
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={() => setOpen(false)} className="relative z-[60]">
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
                  More
                </Dialog.Title>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-gray-50 active:bg-gray-10 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="flex items-center gap-4 w-full p-3 rounded-lg active:bg-gray-10 transition-colors text-left"
                  >
                    <item.icon className="w-5 h-5 text-gray-60" />
                    <span className="text-body-01 text-gray-100">
                      {item.label}
                    </span>
                  </button>
                ))}

                <div className="border-t border-gray-20 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 w-full p-3 rounded-lg active:bg-danger-light transition-colors text-left"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-danger" />
                    <span className="text-body-01 text-danger">Sign Out</span>
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
