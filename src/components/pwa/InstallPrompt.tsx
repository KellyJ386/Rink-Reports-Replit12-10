import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '../ui';
import { usePWA } from '../../hooks/usePWA';

export function InstallPrompt() {
  const { canInstall, installApp, isInstalled } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user has dismissed before
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional initialization from localStorage
        setIsDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsDismissed(true);
    }
  };

  // Don't show if already installed, can't install, or dismissed
  if (isInstalled || !canInstall || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-lg border border-wolf-200 p-4 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-lg text-wolf-400 hover:text-wolf-600 hover:bg-wolf-100"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-navy rounded-xl">
          <Smartphone className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold text-navy">Install MFO Ice Tech</h3>
          <p className="text-sm text-wolf-600 mt-1">
            Install our app for quick access and offline support
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleInstall}
            >
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
