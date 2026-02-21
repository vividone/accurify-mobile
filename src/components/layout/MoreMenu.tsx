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
  BuildingStorefrontIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  ReceiptPercentIcon,
  CreditCardIcon,
  SparklesIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useBusinessStore } from '@/store/business.store';
import { BusinessType } from '@/types/enums';

interface MenuItem {
  label: string;
  icon: typeof UserGroupIcon;
  onClick: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export function MoreMenu() {
  const navigate = useNavigate();
  const open = useUIStore((s) => s.moreMenuOpen);
  const setOpen = useUIStore((s) => s.setMoreMenuOpen);
  const logoutAsync = useAuthStore((s) => s.logoutAsync);
  const business = useBusinessStore((s) => s.business);
  const isGoodsBusiness = business?.type === BusinessType.GOODS;

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const sections = useMemo(() => {
    const result: MenuSection[] = [];

    // Records — available for all business types
    result.push({
      title: 'Records',
      items: [
        { label: 'Clients', icon: UserGroupIcon, onClick: () => go('/app/clients') },
        { label: 'Transactions', icon: BanknotesIcon, onClick: () => go('/app/transactions') },
      ],
    });

    // Reports — available for all business types
    result.push({
      title: 'Reports',
      items: [
        { label: 'Income Statement', icon: DocumentChartBarIcon, onClick: () => go('/app/income-statement') },
        { label: 'AR Aging', icon: ClockIcon, onClick: () => go('/app/ar-aging') },
        { label: 'AP Aging', icon: ClockIcon, onClick: () => go('/app/ap-aging') },
        { label: 'Tax Overview', icon: ReceiptPercentIcon, onClick: () => go('/app/tax-overview') },
        { label: 'Fixed Assets', icon: CubeIcon, onClick: () => go('/app/assets') },
      ],
    });

    // Inventory & Store — GOODS only
    if (isGoodsBusiness) {
      result.push({
        title: 'Inventory & Store',
        items: [
          { label: 'Store Dashboard', icon: BuildingStorefrontIcon, onClick: () => go('/app/store') },
          { label: 'Products', icon: CubeIcon, onClick: () => go('/app/products') },
          { label: 'Inventory', icon: ArchiveBoxIcon, onClick: () => go('/app/stock') },
          { label: 'Point of Sale', icon: ShoppingCartIcon, onClick: () => go('/app/pos') },
          { label: 'Orders', icon: ShoppingBagIcon, onClick: () => go('/app/orders') },
        ],
      });
    }

    // Account & Billing — available for all business types
    result.push({
      title: 'Account',
      items: [
        { label: 'Payment Settings', icon: CreditCardIcon, onClick: () => go('/app/payment-settings') },
        { label: 'Billing & Subscription', icon: SparklesIcon, onClick: () => go('/app/billing') },
        { label: 'Settings', icon: Cog6ToothIcon, onClick: () => go('/app/settings') },
        { label: 'Help Center', icon: QuestionMarkCircleIcon, onClick: () => go('/app/help') },
        {
          label: 'Desktop Version',
          icon: ComputerDesktopIcon,
          onClick: () => {
            setOpen(false);
            const webUrl = import.meta.env.VITE_WEB_APP_URL || 'https://app.accurify.co';
            window.location.href = webUrl;
          },
        },
      ],
    });

    return result;
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
              className="bg-white rounded-t-2xl max-h-[80vh] flex flex-col"
              style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1rem)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-20 flex-shrink-0">
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

              <div className="overflow-y-auto flex-1 px-4 pt-2 pb-2">
                {sections.map((section, index) => (
                  <div key={section.title}>
                    {index > 0 && <div className="border-t border-gray-20 my-2" />}
                    <p className="text-helper-01 text-gray-40 font-medium uppercase tracking-wider px-3 py-2">
                      {section.title}
                    </p>
                    {section.items.map((item) => (
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
                  </div>
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
