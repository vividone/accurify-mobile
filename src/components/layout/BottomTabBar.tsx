import { useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
} from '@heroicons/react/24/solid';
import { useUIStore } from '@/store/ui.store';
import clsx from 'clsx';

interface TabItem {
  path: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  activeIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const tabs: TabItem[] = [
  {
    path: '/app/dashboard',
    label: 'Home',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    path: '/app/invoices',
    label: 'Invoices',
    icon: DocumentTextIcon,
    activeIcon: DocumentTextIconSolid,
  },
  // Placeholder for center FAB
  {
    path: '__create__',
    label: 'Create',
    icon: PlusIcon,
    activeIcon: PlusIcon,
  },
  {
    path: '/app/bills',
    label: 'Bills',
    icon: ClipboardDocumentListIcon,
    activeIcon: ClipboardDocumentListIconSolid,
  },
  {
    path: '__more__',
    label: 'More',
    icon: EllipsisHorizontalIcon,
    activeIcon: EllipsisHorizontalIcon,
  },
];

export function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const setCreateSheetOpen = useUIStore((s) => s.setCreateSheetOpen);
  const setMoreMenuOpen = useUIStore((s) => s.setMoreMenuOpen);

  const isActive = (path: string) => {
    if (path === '/app/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleTabPress = (tab: TabItem) => {
    if (tab.path === '__create__') {
      setCreateSheetOpen(true);
    } else if (tab.path === '__more__') {
      setMoreMenuOpen(true);
    } else {
      navigate(tab.path);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-20 shadow-bottom-bar"
      style={{ paddingBottom: 'var(--safe-area-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          if (tab.path === '__create__') {
            return (
              <button
                key="create"
                onClick={() => handleTabPress(tab)}
                className="flex items-center justify-center -mt-4 w-14 h-14 bg-primary rounded-full shadow-lg active:bg-primary-600 transition-colors"
              >
                <PlusIcon className="w-7 h-7 text-white" />
              </button>
            );
          }

          const active = tab.path !== '__more__' && isActive(tab.path);
          const Icon = active ? tab.activeIcon : tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => handleTabPress(tab)}
              className={clsx(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:bg-gray-10 transition-colors',
                active ? 'text-primary' : 'text-gray-50'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
