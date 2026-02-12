import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { XMarkIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import accurifyIcon from '@/assets/accurify-icon.svg';

const DISMISS_KEY = 'pwa-install-dismissed';

export function InstallBanner() {
  const { canInstall, isIOS, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (!stored) return false;
    // Re-show after 7 days
    return Date.now() - Number(stored) < 7 * 24 * 60 * 60 * 1000;
  });
  const [showIOSTip, setShowIOSTip] = useState(false);

  if (isInstalled || dismissed) return null;
  if (!canInstall && !isIOS) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (canInstall) {
      await install();
    } else if (isIOS) {
      setShowIOSTip(true);
    }
  };

  return (
    <>
      {/* Banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-primary-50 border-b border-primary/20">
        <img src={accurifyIcon} alt="" className="w-8 h-8 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-body-01 font-medium text-gray-100">
            Install Accurify
          </p>
          <p className="text-label-01 text-gray-60">
            {isIOS ? 'Add to your home screen' : 'Get the full app experience'}
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-primary text-white text-label-01 font-medium rounded-lg whitespace-nowrap"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-gray-50 flex-shrink-0"
          aria-label="Dismiss"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* iOS Add to Home Screen instructions overlay */}
      {showIOSTip && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setShowIOSTip(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-2xl p-6 pb-10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-heading-03 text-gray-100">
                Install Accurify
              </h3>
              <button
                onClick={() => setShowIOSTip(false)}
                className="p-1 text-gray-50"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-label-01 font-bold flex-shrink-0">
                  1
                </span>
                <p className="text-body-01 text-gray-70 pt-0.5">
                  Tap the <ArrowUpOnSquareIcon className="inline w-5 h-5 text-primary -mt-0.5" /> Share button in Safari
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-label-01 font-bold flex-shrink-0">
                  2
                </span>
                <p className="text-body-01 text-gray-70 pt-0.5">
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-label-01 font-bold flex-shrink-0">
                  3
                </span>
                <p className="text-body-01 text-gray-70 pt-0.5">
                  Tap <strong>"Add"</strong> to install
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSTip(false)}
              className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
