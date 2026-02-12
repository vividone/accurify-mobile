import { useRegisterSW } from 'virtual:pwa-register/react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // Check for updates every 60 seconds
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="bg-primary px-4 py-3 flex items-center gap-3">
      <ArrowPathIcon className="w-5 h-5 text-white flex-shrink-0" />
      <p className="text-body-01 text-white flex-1">
        A new version is available
      </p>
      <button
        onClick={() => updateServiceWorker(true)}
        className="px-3 py-1 bg-white text-primary text-label-01 font-medium rounded-lg flex-shrink-0"
      >
        Update
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="p-0.5 text-white/70 active:text-white flex-shrink-0"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
