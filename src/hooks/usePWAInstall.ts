import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Detects if the app can be installed as a PWA and provides an install trigger.
 *
 * On Android/Chrome: captures the `beforeinstallprompt` event.
 * On iOS Safari: detects standalone capability and shows manual instructions.
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as Record<string, unknown>).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as Record<string, unknown>).MSStream;
    setIsIOS(isiOS);

    // Listen for the install prompt (Chrome/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detect if installed after prompt
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
    return outcome === 'accepted';
  }, [deferredPrompt]);

  return {
    /** true when the native install prompt is available (Android/Chrome) */
    canInstall: !!deferredPrompt,
    /** true on iOS Safari where manual Add to Home Screen is needed */
    isIOS: isIOS && !isInstalled,
    /** true when already running as an installed PWA */
    isInstalled,
    /** Trigger the native install prompt. Returns true if accepted. */
    install,
  };
}
