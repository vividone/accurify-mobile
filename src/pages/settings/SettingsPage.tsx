import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useBusinessStore } from '@/store/business.store';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import {
  BuildingOffice2Icon,
  UserIcon,
  ComputerDesktopIcon,
  ArrowRightOnRectangleIcon,
  ArrowDownTrayIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

export function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutAsync = useAuthStore((s) => s.logoutAsync);
  const business = useBusinessStore((s) => s.business);

  const handleLogout = async () => {
    await logoutAsync();
    navigate('/login', { replace: true });
  };

  const { canInstall, isInstalled, install } = usePWAInstall();
  const webUrl = import.meta.env.VITE_WEB_APP_URL || 'https://app.accurify.co';

  return (
    <>
      <PageHeader title="Settings" backTo="/app/dashboard" />
      <div className="page-content space-y-4">
        {/* Business info */}
        {business && (
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <BuildingOffice2Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-01 font-medium text-gray-100">
                  {business.name}
                </p>
                <p className="text-label-01 text-gray-50 truncate">
                  {business.email || business.phone || 'Business'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Account */}
        <Card padding={false}>
          <div className="px-4 py-3 border-b border-gray-10">
            <p className="text-label-01 text-gray-50 font-medium">Account</p>
          </div>
          <div className="divide-y divide-gray-10">
            <div className="flex items-center gap-3 px-4 py-3">
              <UserIcon className="w-5 h-5 text-gray-50" />
              <div className="flex-1">
                <p className="text-body-01 text-gray-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-label-01 text-gray-50">{user?.email}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Help Center & Desktop Version */}
        <Card padding={false}>
          <div className="divide-y divide-gray-10">
            <button
              onClick={() => navigate('/app/help')}
              className="flex items-center gap-3 px-4 py-3 w-full"
            >
              <QuestionMarkCircleIcon className="w-5 h-5 text-gray-50" />
              <span className="flex-1 text-body-01 text-gray-100 text-left">
                Help Center
              </span>
              <ChevronRightIcon className="w-4 h-4 text-gray-40" />
            </button>
            <a
              href={webUrl}
              className="flex items-center gap-3 px-4 py-3"
            >
              <ComputerDesktopIcon className="w-5 h-5 text-gray-50" />
              <span className="flex-1 text-body-01 text-gray-100">
                View Desktop Version
              </span>
              <ChevronRightIcon className="w-4 h-4 text-gray-40" />
            </a>
          </div>
        </Card>

        {/* Install App */}
        {canInstall && !isInstalled && (
          <Card padding={false}>
            <button
              onClick={install}
              className="flex items-center gap-3 px-4 py-3 w-full"
            >
              <ArrowDownTrayIcon className="w-5 h-5 text-primary" />
              <span className="flex-1 text-body-01 text-gray-100 text-left">
                Install App
              </span>
              <ChevronRightIcon className="w-4 h-4 text-gray-40" />
            </button>
          </Card>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 bg-white rounded-lg shadow-card active:bg-danger-light transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-danger" />
          <span className="text-body-01 text-danger font-medium">
            Sign Out
          </span>
        </button>

        {/* App info */}
        <p className="text-center text-helper-01 text-gray-40 pt-4">
          Accurify Mobile v0.1.0
        </p>
      </div>
    </>
  );
}
