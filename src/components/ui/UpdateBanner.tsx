import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdateBanner() {
  useRegisterSW({
    // Check for updates every 60 seconds
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 1000);
      }
    },
  });

  // In autoUpdate mode the new service worker activates and reloads
  // automatically — no user-facing banner is needed.
  return null;
}
