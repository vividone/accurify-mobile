import { Outlet } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { BottomTabBar } from './BottomTabBar';
import { CreateActionSheet } from './CreateActionSheet';
import { MoreMenu } from './MoreMenu';
import { Toast } from '@/components/ui/Toast';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { InstallBanner } from '@/components/ui/InstallBanner';

export function MobileShell() {
  return (
    <div className="flex flex-col h-full">
      <MobileHeader />
      <InstallBanner />
      <main className="flex-1 overflow-y-auto bg-gray-10">
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
