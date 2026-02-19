import { Outlet } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { BottomTabBar } from './BottomTabBar';
import { CreateActionSheet } from './CreateActionSheet';
import { MoreMenu } from './MoreMenu';
import { Toast } from '@/components/ui/Toast';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { InstallBanner } from '@/components/ui/InstallBanner';
import { UpdateBanner } from '@/components/ui/UpdateBanner';

export function MobileShell() {
  return (
    <div className="flex flex-col h-full">
      <MobileHeader />
      <UpdateBanner />
      <InstallBanner />
      <main
        className="flex-1 overflow-y-auto bg-gray-10"
        style={{ paddingBottom: 'calc(var(--bottom-bar-height) + var(--safe-area-bottom) + 1rem)' }}
      >
        <Outlet />
      </main>
      <BottomTabBar />
      <CreateActionSheet />
      <MoreMenu />
      <Toast />
      <UpgradeModal />
    </div>
  );
}
