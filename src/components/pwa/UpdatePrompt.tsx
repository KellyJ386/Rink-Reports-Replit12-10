import { RefreshCw, X } from 'lucide-react';
import { Button } from '../ui';
import { usePWA } from '../../hooks/usePWA';

export function UpdatePrompt() {
  const { needRefresh, updateServiceWorker, dismissUpdate } = usePWA();

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-action text-white rounded-xl shadow-lg p-4 z-50 animate-slide-up">
      <button
        onClick={dismissUpdate}
        className="absolute top-2 right-2 p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <RefreshCw className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold">Update Available</h3>
          <p className="text-sm text-white/80 mt-1">
            A new version is available. Update now for the latest features.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white text-action hover:bg-white/90"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => updateServiceWorker(true)}
            >
              Update
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={dismissUpdate}
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
