import { Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useUIStore } from '@/store/ui.store';
import clsx from 'clsx';

const iconMap = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const styleMap = {
  success: 'bg-success-light border-success text-success-dark',
  error: 'bg-danger-light border-danger text-danger-dark',
  warning: 'bg-warning-light border-warning-dark text-warning-dark',
  info: 'bg-info-light border-info text-info',
};

export function Toast() {
  const notification = useUIStore((s) => s.notification);
  const hideNotification = useUIStore((s) => s.hideNotification);

  useEffect(() => {
    if (notification?.open) {
      const timer = setTimeout(hideNotification, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  const kind = notification?.kind ?? 'info';
  const Icon = iconMap[kind];

  return (
    <Transition
      show={notification?.open ?? false}
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0 translate-y-4"
      enterTo="opacity-100 translate-y-0"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-4"
    >
      <div
        className="fixed bottom-20 left-4 right-4 z-[70]"
        style={{ paddingBottom: 'var(--safe-area-bottom)' }}
      >
        <div
          className={clsx(
            'flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-card',
            styleMap[kind]
          )}
        >
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-body-01 font-medium">{notification?.title}</p>
            {notification?.subtitle && (
              <p className="text-helper-01 mt-0.5 opacity-80">
                {notification.subtitle}
              </p>
            )}
          </div>
          <button
            onClick={hideNotification}
            className="p-0.5 flex-shrink-0 opacity-60 active:opacity-100"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>
  );
}
