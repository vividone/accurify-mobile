import { useNavigate } from 'react-router-dom';
import { useBusinessStore } from '@/store/business.store';
import { useUnreadNotificationCount } from '@/queries/notification.queries';
import { BellIcon } from '@heroicons/react/24/outline';
import accurifyIcon from '@/assets/accurify-icon.svg';

export function MobileHeader() {
  const navigate = useNavigate();
  const business = useBusinessStore((s) => s.business);
  const { data: notifData } = useUnreadNotificationCount();
  const unreadCount = notifData?.unreadCount ?? 0;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-white border-b border-gray-20"
      style={{ paddingTop: 'var(--safe-area-top)' }}
    >
      {/* Logo + Business Name */}
      <div className="flex items-center gap-2 min-w-0">
        <img src={accurifyIcon} alt="Accurify" className="h-7 w-auto flex-shrink-0" />
        <span className="text-body-01 font-semibold text-gray-100 truncate">
          {business?.name || 'Accurify'}
        </span>
      </div>

      {/* Notification bell */}
      <button
        onClick={() => navigate('/app/notifications')}
        className="relative p-2 -mr-2 text-gray-70 active:bg-gray-10 rounded-full"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-danger rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}
