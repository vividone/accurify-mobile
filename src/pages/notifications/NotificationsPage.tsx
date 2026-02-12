import { useNotifications, useMarkAllNotificationsAsRead, useMarkNotificationAsRead } from '@/queries/notification.queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatRelative } from '@/utils/date';
import { BellIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export function NotificationsPage() {
  const { data: notifData, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsAsRead();
  const markRead = useMarkNotificationAsRead();
  const notifications = notifData?.content ?? [];

  return (
    <>
      <PageHeader
        title="Notifications"
        backTo="/app/dashboard"
        actions={
          notifications.length > 0 ? (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-label-01 text-primary font-medium"
            >
              Mark all read
            </button>
          ) : undefined
        }
      />
      <div className="page-content">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={BellIcon}
            title="No notifications"
            description="You're all caught up!"
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markRead.mutate(notif.id);
                }}
                className={clsx(!notif.read && 'border-l-4 border-primary')}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={clsx(
                      'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                      notif.read ? 'bg-transparent' : 'bg-primary'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={clsx(
                        'text-body-01',
                        notif.read
                          ? 'text-gray-60'
                          : 'text-gray-100 font-medium'
                      )}
                    >
                      {notif.title}
                    </p>
                    {notif.message && (
                      <p className="text-label-01 text-gray-50 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                    )}
                    <p className="text-helper-01 text-gray-40 mt-1">
                      {formatRelative(notif.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
